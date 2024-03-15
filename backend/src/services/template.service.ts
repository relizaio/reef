import { Injectable } from '@nestjs/common'
import { Template, TemplateData, TfVarDefinition } from '../model/Template'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import { GitCheckoutObject } from '../model/GitCheckoutObject'
import { GitAccount, GitSshAccount } from '../model/Account'
import { AccountService } from './account.service'
import { TemplateInput } from 'src/graphql'

@Injectable()
export class TemplateService {
    constructor(
        private accountService: AccountService
    ) {}

    async getTemplate (templateId: string, withoutValues?: boolean) : Promise<Template> {
        const queryText = `SELECT * FROM ${schema}.templates where uuid = $1`
        const queryParams = [templateId]
        const queryRes = await runQuery(queryText, queryParams)
        return await this.dbRowToTemplate(queryRes.rows[0], withoutValues)
    }
    
    async listTemplates (status?: string) : Promise<Template[]> {
        let queryText = `SELECT * FROM ${schema}.templates`
        let queryParams: string[] = []
        if (status) {
            queryText += ` WHERE status = $1`
            queryParams = [status]
        }
        const queryRes = await runQuery(queryText, queryParams)
        let templates: Template[] = []
        if (queryRes.rows && queryRes.rows.length) {
            templates = await Promise.all(queryRes.rows.map(async (row: any) => await this.dbRowToTemplate(row, true)))
        }
        return templates
    }
    
    async dbRowToTemplate (dbRow: any, withoutValues?: boolean) : Promise<Template> {
        const template : Template = {
            id: dbRow.uuid,
            status: dbRow.status,
            recordData: dbRow.record_data
        }
        if (!withoutValues) template.recordData.userVariables = await this.resolveTfVariables(template)
        return template
    }
    
    async saveToDb (template: Template) : Promise<Template> {
        const templateUuidForDb = template.id
        const queryText = `INSERT INTO ${schema}.templates (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
        const queryParams = [templateUuidForDb, template.status, JSON.stringify(template.recordData)]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async createTemplate (templateInput: TemplateInput): Promise<Template> {
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
        
        await this.resolveTfVariables(template) // verifies git connectivity
    
        await this.saveToDb(template)
        return template
    }
    
    async resolveTfVariables (template: Template):  Promise<TfVarDefinition[]> {
        const gco = await this.gitCheckoutObjectFromTemplate(template)
        const checkoutPaths = await utils.gitCheckout(gco)
        const tfVars = await utils.parseTfDirectoryForVariables(checkoutPaths.fullTemplatePath)
        await utils.deleteDir(checkoutPaths.checkoutPath)
        if (checkoutPaths.utilPath) await utils.deleteDir(checkoutPaths.utilPath)
        return tfVars
    }
    
    async gitCheckoutObjectFromTemplate(template: Template) : Promise<GitCheckoutObject> {
        const gco : GitCheckoutObject = new GitCheckoutObject()
    
        const ga : GitAccount | GitSshAccount | null = await this.accountService.getGitAccountFromSet(template.recordData.authAccounts)
        if (ga) {
            gco.isPrivate = true
            gco.username = ga.username
            if (ga instanceof GitAccount) {
                gco.token = ga.token
            } else if (ga instanceof GitSshAccount) {
                gco.privkey = ga.privkey
            }
            
        }
    
        gco.gitUri = template.recordData.repoUrl
        gco.gitPath = template.recordData.repoPath
        gco.gitPointer = template.recordData.repoPointer
    
    
        return gco
    }
}