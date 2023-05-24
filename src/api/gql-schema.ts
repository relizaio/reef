import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String,
        getSilo(siloId: ID!): Silo
    },
    type Mutation {
        createSilo(params: SiloParams): Boolean,
        destroySilo(siloId: ID!): Boolean
    },
    input SiloParams {
        type: String
        resource_group_name: String
    },
    type Silo {
        id: ID!
        status: String
        properties: [SiloProperty]
    },
    type SiloProperty {
        key: String
        value: String
    }
`

export default {
    typeDefs: typeDefs
}