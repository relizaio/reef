import { Injectable } from '@nestjs/common'
import utils from '../utils/utils'
import constants from '../utils/constants'
import { Instance } from '../model/Instance'
import { Property } from '../model/Property'
import { runQuery, schema } from '../utils/pgUtils'
import { ProviderType } from '../model/Template'
import { AccountService } from './account.service'
import { TemplateService } from './template.service'
import { SiloService } from './silo.service'
import { KeyValueInput } from 'src/graphql'

@Injectable()
export class InstanceService {
    constructor(
        private accountService: AccountService,
        private siloService: SiloService,
        private templateService: TemplateService
    ) {}

    async getInstance (instanceId: string) : Promise<Instance> {
        const instanceUuidForDb = instanceId.replace(constants.INSTANCE_PREFIX, '')
        const queryText = `SELECT * FROM ${schema}.instances where uuid = $1`
        const queryParams = [instanceUuidForDb]
        const queryRes = await runQuery(queryText, queryParams)
        return this.transformDbRowToInstance(queryRes.rows[0])
    }
    
    async getInstancesOfSilo (siloId: string, statuses?: [string]) : Promise<Instance[]> {
        const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
        let queryText = `SELECT * FROM ${schema}.instances WHERE silo_id = $1`
        if (statuses && statuses.length) queryText += " AND status = ANY($2)"
        let queryParams: any[] = [siloUuidForDb]
        if (statuses && statuses.length) queryParams.push(statuses)
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows.map((r: any) => this.transformDbRowToInstance(r))
    }
    
    async getAllActiveInstances () : Promise<Instance[]> {
        const queryText = `SELECT * FROM ${schema}.instances where status = 'ACTIVE' OR status = 'PENDING'`
        const queryRes = await runQuery(queryText, [])
        return queryRes.rows.map((r: any) => this.transformDbRowToInstance(r))
    }
    
    transformDbRowToInstance(dbRow: any): Instance {
        const instance : Instance = {
            id: constants.INSTANCE_PREFIX + dbRow.uuid,
            status: dbRow.status,
            template_id: dbRow.template_id,
            template_pointer: dbRow.template_pointer,
            silo_id: dbRow.silo_id,
            properties: dbRow.properties
        }
        return instance
    }
    
