import utils from '../utils/utils'

const createSilo = async () => {
    const siloId = 'silo_' + utils.uuidv4()
    await utils.copyDir('./local_tests/azure_k3s_vnet_silo', "./tf_space/" + siloId)
}

export default {
    createSilo
}