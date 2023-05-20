import utils from '../utils/utils'
import { type SiloParams } from '../api/resolvers'
import testAa from '../../local_tests/TestAccounts'
import { Silo, SiloProperty } from '../model/Silo'

const createSilo = async (params: SiloParams) => {
    let startTime = (new Date()).getTime()
    const siloId = 'silo_' + utils.uuidv4()
    await utils.copyDir('./local_tests/azure_k3s_vnet_silo', "./tf_space/" + siloId)
    if (params.type === "azure") {
        const initializeSiloCmd =
            `export ARM_CLIENT_ID=${testAa.clientId}; export ARM_CLIENT_SECRET=${testAa.clientSecret}; ` + 
            `export ARM_SUBSCRIPTION_ID=${testAa.subscriptionId}; export ARM_TENANT_ID=${testAa.tenantId}; ` +
            `cd tf_space/${siloId} && terraform init ` +
            `&& terraform plan -var="silo_identifier=${siloId}" -var="resource_group_name=${params.group}" `+
            `&& terraform apply -auto-approve -var="silo_identifier=${siloId}" -var="resource_group_name=${params.group}"`
        let initSiloData = await utils.shellExec('sh', ['-c', initializeSiloCmd], 15*60*1000)
        const parsedSiloOut = utils.parseTfOutput(initSiloData)
        const outSiloProps : SiloProperty[] = []
        Object.keys(parsedSiloOut).forEach((key: string) => {
            const sp : SiloProperty = {
                key,
                value: parsedSiloOut[key]
            }
            outSiloProps.push(sp)
        })
        const outSilo : Silo = {
            id: siloId,
            properties: outSiloProps
        }
        console.log(outSilo)
    } else {
        console.warn(`unsupported silo type = ${params.type}`)
    }
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo create time = " + (allDoneTime - startTime))
}

const destroySilo = async (siloId: string) => {
    const resourceGroup = 'Reliza-Local-Tests' // TODO: should be stored with silo props
    let startTime = (new Date()).getTime()
    const siloDestroyCmd = 
        `cd tf_space/${siloId} && terraform destroy -auto-approve -var="silo_identifier=${siloId}" -var="resource_group_name=${resourceGroup}"`
    await utils.shellExec('sh', ['-c', siloDestroyCmd])
    await utils.deleteDir(`tf_space/${siloId}`)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo destroy time = " + (allDoneTime - startTime))
}

export default {
    createSilo,
    destroySilo
}