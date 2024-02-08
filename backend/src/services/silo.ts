import utils from '../utils/utils'
import { Silo } from '../model/Silo'
import { Property } from '../model/Property'
import { runQuery, schema } from '../utils/pgUtils'
import constants from '../utils/constants'
import * as templateService from './template'
import { ProviderType } from '../model/Template'
import account from './account'
import secret from './secret'

async function saveToDb (silo: Silo) {
    const siloUuidForDb = silo.id.replace(constants.SILO_PREFIX, '')
    const queryText = `INSERT INTO ${schema}.silos (uuid, status, template_id, template_pointer, properties) values ($1, $2, $3, $4, $5) RETURNING *`
    const queryParams = [siloUuidForDb, silo.status, silo.template_id, silo.template_pointer, JSON.stringify(silo.properties)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function updateSiloDbRecord (silo: Silo): Promise<Silo> {
    const siloUuidForDb = silo.id.replace(constants.SILO_PREFIX, '')
    const queryText = `UPDATE ${schema}.silos SET status = $1, template_id = $2, template_pointer = $3, properties = $4 where uuid = $5 RETURNING *`
    const queryParams = [silo.status, silo.template_id, silo.template_pointer, JSON.stringify(silo.properties), siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function archiveSiloInDb (siloId: string) {
    const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
    const queryText = `UPDATE ${schema}.silos SET status = $1, last_updated_date = now() where uuid = $2`
    const queryParams = [constants.STATUS_ARCHIVED, siloUuidForDb]
    await runQuery(queryText, queryParams)
}

function transformDbRowToSilo(dbRow: any): Silo {
    const silo : Silo = {
        id: constants.SILO_PREFIX + dbRow.uuid,
        status: dbRow.status,
        template_id: dbRow.template_id,
        template_pointer: dbRow.template_pointer,
        properties: dbRow.properties,
        instance_templates: dbRow.instance_templates
    }
    return silo
}

async function getSilo (siloId: string) : Promise<Silo> {
    const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
    const queryText = `SELECT * FROM ${schema}.silos where uuid = $1`
    const queryParams = [siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return transformDbRowToSilo(queryRes.rows[0])
}

async function getAllActiveSilos () : Promise<Silo[]> {
    const queryText = `SELECT * FROM ${schema}.silos where status = 'ACTIVE' OR status = 'PENDING'`
    const queryRes = await runQuery(queryText, [])
    return queryRes.rows.map((r: any) => transformDbRowToSilo(r))
}

async function createSilo (templateId: string, userVariables: Property[]) : Promise<Silo | null> {
    const siloId = constants.SILO_PREFIX + utils.uuidv4()
    const template = await templateService.default.getTemplate(templateId)
    const gco = await templateService.default.gitCheckoutObjectFromTemplate(template)
    const siloSourcePaths = await utils.gitCheckout(gco)
    const templatePointer = await utils.shellExec('sh', ['-c', `git -C ${siloSourcePaths.checkoutPath} log --pretty=tformat:"%H" -1`])
    await utils.copyDir(siloSourcePaths.fullTemplatePath, `./${constants.TF_SPACE}/${siloId}`)
    await utils.deleteDir(siloSourcePaths.checkoutPath)
    if (siloSourcePaths.utilPath) await utils.deleteDir(siloSourcePaths.utilPath)
    let initSiloEnvVarCmd = ''
    const respSilo = await createPendingSiloInDb(siloId, templateId, templatePointer)
    if (template.recordData.providers.includes(ProviderType.AZURE)) {
        const azureAct = await account.getAzureAccountFromSet(template.recordData.authAccounts)
        if (azureAct) {
            initSiloEnvVarCmd += utils.getAzureEnvTfPrefix(azureAct)
        } else {
            console.error('missing azure account for template = ' + template.id)
        }
    }
    if (template.recordData.providers.includes(ProviderType.AWS)) {
        const awsAct = await account.getAwsAccountFromSet(template.recordData.authAccounts)
        if (awsAct) {
            initSiloEnvVarCmd += utils.getAwsEnvTfPrefix(awsAct)
        } else {
            console.error('missing aws account for template = ' + template.id)
        }
    }
    createSiloTfRoutine(siloId, template.id, templatePointer, initSiloEnvVarCmd, userVariables)
    return respSilo
}

async function createPendingSiloInDb(siloId: string, templateId: string, templatePointer: string) {
    const pendingSilo : Silo = {
        id: siloId,
        status: constants.STATUS_PENDING,
        template_id: templateId,
        template_pointer: templatePointer,
        properties: [],
        instance_templates: []
    }
    await saveToDb(pendingSilo)
    return pendingSilo
}

async function setInstanceTemplatesOnSilo(siloId: string, templateIds: string[]) {
    const silo = await getSilo(siloId)
    silo.instance_templates = templateIds
    await updateSiloDbRecord(silo)
}

async function createSiloTfRoutine (siloId: string, templateId: string, templatePointer: string, envVarCmd: string, userVariables: Property[]) {
    const startTime = (new Date()).getTime()
    const siloTfVarsObj: any = {
        silo_identifier: siloId
    }
    userVariables.forEach(prop => {
        if (prop.value) siloTfVarsObj[prop.key] = prop.value
    })
    const siloTfVarsFile = `./${constants.TF_SPACE}/${siloId}/${constants.TF_DEFAULT_TFVARS_FILE}`
    utils.saveJsonToFile(siloTfVarsFile, siloTfVarsObj)
    console.log(`Creating Silo ${siloId}...`)
    const fname = utils.constructTfPipeOutFileName(constants.CREATE_OPERATION)
    const initializeSiloCmd = envVarCmd +
        `cd ${constants.TF_SPACE}/${siloId} && tofu init && tofu apply -auto-approve` + utils.constructTfPipeOut(fname)
    await utils.shellExec('sh', ['-c', initializeSiloCmd], 15*60*1000)
    const initSiloData = await utils.shellExec('sh', ['-c', `cat ${constants.TF_SPACE}/${siloId}/${fname}`])
    const parsedSiloOut = utils.parseTfOutput(initSiloData)
    const outSiloProps : Property[] = await Promise.all(userVariables.map(async (uv : Property) => {
        if (uv.sensitivity !== "sensitive") {
            return uv
        } else {
            const secretId = await secret.createSecret(uv.value)
            const sensitiveProp: Property = {
                key: uv.key,
                value: secretId,
                sensitivity: "sensitive"
            }
            return sensitiveProp
        }
    }))
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
        template_id: templateId,
        template_pointer: templatePointer,
        properties: outSiloProps,
        instance_templates: []
    }
    await updateSiloDbRecord(outSilo)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo create time = " + (allDoneTime - startTime))
}

async function destroySilo (siloId: string) {
    let startTime = (new Date()).getTime()
    console.log(`Destroying TF Silo ${siloId}...`)
    const silo = await getSilo(siloId)
    const template = await templateService.default.getTemplate(silo.template_id, true)
    let siloDestroyCmd = ''
    if (template.recordData.providers.includes(ProviderType.AZURE)) {
        const azureAct = await account.getAzureAccountFromSet(template.recordData.authAccounts)
        if (azureAct) {
            siloDestroyCmd += utils.getAzureEnvTfPrefix(azureAct)
        } else {
            console.error('Could not locate azure account')
        }
    }
    if (template.recordData.providers.includes(ProviderType.AWS)) {
        const awsAct = await account.getAwsAccountFromSet(template.recordData.authAccounts)
        if (awsAct) {
            siloDestroyCmd += utils.getAwsEnvTfPrefix(awsAct)
        } else {
            console.error('Could not locate aws account')
        }
    }
    const fname = utils.constructTfPipeOutFileName(constants.DESTROY_OPERATION)
    siloDestroyCmd += `cd ${constants.TF_SPACE}/${siloId} && tofu destroy -auto-approve`  + utils.constructTfPipeOut(fname)
    await utils.shellExec('sh', ['-c', siloDestroyCmd])
    await utils.deleteDir(`${constants.TF_SPACE}/${siloId}`)
    archiveSiloInDb(siloId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF silo destroy time = " + (allDoneTime - startTime))
}

export default {
    createSilo,
    destroySilo,
    getAllActiveSilos,
    getSilo,
    setInstanceTemplatesOnSilo
}