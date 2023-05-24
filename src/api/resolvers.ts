import silo from '../services/silo'

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
        }
    }
}

export default {
    resolvers: resolvers
}

export type { SiloParams }