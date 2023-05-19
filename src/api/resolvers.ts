import silo from '../services/silo'

type SiloParams = {
    type: string,
    group: string
}

const resolvers = {
    Query: {
        hello: () => 'world'
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