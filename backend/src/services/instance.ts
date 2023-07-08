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
    let respInstance : Instance | null = null
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
    if (instanceTemplate.record_data.providers.includes(ProviderType.AZURE)) {
        // locate azure account - TODO for now only single acct is supported
        const azureAct = await account.getAzureAccountFromSet(instanceTemplate.record_data.authAccounts)
        if (azureAct) {
            respInstance = await createPendingInstanceInDb(instanceId, siloId, templateId)
            createAzureInstanceTfRoutine(azureAct, instanceId, siloId, templateId)
        } else {
            console.error('missing Azure account for template = ' + templateId)
        }
    }
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

async function createAzureInstanceTfRoutine (azureAct: AzureAccount, instanceId: string, siloId: string, templateId: string) {
    const startTime = (new Date()).getTime()
    const initializeInstanceCmd =
        `export ARM_CLIENT_ID=${azureAct.clientId}; export ARM_CLIENT_SECRET=${azureAct.clientSecret}; ` + 
        `export ARM_SUBSCRIPTION_ID=${azureAct.subscriptionId}; export ARM_TENANT_ID=${azureAct.tenantId}; ` +
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
    const instanceDestroyCmd = `cd ${constants.TF_SPACE}/${instanceId} && terraform destroy -auto-approve`
    await utils.shellExec('sh', ['-c', instanceDestroyCmd])
    await utils.deleteDir(`${constants.TF_SPACE}/${instanceId}`)
    archiveInDb(instanceId)
    const allDoneTime = (new Date()).getTime()
    console.log("After TF instance destroy time = " + (allDoneTime - startTime))
}

export default {
    createInstance,
    destroyInstance
}