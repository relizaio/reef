import silo from '../services/silo'
import utils from '../utils/utils'
import constants from '../utils/constants'
import testAa from '../../local_tests/TestAccounts'

const createInstance = async (siloId: string) => {
    let startTime = (new Date()).getTime()

    const siloEntity = await silo.getSilo(siloId)
    const instanceId = constants.INSTANCE_PREFIX + utils.uuidv4()
    // TODO: instance template should be driven by silo props; possibly allow several instance templates per silo
    await utils.copyDir('./local_tests/azure_k3s_instance', "./tf_space/" + instanceId)

    const instanceTfVarsFile = `./tf_space/${instanceId}/${constants.TF_DEFAULT_TFVARS_FILE}`

    const tfVarsObject: any = {
        "instance_id": instanceId
    }
    siloEntity.properties.forEach(prop => {
        tfVarsObject[prop.key] = prop.value
    })
    utils.saveJsonToFile(instanceTfVarsFile, tfVarsObject)
    console.log(`Creating ${instanceId} instance in ${siloId} silo...`)
    const initializeInstanceCmd =
        `export ARM_CLIENT_ID=${testAa.clientId}; export ARM_CLIENT_SECRET=${testAa.clientSecret}; ` + 
        `export ARM_SUBSCRIPTION_ID=${testAa.subscriptionId}; export ARM_TENANT_ID=${testAa.tenantId}; ` +
        `cd tf_space/${instanceId} && terraform init && terraform plan && terraform apply -auto-approve`
    const initInstanceData = await utils.shellExec('sh', ['-c', initializeInstanceCmd], 15*60*1000)
    console.log(initInstanceData)
    const parsedInstanceOut = utils.parseTfOutput(initInstanceData)
    console.log(parsedInstanceOut)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance create time = " + (allDoneTime - startTime))
}

const destroyInstance = async (instanceId: string) => {
    let startTime = (new Date()).getTime()
    console.log(`Destroying TF instance ${instanceId}...`)
    const instanceDestroyCmd = `cd tf_space/${instanceId} && terraform destroy -auto-approve`
    await utils.shellExec('sh', ['-c', instanceDestroyCmd])
    await utils.deleteDir(`tf_space/${instanceId}`)
    // archiveSiloInDb(siloId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance destroy time = " + (allDoneTime - startTime))
}

export default {
    createInstance,
    destroyInstance
}