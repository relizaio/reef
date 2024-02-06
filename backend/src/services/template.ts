import { Template, TemplateInput, TemplateData, TfVarDefinition } from '../model/Template'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import { GitCheckoutObject } from '../model/GitCheckoutObject'
import { GitAccount } from '../model/Account'
import account from './account'

async function getTemplate (templateId: string, withoutValues?: boolean) : Promise<Template> {
    const queryText = `SELECT * FROM ${schema}.templates where uuid = $1`
    const queryParams = [templateId]
    const queryRes = await runQuery(queryText, queryParams)
    return await dbRowToTemplate(queryRes.rows[0], withoutValues)
}

async function listTemplates (status?: string) : Promise<Template[]> {
    let queryText = `SELECT * FROM ${schema}.templates`
    let queryParams: string[] = []
    if (status) {
        queryText += ` WHERE status = $1`
        queryParams = [status]
    }
    const queryRes = await runQuery(queryText, queryParams)
    let templates: Template[] = []
    if (queryRes.rows && queryRes.rows.length) {
        templates = await Promise.all(queryRes.rows.map(async (row: any) => await dbRowToTemplate(row, true)))
    }
    return templates
}

async function dbRowToTemplate (dbRow: any, withoutValues?: boolean) : Promise<Template> {
    const template : Template = {
        id: dbRow.uuid,
        status: dbRow.status,
        recordData: dbRow.record_data
    }
    if (!withoutValues) template.recordData.userVariables = await resolveTfVariables(template)
    return template
}

async function saveToDb (template: Template) : Promise<Template> {
    const templateUuidForDb = template.id
    const queryText = `INSERT INTO ${schema}.templates (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
    const queryParams = [templateUuidForDb, template.status, JSON.stringify(template.recordData)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createTemplate (templateInput: TemplateInput): Promise<Template> {
    const template: Template = new Template()
    template.id = utils.uuidv4()
    template.status = constants.STATUS_ACTIVE
    template.recordData = new TemplateData()
    template.recordData.repoPath = templateInput.repoPath
    template.recordData.repoPointer = templateInput.repoPointer
    template.recordData.repoUrl = templateInput.repoUrl
    template.recordData.type = templateInput.type
    template.recordData.providers = templateInput.providers
    template.recordData.authAccounts = templateInput.authAccounts
    template.recordData.parentTemplates = templateInput.parentTemplates
    
    await resolveTfVariables(template) // verifies git connectivity

    await saveToDb(template)
    return template
}

async function resolveTfVariables (template: Template):  Promise<TfVarDefinition[]> {
    const gco = await gitCheckoutObjectFromTemplate(template)
    const checkoutPaths = await utils.gitCheckout(gco)
    const tfVars = await utils.parseTfDirectoryForVariables(checkoutPaths.fullTemplatePath)
    await utils.deleteDir(checkoutPaths.checkoutPath)
    if (checkoutPaths.utilPath) await utils.deleteDir(checkoutPaths.utilPath)
    return tfVars
}

async function gitCheckoutObjectFromTemplate(template: Template) : Promise<GitCheckoutObject> {
    const gco : GitCheckoutObject = new GitCheckoutObject()

    const ga : GitAccount | null = await account.getGitAccountFromSet(template.recordData.authAccounts)
    if (ga) {
        gco.isPrivate = true
        gco.token = ga.token
        gco.username = ga.username
    }

    gco.gitUri = template.recordData.repoUrl
    gco.gitPath = template.recordData.repoPath
    gco.gitPointer = template.recordData.repoPointer


    return gco
}

export default {
    createTemplate,
    getTemplate,
    gitCheckoutObjectFromTemplate,
    listTemplates
}