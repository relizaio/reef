import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String
    },
    type Mutation {
        createSilo: Boolean
    }
`

export default {
    typeDefs: typeDefs
}