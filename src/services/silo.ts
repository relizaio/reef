import utils from '../utils/utils'
import { type SiloParams } from '../api/resolvers'
import testAa from '../../local_tests/TestAccounts'
import { Silo, SiloProperty } from '../model/Silo'
import { runQuery, schema } from '../utils/pgUtils'
import constants from '../utils/constants'

const saveToDb = async (silo: Silo) => {
    const siloUuidForDb = silo.id.replace('silo_', '')
    const queryText = `INSERT INTO ${schema}.silos (uuid, status, properties) values ($1, $2, $3) RETURNING *`
    const queryParams = [siloUuidForDb, silo.status, JSON.stringify(silo.properties)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

const archiveSiloInDb = async (siloId: string) => {
    const siloUuidForDb = siloId.replace('silo_', '')
    const queryText = `UPDATE ${schema}.silos SET status = $1 where uuid = $2`
    const queryParams = [constants.STATUS_ARCHIVED, siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

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
        const outSiloProps : SiloProperty[] = [
            {key: 'group', value: params.group}
        ]
        Object.keys(parsedSiloOut).forEach((key: string) => {
            const sp : SiloProperty = {
                key,
                value: parsedSiloOut[key]
            }
            outSiloProps.push(sp)
        })
        const outSilo : Silo = {
            id: siloId,
            status: constants.STATUS_ACTIVE,
            properties: outSiloProps
        }
        saveToDb(outSilo)
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
    archiveSiloInDb(siloId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo destroy time = " + (allDoneTime - startTime))
}

export default {
    createSilo,
    destroySilo
}