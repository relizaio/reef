import utils from '../utils/utils'
import { Silo } from '../model/Silo'
import { Property } from '../model/Property'
import { runQuery, schema } from '../utils/pgUtils'
import constants from '../utils/constants'
import * as templateService from './template'
import { ProviderType } from '../model/Template'
import account from './account'

const saveToDb = async (silo: Silo) => {
    const siloUuidForDb = silo.id.replace(constants.SILO_PREFIX, '')
    const queryText = `INSERT INTO ${schema}.silos (uuid, status, template_id, properties) values ($1, $2, $3, $4) RETURNING *`
    const queryParams = [siloUuidForDb, silo.status, silo.template_id, JSON.stringify(silo.properties)]
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
        template_id: queryRes.rows[0].template_id,
        properties: queryRes.rows[0].properties
    }
    return silo
}

async function createSilo (templateId: string, userVariables: Property[]) {
    let startTime = (new Date()).getTime()
    const siloId = constants.SILO_PREFIX + utils.uuidv4()
    const template = await templateService.default.getTemplate(templateId)
    const gco = await templateService.default.gitCheckoutObjectFromTemplate(template)
    const siloSourcePaths = await utils.gitCheckout(gco)
    await utils.copyDir(siloSourcePaths.fullTemplatePath, `./${constants.TF_SPACE}/${siloId}`)
    await utils.deleteDir(siloSourcePaths.checkoutPath)
    if (template.record_data.providers.includes(ProviderType.AZURE)) {
        // locate azure account - TODO for now only single acct is supported
        const azureActId = template.record_data.authAccounts[0]
        const azureAct = await account.getAzureAccount(azureActId)
        const siloTfVarsObj: any = {
            silo_identifier: siloId
        }
        userVariables.forEach(prop => {
            siloTfVarsObj[prop.key] = prop.value
        })
        const siloTfVarsFile = `./${constants.TF_SPACE}/${siloId}/${constants.TF_DEFAULT_TFVARS_FILE}`
        utils.saveJsonToFile(siloTfVarsFile, siloTfVarsObj)
        console.log(`Creating Azure Silo ${siloId}...`)
        const initializeSiloCmd =
            `export ARM_CLIENT_ID=${azureAct.clientId}; export ARM_CLIENT_SECRET=${azureAct.clientSecret}; ` + 
            `export ARM_SUBSCRIPTION_ID=${azureAct.subscriptionId}; export ARM_TENANT_ID=${azureAct.tenantId}; ` +
            `cd ${constants.TF_SPACE}/${siloId} && terraform init && terraform plan && terraform apply -auto-approve`
        const initSiloData = await utils.shellExec('sh', ['-c', initializeSiloCmd], 15*60*1000)
        console.log(initSiloData)
        const parsedSiloOut = utils.parseTfOutput(initSiloData)
        const outSiloProps : Property[] = userVariables.slice()
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
            template_id: template.id,
            properties: outSiloProps
        }
        saveToDb(outSilo)
        console.log(outSilo)
    } else {
        console.warn(`unsupported template providers = ${template.record_data.providers}`)
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