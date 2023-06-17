import { Template, TemplateInput, TemplateData } from '../model/Template'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'

async function saveToDb (template: Template) {
    const templateUuidForDb = template.id
    const queryText = `INSERT INTO ${schema}.templates (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
    const queryParams = [templateUuidForDb, template.status, JSON.stringify(template.record_data)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createTemplate (templateInput: TemplateInput) {
    const template: Template = new Template()
    template.id = utils.uuidv4()
    template.status = constants.STATUS_ACTIVE
    template.record_data = new TemplateData()
    template.record_data.repoPath = templateInput.repoPath
    template.record_data.repoPointer = templateInput.repoPointer
    template.record_data.repoUrl = templateInput.repoUrl
    template.record_data.type = templateInput.type
    template.record_data.providers = templateInput.providers

    // parse supported user variables from actual template
    const checkoutPaths = await utils.gitCheckout(templateInput.repoUrl, templateInput.repoPath, templateInput.repoPointer)
    const tfVars = await utils.parseTfDirectoryForVariables(checkoutPaths.fullTemplatePath)
    await utils.deleteDir(checkoutPaths.checkoutPath)
    template.record_data.userVariables = tfVars
    saveToDb(template)
}

export default {
    createTemplate
}