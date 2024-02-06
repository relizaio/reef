import silo from '../services/silo'
import instance from '../services/instance'
import template from '../services/template'
import account from '../services/account'
import { TemplateInput } from '../model/Template'
import { Property } from '../model/Property'
import { AwsAccount, AzureAccount, GitAccount } from '../model/Account'

const resolvers = {
    Query: {
        hello: () => 'world',
        getSilo: async (parent: any, params: any) => {
            const siloId : string = params.siloId
            return await silo.getSilo(siloId)
        },
        getInstance: async (parent: any, params: any) => {
            const instanceId : string = params.instanceId
            return await instance.getInstance(instanceId)
        },
        getTemplate: async (parent: any, params: any) => {
            const templateId : string = params.templateId
            return await template.getTemplate(templateId)
        },
        getAllActiveInstances: async () => {
            return await instance.getAllActiveInstances()
        },
        getAllActiveSilos: async () => {
            return await silo.getAllActiveSilos()
        },
        getAllActiveAccounts: async () => {
            return await account.getAllActiveAccounts()
        },
        getInstancesOfSilo: async (parent: any, params: any) => {
            const siloId : string = params.siloId
            const statuses : [string] = params.statuses
            return await instance.getInstancesOfSilo(siloId, statuses)
        },
        getTemplates: async (parent: any, params: any) => {
            const status : string = params.status
            return await template.listTemplates(status)
        },
        getAllTemplates: async () => {
            return await template.listTemplates()
        },
    },
    Mutation: {
        createSilo: async (parent: any, params: any) => {
            const templateId = params.templateId
            const userVariables : Property[] = params.userVariables
            return await silo.createSilo(templateId, userVariables)
        },
        updateSilo: async (parent: any, params: any) => {
            const siloId : string = params.siloId
            const templateIds: string[] = params.templateIds
            return await silo.setInstanceTemplatesOnSilo(siloId, templateIds)
        },
        destroySilo: (parent: any, params: any) => {
            const siloId : string = params.siloId
            silo.destroySilo(siloId)
            return true
        },
        createInstance: async (parent: any, params: any) => {
            const siloId : string = params.siloId
            const templateId : string = params.templateId
            const userVariables : Property[] = params.userVariables
            return await instance.createInstance(siloId, templateId, userVariables)
        },
        destroyInstance: (parent: any, params: any) => {
            const instanceId : string = params.instanceId
            instance.destroyInstance(instanceId)
            return true
        },
        createTemplate: async (parent: any, params: any) => {
            const templateInput : TemplateInput = params.templateInput
            const tmpl = await template.createTemplate(templateInput)
            return {id: tmpl.id}
        },
        createAwsAccount: async (parent: any, params: any) => {
            const awsAccountInput : AwsAccount = params.awsAccount
            const awsAct = await account.createAwsAccount(awsAccountInput)
            return {id: awsAct.id}
        },
        createAzureAccount: async (parent: any, params: any) => {
            const azureAccountInput : AzureAccount = params.azureAccount
            const azAct = await account.createAzureAccount(azureAccountInput)
            return {id: azAct.id}
        },
        createGitAccount: async (parent: any, params: any) => {
            const gitAccountInput : GitAccount = params.gitAccount
            const gitAct = await account.createGitAccount(gitAccountInput)
            return {id: gitAct.id}
        },
    },
    Silo: {
        template: async (parent: any, params: any) => {
            const templateId = parent.template_id
            return await template.getTemplate(templateId)
        }
    }
}

export default {
    resolvers: resolvers
}