    async saveToDb (instance: Instance) {
        const instanceUuidForDb = instance.id.replace(constants.INSTANCE_PREFIX, '')
        const siloUuidForDb = instance.silo_id.replace(constants.SILO_PREFIX, '')
        const queryText = `INSERT INTO ${schema}.instances (uuid, status, silo_id, template_id, template_pointer, properties) values ($1, $2, $3, $4, $5, $6) RETURNING *`
        const queryParams = [instanceUuidForDb, instance.status, siloUuidForDb, instance.template_id, instance.template_pointer, JSON.stringify(instance.properties)]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async updateInstanceInDb (instance : Instance) {
        const instanceUuidForDb = instance.id.replace(constants.INSTANCE_PREFIX, '')
        const queryText = `UPDATE ${schema}.instances SET status = $1, properties = $2 where uuid = $3 RETURNING *`
        const queryParams = [instance.status, JSON.stringify(instance.properties), instanceUuidForDb]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async archiveInDb (instanceId: string) {
        const instanceUuidForDb = instanceId.replace(constants.INSTANCE_PREFIX, '')
        const queryText = `UPDATE ${schema}.instances SET status = $1, last_updated_date = now() where uuid = $2`
        const queryParams = [constants.STATUS_ARCHIVED, instanceUuidForDb]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async createInstance (siloId: string, templateId: string, instanceId?: string, userVariables?: KeyValueInput[]) : Promise<Instance | null> {
        const siloEntity = await this.siloService.getSilo(siloId)
    
        const instanceTemplate = await this.templateService.getTemplate(templateId)
    
        if (!instanceTemplate.recordData.parentTemplates || !instanceTemplate.recordData.parentTemplates.length) {
            throw new Error("Cannot create an instance without a parent silo")
        }
    
        const gco = await this.templateService.gitCheckoutObjectFromTemplate(instanceTemplate)
    
        const instTestRegex = /^instance-[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (instanceId && !instTestRegex.test(instanceId)) {
            throw new Error('Cannot create instance due to improper id')
        }
    
        if (!instanceId) instanceId = constants.INSTANCE_PREFIX + utils.uuidv4()
        
        const instSourcePaths = await utils.gitCheckout(gco)
        const templatePointer = await utils.shellExec('sh', ['-c', `git -C ${instSourcePaths.checkoutPath} log --pretty=tformat:"%H" -1`])
        await utils.copyDir(instSourcePaths.fullTemplatePath, `./${constants.TF_SPACE}/${instanceId}`)
        await utils.deleteDir(instSourcePaths.checkoutPath)
        if (instSourcePaths.utilPath) await utils.deleteDir(instSourcePaths.utilPath)
    
        const instanceTfVarsFile = `./${constants.TF_SPACE}/${instanceId}/${constants.TF_DEFAULT_TFVARS_FILE}`
    
        const tfVarsObject: any = {
            "instance_id": instanceId
        }
        siloEntity.properties.forEach(prop => {
            if (prop.value) tfVarsObject[prop.key] = prop.value
        })
        if (userVariables && userVariables.length) {
            userVariables.forEach(prop => {
                if (prop.value) tfVarsObject[prop.key] = prop.value
            })
        }
        utils.saveJsonToFile(instanceTfVarsFile, tfVarsObject)
        console.log(`Creating ${instanceId} instance in ${siloId} silo...`)
        let initInstEnvVarCmd = ''
        const respInstance = await this.createPendingInstanceInDb(instanceId, siloId, templateId, templatePointer)
        if (instanceTemplate.recordData.providers.includes(ProviderType.AZURE)) {
            const azureAct = await this.accountService.getAzureAccountFromSet(instanceTemplate.recordData.authAccounts)
            if (azureAct) {
                initInstEnvVarCmd += utils.getAzureEnvTfPrefix(azureAct)
            } else {
                console.error('missing Azure account for template = ' + templateId)
            }
        }
        if (instanceTemplate.recordData.providers.includes(ProviderType.AWS)) {
            const awsAct = await this.accountService.getAwsAccountFromSet(instanceTemplate.recordData.authAccounts)
            if (awsAct) {
                initInstEnvVarCmd += utils.getAwsEnvTfPrefix(awsAct)
            } else {
                console.error('missing aws account for template = ' + templateId)
            }
        }
        this.createInstanceTfRoutine(instanceId, siloId, initInstEnvVarCmd, templateId, templatePointer)
        return respInstance
    }
    
    async createPendingInstanceInDb(instanceId: string, siloId: string, templateId: string, templatePointer: string) {
        const pendingInstance : Instance = {
            id: instanceId,
            status: constants.STATUS_PENDING,
            silo_id: siloId,
            template_id: templateId,
            template_pointer: templatePointer,
            properties: []
        }
        await this.saveToDb(pendingInstance)
        return pendingInstance
    }
    
    async createInstanceTfRoutine (instanceId: string, siloId: string, envVarCmd: string, templateId: string, templatePointer: string) {
        const startTime = (new Date()).getTime()
        const fname = utils.constructTfPipeOutFileName(constants.CREATE_OPERATION)
        const initializeInstanceCmd = envVarCmd +
            `cd ${constants.TF_SPACE}/${instanceId} && tofu init && tofu apply -auto-approve` + utils.constructTfPipeOut(fname)
        await utils.shellExec('sh', ['-c', initializeInstanceCmd], 15*60*1000)
        const initInstanceData = await utils.shellExec('sh', ['-c', `cat ${constants.TF_SPACE}/${instanceId}/${fname}`])
        const parsedInstanceOut = utils.parseTfOutput(initInstanceData)
        console.log(parsedInstanceOut)
        const outInstanceProps : Property[] = []
        Object.keys(parsedInstanceOut).forEach((key: string) => {
            const sp : Property = {
                key,
                value: parsedInstanceOut[key]
            }
            outInstanceProps.push(sp)
        })
        const outInstance : Instance = {
            id: instanceId,
            status: constants.STATUS_ACTIVE,
            silo_id: siloId,
            template_id: templateId,
            template_pointer: templatePointer,
            properties: outInstanceProps
        }
        this.updateInstanceInDb(outInstance)
        const allDoneTime = (new Date()).getTime()
        console.log("After TF instance create time = " + (allDoneTime - startTime))
    }
    
    async destroyInstance (instanceId: string) {
        let startTime = (new Date()).getTime()
        console.log(`Destroying TF instance ${instanceId}...`)
        const instance = await this.getInstance(instanceId)
        const template = await this.templateService.getTemplate(instance.template_id, true)
        let instanceDestroyCmd = ''
        if (template.recordData.providers.includes(ProviderType.AZURE)) {
            const azureAct = await this.accountService.getAzureAccountFromSet(template.recordData.authAccounts)
            if (azureAct) {
                instanceDestroyCmd += utils.getAzureEnvTfPrefix(azureAct)
            } else {
                console.error(`Could not locate azure account on destroying instance ${instanceId}`)
            }
        }
        if (template.recordData.providers.includes(ProviderType.AWS)) {
            const awsAct = await this.accountService.getAwsAccountFromSet(template.recordData.authAccounts)
            if (awsAct) {
                instanceDestroyCmd += utils.getAwsEnvTfPrefix(awsAct)
            } else {
                console.error(`Could not locate aws account on destroying instance ${instanceId}`)
            }
        }
        const fname = utils.constructTfPipeOutFileName(constants.DESTROY_OPERATION)
        instanceDestroyCmd += `cd ${constants.TF_SPACE}/${instanceId} && tofu destroy -auto-approve` + utils.constructTfPipeOut(fname)
        await utils.shellExec('sh', ['-c', instanceDestroyCmd])
        await utils.deleteDir(`${constants.TF_SPACE}/${instanceId}`)
        await this.archiveInDb(instanceId)
        const allDoneTime = (new Date()).getTime()
        console.log("After TF instance destroy time = " + (allDoneTime - startTime))
    }
}