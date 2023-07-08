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
    const instances = await getInstancesOfSilo(siloId)
    if (instances && instances.length) {
        for (const i of instances) {
            await deleteInstance(i.id)
            await waitForInstanceStatus(i.id, 'ARCHIVED')
        }
    }
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

async function getInstancesOfSilo (siloId) {
    const resData = await gqlClient
        .query({
            query: gql`
                query GetInstancesOfSilo($siloId: ID!) {
                    getInstancesOfSilo(siloId: $siloId) {
                        id
                        status
                    }
                }`,
            variables: {
                "siloId": siloId
            }
        })
    return resData.data.getInstancesOfSilo
}

async function waitForInstanceStatus (instanceId, expectedStatus) {
    const timeout = 5 * 60 * 1000 // 5 minutes
    const startTime = (new Date()).getTime()
    let actualStatus = undefined
    while (actualStatus !== expectedStatus &&  (new Date()).getTime() - startTime < timeout) {
        const gqlRes = await gqlClient
            .query({
                query: gql`
                    query GetInstance($instanceId: ID!) {
                        getInstance(instanceId: $instanceId) {
                            status
                        }
                    }`,
                variables: {
                    "instanceId": instanceId
                },
                fetchPolicy: 'no-cache'
            })
        actualStatus = gqlRes.data.getInstance.status
        if (actualStatus !== expectedStatus) {
            await sleep(1000)
        } else {
            console.log(`Resolved Instance status as ${actualStatus}`)
        }
    }
}

exports.gqlClient = gqlClient
exports.testVars = testVars
exports.initScenarioContext = initScenarioContext
exports.sleep = sleep
exports.deleteSilo = deleteSilo
exports.deleteInstance = deleteInstance