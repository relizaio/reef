import silo from '../services/silo'
import utils from '../utils/utils'
import constants from '../utils/constants'
import * as templateService from './template'
import account from './account'
import { Instance } from '../model/Instance'
import { Property } from '../model/Property'
import { runQuery, schema } from '../utils/pgUtils'
import { ProviderType } from '../model/Template'
import { AzureAccount } from '../model/Account'


async function getInstance (instanceId: string) : Promise<Instance> {
    const instanceUuidForDb = instanceId.replace(constants.INSTANCE_PREFIX, '')
    const queryText = `SELECT * FROM ${schema}.instances where uuid = $1`
    const queryParams = [instanceUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return transformDbRowToInstance(queryRes.rows[0])
}

async function getInstancesOfSilo (siloId: string) : Promise<Instance[]> {
    const siloUuidForDb = siloId.replace(constants.SILO_PREFIX, '')
    const queryText = `SELECT * FROM ${schema}.instances where silo_id = $1`
    const queryParams = [siloUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows.map((r: any) => transformDbRowToInstance(r))
}

function transformDbRowToInstance(dbRow: any): Instance {
    const instance : Instance = {
        id: constants.INSTANCE_PREFIX + dbRow.uuid,
        status: dbRow.status,
        template_id: dbRow.template_id,
        silo_id: dbRow.silo_id,
        properties: dbRow.properties
    }
    return instance
}

async function saveToDb (instance: Instance) {
    const instanceUuidForDb = instance.id.replace(constants.INSTANCE_PREFIX, '')
    const siloUuidForDb = instance.silo_id.replace(constants.SILO_PREFIX, '')
    const queryText = `INSERT INTO ${schema}.instances (uuid, status, silo_id, template_id, properties) values ($1, $2, $3, $4, $5) RETURNING *`
    const queryParams = [instanceUuidForDb, instance.status, siloUuidForDb, instance.template_id, JSON.stringify(instance.properties)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function updateInstanceInDb (instance : Instance) {
    const instanceUuidForDb = instance.id.replace(constants.INSTANCE_PREFIX, '')
    const queryText = `UPDATE ${schema}.instances SET status = $1, properties = $2 where uuid = $3 RETURNING *`
    const queryParams = [instance.status, JSON.stringify(instance.properties), instanceUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function archiveInDb (instanceId: string) {
    const instanceUuidForDb = instanceId.replace(constants.INSTANCE_PREFIX, '')
    const queryText = `UPDATE ${schema}.instances SET status = $1, last_updated_date = now() where uuid = $2`
    const queryParams = [constants.STATUS_ARCHIVED, instanceUuidForDb]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createInstance (siloId: string, templateId: string) : Promise<Instance | null> {
    const siloEntity = await silo.getSilo(siloId)

    const instanceTemplate = await templateService.default.getTemplate(templateId)

    // TODO: validate that instance template has silo template as parent

    const gco = await templateService.default.gitCheckoutObjectFromTemplate(instanceTemplate)

    const instanceId = constants.INSTANCE_PREFIX + utils.uuidv4()
    
    const instSourcePaths = await utils.gitCheckout(gco)
    await utils.copyDir(instSourcePaths.fullTemplatePath, `./${constants.TF_SPACE}/${instanceId}`)
    await utils.deleteDir(instSourcePaths.checkoutPath)
    if (instSourcePaths.utilPath) await utils.deleteDir(instSourcePaths.utilPath)

    const instanceTfVarsFile = `./${constants.TF_SPACE}/${instanceId}/${constants.TF_DEFAULT_TFVARS_FILE}`

    const tfVarsObject: any = {
        "instance_id": instanceId
    }
    siloEntity.properties.forEach(prop => {
        tfVarsObject[prop.key] = prop.value
    })
    utils.saveJsonToFile(instanceTfVarsFile, tfVarsObject)
    console.log(`Creating ${instanceId} instance in ${siloId} silo...`)
    let initInstEnvVarCmd = ''
    const respInstance = await createPendingInstanceInDb(instanceId, siloId, templateId)
    if (instanceTemplate.recordData.providers.includes(ProviderType.AZURE)) {
        const azureAct = await account.getAzureAccountFromSet(instanceTemplate.recordData.authAccounts)
        if (azureAct) {
            initInstEnvVarCmd += utils.getAzureEnvTfPrefix(azureAct)
        } else {
            console.error('missing Azure account for template = ' + templateId)
        }
    }
    if (instanceTemplate.recordData.providers.includes(ProviderType.AWS)) {
        const awsAct = await account.getAwsAccountFromSet(instanceTemplate.recordData.authAccounts)
        if (awsAct) {
            initInstEnvVarCmd += utils.getAwsEnvTfPrefix(awsAct)
        } else {
            console.error('missing aws account for template = ' + templateId)
        }
    }
    createInstanceTfRoutine(instanceId, siloId, initInstEnvVarCmd, templateId)
    return respInstance
}

async function createPendingInstanceInDb(instanceId: string, siloId: string, templateId: string) {
    const pendingInstance : Instance = {
        id: instanceId,
        status: constants.STATUS_PENDING,
        silo_id: siloId,
        template_id: templateId,
        properties: []
    }
    await saveToDb(pendingInstance)
    return pendingInstance
}

async function createInstanceTfRoutine (instanceId: string, siloId: string, envVarCmd: string, templateId: string) {
    const startTime = (new Date()).getTime()
    const initializeInstanceCmd = envVarCmd +
        `cd ${constants.TF_SPACE}/${instanceId} && terraform init && terraform plan && terraform apply -auto-approve`
    const initInstanceData = await utils.shellExec('sh', ['-c', initializeInstanceCmd], 15*60*1000)
    console.log(initInstanceData)
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
        properties: outInstanceProps
    }
    updateInstanceInDb(outInstance)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance create time = " + (allDoneTime - startTime))
}

const destroyInstance = async (instanceId: string) => {
    let startTime = (new Date()).getTime()
    console.log(`Destroying TF instance ${instanceId}...`)
    const instance = await getInstance(instanceId)
    const template = await templateService.default.getTemplate(instance.template_id)
    let instanceDestroyCmd = ''
    if (template.recordData.providers.includes(ProviderType.AZURE)) {
        const azureAct = await account.getAzureAccountFromSet(template.recordData.authAccounts)
        if (azureAct) {
            instanceDestroyCmd += utils.getAzureEnvTfPrefix(azureAct)
        } else {
            console.error(`Could not locate azure account on destroying instance ${instanceId}`)
        }
    }
    if (template.recordData.providers.includes(ProviderType.AWS)) {
        const awsAct = await account.getAwsAccountFromSet(template.recordData.authAccounts)
        if (awsAct) {
            instanceDestroyCmd += utils.getAwsEnvTfPrefix(awsAct)
        } else {
            console.error(`Could not locate aws account on destroying instance ${instanceId}`)
        }
    }
    instanceDestroyCmd += `cd ${constants.TF_SPACE}/${instanceId} && terraform destroy -auto-approve`
    await utils.shellExec('sh', ['-c', instanceDestroyCmd])
    await utils.deleteDir(`${constants.TF_SPACE}/${instanceId}`)
    await archiveInDb(instanceId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance destroy time = " + (allDoneTime - startTime))
}

export default {
    getInstance,
    createInstance,
    destroyInstance,
    getInstancesOfSilo
}