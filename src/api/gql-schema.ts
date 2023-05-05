import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String
    }
`

export default {
    typeDefs: typeDefs
}