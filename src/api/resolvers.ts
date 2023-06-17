import silo from '../services/silo'
import instance from '../services/instance'
import template from '../services/template'
import { TemplateInput } from '../model/Template'

const resolvers = {
    Query: {
        hello: () => 'world',
        getSilo: (parent: any, params: any) => {
            const siloId : string = params.siloId
            return silo.getSilo(siloId)
        }
    },
    Mutation: {
        createSilo: (parent: any, params: any) => {
            const templateId = params.templateId
            const userVariables : any = params.userVariables
            // TODO silo.createSilo(siloParams)
            return true
        },
        destroySilo: (parent: any, params: any) => {
            const siloId : string = params.siloId
            silo.destroySilo(siloId)
            return true
        },
        createInstance: (parent: any, params: any) => {
            const siloId : string = params.siloId
            instance.createInstance(siloId)
            return true
        },
        destroyInstance: (parent: any, params: any) => {
            const instanceId : string = params.instanceId
            instance.destroyInstance(instanceId)
            return true
        },
        createTemplate: (parent: any, params: any) => {
            const templateInput : TemplateInput = params.templateInput
            template.createTemplate(templateInput)
            return true
        },
    }
}

export default {
    resolvers: resolvers
}