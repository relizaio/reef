import utils from '../utils/utils'
import { type SiloParams } from '../api/resolvers'
import testAa from '../../local_tests/TestAccounts'

const createSilo = async (params: SiloParams) => {
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
        console.log(parsedSiloOut)
    } else {
        console.warn(`unsupported silo type = ${params.type}`)
    }
}

export default {
    createSilo
}