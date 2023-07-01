import { Template, TemplateInput, TemplateData } from '../model/Template'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import { GitCheckoutObject } from '../model/GitCheckoutObject'

const getTemplate = async (templateId: string) : Promise<Template> => {
    const queryText = `SELECT * FROM ${schema}.templates where uuid = $1`
    const queryParams = [templateId]
    const queryRes = await runQuery(queryText, queryParams)
    const template : Template = {
        id: queryRes.rows[0].uuid,
        status: queryRes.rows[0].status,
        record_data: queryRes.rows[0].record_data
    }
    return template
}

async function saveToDb (template: Template) : Promise<Template> {
    const templateUuidForDb = template.id
    const queryText = `INSERT INTO ${schema}.templates (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
    const queryParams = [templateUuidForDb, template.status, JSON.stringify(template.record_data)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createTemplate (templateInput: TemplateInput): Promise<Template> {
    const template: Template = new Template()
    template.id = utils.uuidv4()
    template.status = constants.STATUS_ACTIVE
    template.record_data = new TemplateData()
    template.record_data.repoPath = templateInput.repoPath
    template.record_data.repoPointer = templateInput.repoPointer
    template.record_data.repoUrl = templateInput.repoUrl
    template.record_data.type = templateInput.type
    template.record_data.providers = templateInput.providers
    template.record_data.authAccounts = templateInput.authAccounts
    template.record_data.parentTemplates = templateInput.parentTemplates

    // parse supported user variables from actual template
    const gco = await gitCheckoutObjectFromTemplate(template)
    const checkoutPaths = await utils.gitCheckout(gco)
    const tfVars = await utils.parseTfDirectoryForVariables(checkoutPaths.fullTemplatePath)
    await utils.deleteDir(checkoutPaths.checkoutPath)
    template.record_data.userVariables = tfVars
    saveToDb(template)
    return template
}

async function gitCheckoutObjectFromTemplate(template: Template) : Promise<GitCheckoutObject> {
    const gco : GitCheckoutObject = new GitCheckoutObject()
    gco.gitUri = template.record_data.repoUrl
    gco.gitPath = template.record_data.repoPath
    gco.gitPointer = template.record_data.repoPointer
    return gco
}

export default {
    createTemplate,
    getTemplate,
    gitCheckoutObjectFromTemplate
}