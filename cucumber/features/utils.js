const { ApolloClient, InMemoryCache, ApolloProvider, gql } = require('@apollo/client')

const gqlClient = new ApolloClient({
    uri: 'http://localhost:4002/',
    cache: new InMemoryCache(),
})

const testVars = {
    "azureAccount": {
        "clientId": process.env.REF_TEST_AZURE_CLIENTID,
        "clientSecret": process.env.REF_TEST_AZURE_CLIENTSECRET,
        "resourceGroupName": process.env.REF_TEST_AZURE_RESOURCEGROUPNAME,
        "subscriptionId": process.env.REF_TEST_AZURE_SUBSCRIPTIONID,
        "tenantId": process.env.REF_TEST_AZURE_TENANTID
    }
}

function initScenarioContext () {
    return {
        azureAccountId: ""
    }
}

exports.gqlClient = gqlClient
exports.testVars = testVars
exports.initScenarioContext = initScenarioContext