import silo from '../services/silo'
import instance from '../services/instance'

type SiloParams = {
    type: string,
    resource_group_name: string
}

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
            const siloParams : SiloParams = params.params
            silo.createSilo(siloParams)
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
    }
}

export default {
    resolvers: resolvers
}

export type { SiloParams }