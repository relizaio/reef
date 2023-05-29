import silo from '../services/silo'
import utils from '../utils/utils'
import constants from '../utils/constants'

const createInstance = async (siloId: string) => {
    let startTime = (new Date()).getTime()

    const siloEntity = await silo.getSilo(siloId)
    const instanceId = 'instance_' + utils.uuidv4()
    // TODO: instance template should be driven by silo props; possibly allow several instance templates per silo
    await utils.copyDir('./local_tests/azure_k3s_instance', "./tf_space/" + instanceId)

    const instanceTfVarsFile = `./tf_space/${instanceId}/${constants.TF_DEFAULT_TFVARS_FILE}`
    utils.saveJsonToFile(instanceTfVarsFile, siloEntity.properties)

    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance create time = " + (allDoneTime - startTime))
}

export default {
    createInstance
}