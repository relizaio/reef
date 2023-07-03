const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

const { gql } = require('@apollo/client');
const { gqlClient, testVars, initScenarioContext } = require('../utils')

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


Then('I create Instance', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});