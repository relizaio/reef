import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String
    },
    type Mutation {
        createSilo(params: SiloParams): Boolean,
        destroySilo(siloId: ID): Boolean
    },
    input SiloParams {
        type: String
        group: String
    }
`

export default {
    typeDefs: typeDefs
}