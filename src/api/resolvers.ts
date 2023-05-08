import testAa from '../../local_tests/TestAccounts'

const resolvers = {
    Query: {
        hello: () => 'world'
    },
    Mutation: {
        createSilo: () => {
            console.log('accessed create silo')
            console.log(testAa)
            return true
        }
    }
}

export default {
    resolvers: resolvers
}