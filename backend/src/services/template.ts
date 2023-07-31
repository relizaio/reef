import { Template, TemplateInput, TemplateData } from '../model/Template'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import { GitCheckoutObject } from '../model/GitCheckoutObject'
import { GitAccount } from '../model/Account'
import account from './account'

async function getTemplate (templateId: string) : Promise<Template> {
    const queryText = `SELECT * FROM ${schema}.templates where uuid = $1`
    const queryParams = [templateId]
    const queryRes = await runQuery(queryText, queryParams)
    return dbRowToTemplate(queryRes.rows[0])
}

async function listTemplates () : Promise<Template[]> {
    const queryText = `SELECT * FROM ${schema}.templates`
    const queryRes = await runQuery(queryText, [])
    let templates: Template[] = []
    if (queryRes.rows && queryRes.rows.length) {
        templates = queryRes.rows.map((row: any) => dbRowToTemplate(row)) 
    }
    return templates
}

function dbRowToTemplate (dbRow: any) : Template {
    const template : Template = {
        id: dbRow.uuid,
        status: dbRow.status,
        recordData: dbRow.record_data
    }
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

    // parse supported user variables from actual template
    const gco = await gitCheckoutObjectFromTemplate(template)
    const checkoutPaths = await utils.gitCheckout(gco)
    const tfVars = await utils.parseTfDirectoryForVariables(checkoutPaths.fullTemplatePath)
    await utils.deleteDir(checkoutPaths.checkoutPath)
    if (checkoutPaths.utilPath) await utils.deleteDir(checkoutPaths.utilPath)
    
    template.recordData.userVariables = tfVars
    await saveToDb(template)
    return template
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