import utils from '../utils/utils'
import { type SiloParams } from '../api/resolvers'
import testAa from '../../local_tests/TestAccounts'
import { Silo } from '../model/Silo'
import { Property } from '../model/Property'
import { runQuery, schema } from '../utils/pgUtils'
import constants from '../utils/constants'

const saveToDb = async (silo: Silo) => {
    const siloUuidForDb = silo.id.replace(constants.SILO_PREFIX, '')
    const queryText = `INSERT INTO ${schema}.silos (uuid, status, properties) values ($1, $2, $3) RETURNING *`
    const queryParams = [siloUuidForDb, silo.status, JSON.stringify(silo.properties)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

const archiveSiloInDb = async (siloId: string) => {
    const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
    const queryText = `UPDATE ${schema}.silos SET status = $1, last_updated_date = now() where uuid = $2`
    const queryParams = [constants.STATUS_ARCHIVED, siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

const getSilo = async (siloId: string) : Promise<Silo> => {
    const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
    const queryText = `SELECT * FROM ${schema}.silos where uuid = $1`
    const queryParams = [siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    const silo : Silo = {
        id: queryRes.rows[0].uuid,
        status: queryRes.rows[0].status,
        properties: queryRes.rows[0].properties
    }
    return silo
}

const createSilo = async (params: SiloParams) => {
    let startTime = (new Date()).getTime()
    const siloId = constants.SILO_PREFIX + utils.uuidv4()
    await utils.copyDir('./local_tests/azure_k3s_vnet_silo', `./${constants.TF_SPACE}/${siloId}`)
    if (params.type === "azure") {
        const siloTfVarsObj = {
            silo_identifier: siloId,
            resource_group_name: params.resource_group_name
        }
        const siloTfVarsFile = `./${constants.TF_SPACE}/${siloId}/${constants.TF_DEFAULT_TFVARS_FILE}`
        utils.saveJsonToFile(siloTfVarsFile, siloTfVarsObj)
        console.log(`Creating Azure Silo ${siloId}...`)
        const initializeSiloCmd =
            `export ARM_CLIENT_ID=${testAa.clientId}; export ARM_CLIENT_SECRET=${testAa.clientSecret}; ` + 
            `export ARM_SUBSCRIPTION_ID=${testAa.subscriptionId}; export ARM_TENANT_ID=${testAa.tenantId}; ` +
            `cd ${constants.TF_SPACE}/${siloId} && terraform init && terraform plan && terraform apply -auto-approve`
        const initSiloData = await utils.shellExec('sh', ['-c', initializeSiloCmd], 15*60*1000)
        console.log(initSiloData)
        const parsedSiloOut = utils.parseTfOutput(initSiloData)
        const outSiloProps : Property[] = [
            {key: 'resource_group_name', value: params.resource_group_name},
            {key: 'type', value: params.type}
        ]
        Object.keys(parsedSiloOut).forEach((key: string) => {
            const sp : Property = {
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
    let startTime = (new Date()).getTime()
    console.log(`Destroying TF Silo ${siloId}...`)
    const siloDestroyCmd = `cd ${constants.TF_SPACE}/${siloId} && terraform destroy -auto-approve`
    await utils.shellExec('sh', ['-c', siloDestroyCmd])
    await utils.deleteDir(`${constants.TF_SPACE}/${siloId}`)
    archiveSiloInDb(siloId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo destroy time = " + (allDoneTime - startTime))
}

export default {
    createSilo,
    destroySilo,
    getSilo
}