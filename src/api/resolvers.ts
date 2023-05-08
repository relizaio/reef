import testAa from '../../local_tests/TestAccounts'
import silo from '../services/silo'

const resolvers = {
    Query: {
        hello: () => 'world'
    },
    Mutation: {
        createSilo: () => {
            console.log('accessed create silo')
            console.log(testAa)
            silo.createSilo()
            return true
        }
    }
}

export default {
    resolvers: resolvers
}