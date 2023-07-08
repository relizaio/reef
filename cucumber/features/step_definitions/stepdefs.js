const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

const { gql } = require('@apollo/client');
const { gqlClient, testVars, initScenarioContext, sleep, deleteSilo, deleteInstance } = require('../utils')

var scenarioContext = {}

Given('I initialize scenario', async () => {
    // Write code here that turns the phrase above into concrete actions
    scenarioContext = initScenarioContext()
    assert.ok(Object.keys(scenarioContext).length > 0, "missing scenario context")
});

Then('I register Azure account', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateAzureAccount($azureAccount: AzureAccountInput!) {
                    createAzureAccount(azureAccount: $azureAccount) {
                        id
                    }
                }`,
            variables: {
                "azureAccount": testVars.azureAccount
            }

        })
    scenarioContext.azureAccount = gqlRes.data.createAzureAccount.id
    assert.ok(scenarioContext.azureAccount && scenarioContext.azureAccount.length > 0, "failed to register azure account")
});


Then('I register Silo template', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateSiloTemplate($templateInput: TemplateInput!) {
                    createTemplate(templateInput: $templateInput) {
                        id
                    }
                }`,
            variables: {
                "templateInput": {
                    "providers": ["AZURE"],
                    "repoPath": "terraform_templates/silos/azure_k3s_vnet_silo",
                    "repoPointer": "main",
                    "repoUrl": "https://github.com/relizaio/reliza-ephemeral-framework.git",
                    "type": "SILO",
                    "authAccounts": [scenarioContext.azureAccount]
                }
            }
        })
    scenarioContext.siloTemplate = gqlRes.data.createTemplate.id
    assert.ok(scenarioContext.siloTemplate && scenarioContext.siloTemplate.length > 0, "failed to register silo template")
});

Then('I register Instance template', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateInstanceTemplate($templateInput: TemplateInput!) {
                    createTemplate(templateInput: $templateInput) {
                        id
                    }
                }`,
            variables: {
                "templateInput": {
                    "providers": ["AZURE"],
                    "repoPath": "terraform_templates/instances/azure_k3s_instance",
                    "repoPointer": "main",
                    "repoUrl": "https://github.com/relizaio/reliza-ephemeral-framework.git",
                    "type": "INSTANCE",
                    "authAccounts": [scenarioContext.azureAccount]
                }
            }
        })
    scenarioContext.instanceTemplate = gqlRes.data.createTemplate.id
    assert.ok(scenarioContext.instanceTemplate && scenarioContext.instanceTemplate.length > 0, "failed to register instance template")
});


Then('I create Silo', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateSilo($templateId: ID!, $userVariables: [KeyValueInput]) {
                    createSilo(templateId: $templateId, userVariables: $userVariables) {
                        id
                    }
                }`,
            variables: {
                "templateId": scenarioContext.siloTemplate,
                "userVariables": [
                    {
                        "key": "resource_group_name",
                        "value": testVars.azureAccount.resourceGroupName
                    }
                ]
            }
        })
    scenarioContext.siloId = gqlRes.data.createSilo.id
    assert.ok(scenarioContext.siloId && scenarioContext.siloId.length > 0, "failed to create silo")
});


Then('I wait for Silo to become Active', {timeout: 7 * 60 * 1000}, async () => {
    const timeout = 5 * 60 * 1000 // 5 minutes
    const startTime = (new Date()).getTime()
    let status = undefined
    console.log('Waiting for Silo to be created, this may take several minutes, timeout is set to 5 minutes...')
    while (status !== 'ACTIVE' &&  (new Date()).getTime() - startTime < timeout) {
        const gqlRes = await gqlClient
            .query({
                query: gql`
                    query GetSilo($siloId: ID!) {
                        getSilo(siloId: $siloId) {
                            status
                        }
                    }`,
                variables: {
                    "siloId": scenarioContext.siloId
                },
                fetchPolicy: 'no-cache'
            })
        status = gqlRes.data.getSilo.status
        if (status !== 'ACTIVE') {
            await sleep(1000)
        } else {
            console.log('Resolved Silo status as active')
        }
    }
    assert.strictEqual(status, 'ACTIVE', 'Silo still not active after 5 minutes')
  });

Then('I create Instance', async () =>  {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateInstance($siloId: ID!, $templateId: ID!) {
                    createInstance(siloId: $siloId, templateId: $templateId) {
                        id
                    }
                }`,
            variables: {
                "templateId": scenarioContext.instanceTemplate,
                "siloId": scenarioContext.siloId
            }
        })
    scenarioContext.instanceId = gqlRes.data.createInstance.id
    assert.ok(scenarioContext.instanceId && scenarioContext.instanceId.length > 0, "failed to create instance")
})


Given('I delete {string} silo', async (string) => {
    await deleteSilo(string)
    assert.ok(true, "destroy silo failed")
})

Given('I delete {string} instance', async (string) => {
    await deleteInstance(string)
    assert.ok(true, "destroy instance failed")
})

Given('I delete all silos', {timeout: 20 * 60 * 1000}, async () => {
    const allSiloResp = await gqlClient
    .query({
        query: gql`
            query GetAllActiveSilos {
                getAllActiveSilos {
                    id
                }
            }`
    })
    console.log(`deleting ${allSiloResp.data.getAllActiveSilos.length} silos`)
    for (silo of allSiloResp.data.getAllActiveSilos) {
        await deleteSilo(silo.id)
    }
    assert.ok(true, "destroying silos failed")
})
