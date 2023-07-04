import silo from '../services/silo'
import instance from '../services/instance'
import template from '../services/template'
import account from '../services/account'
import { TemplateInput } from '../model/Template'
import { Property } from '../model/Property'
import { AzureAccount, GitAccount } from '../model/Account'

const resolvers = {
    Query: {
        hello: () => 'world',
        getSilo: (parent: any, params: any) => {
            const siloId : string = params.siloId
            return silo.getSilo(siloId)
        }
    },
    Mutation: {
        createSilo: async (parent: any, params: any) => {
            const templateId = params.templateId
            const userVariables : Property[] = params.userVariables
            return await silo.createSilo(templateId, userVariables)
        },
        destroySilo: (parent: any, params: any) => {
            const siloId : string = params.siloId
            silo.destroySilo(siloId)
            return true
        },
        createInstance: (parent: any, params: any) => {
            const siloId : string = params.siloId
            const templateId : string = params.templateId
            instance.createInstance(siloId, templateId)
            return true
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
    }
}

export default {
    resolvers: resolvers
}