const { ApolloClient, InMemoryCache, ApolloProvider, gql } = require('@apollo/client')

const gqlClient = new ApolloClient({
    uri: 'http://localhost:4001/',
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
        azureAccountId: "",
        siloTemplate: "",
        instanceTemplate: ""
    }
}

function sleep (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function deleteSilo (siloId) {
    await gqlClient
    .mutate({
        mutation: gql`
            mutation DestroySilo($siloId: ID!) {
                destroySilo(siloId: $siloId)
            }`,
        variables: {
            "siloId": siloId
        }
    })
}

async function deleteInstance (instanceId) {
    await gqlClient
    .mutate({
        mutation: gql`
            mutation DestroyInstance($instanceId: ID!) {
                destroyInstance(instanceId: $instanceId)
            }`,
        variables: {
            "instanceId": instanceId
        }
    })
}

exports.gqlClient = gqlClient
exports.testVars = testVars
exports.initScenarioContext = initScenarioContext
exports.sleep = sleep
exports.deleteSilo = deleteSilo
exports.deleteInstance = deleteInstance