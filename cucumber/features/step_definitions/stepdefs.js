const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

const { gql } = require('@apollo/client');
const { gqlClient, testVars, initScenarioContext, deleteSilo, deleteInstance, waitForSiloStatus, waitForInstanceStatus } = require('../utils')

var scenarioContext = {}

Given('I initialize {string} scenario', async (string) => {
    // Write code here that turns the phrase above into concrete actions
    scenarioContext = initScenarioContext(string)
    assert.ok(Object.keys(scenarioContext).length > 0, "missing scenario context")
});

Then('I register Git account', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateGitAccount($gitAccount: GitAccountInput!) {
                    createGitAccount(gitAccount: $gitAccount) {
                        id
                    }
                }`,
            variables: {
                "gitAccount": testVars.gitAccount
            }

        })
    scenarioContext.gitAccount = gqlRes.data.createGitAccount.id
    assert.ok(scenarioContext.gitAccount && scenarioContext.gitAccount.length > 0, "failed to register git account")
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

Then('I register AWS account', async () => {
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateAwsAccount($awsAccount: AwsAccountInput!) {
                    createAwsAccount(awsAccount: $awsAccount) {
                        id
                    }
                }`,
            variables: {
                "awsAccount": testVars.awsAccount
            }

        })
    scenarioContext.awsAccount = gqlRes.data.createAwsAccount.id
    assert.ok(scenarioContext.awsAccount && scenarioContext.awsAccount.length > 0, "failed to register AWS account")
});


Then('I register Silo template', async () => {
    const authAccounts = []
    if (scenarioContext.gitType === 'PRIVATE') {
        authAccounts.push(scenarioContext.gitAccount)
    }
    let templateInput = {}
    if (scenarioContext.azureAccount) {
        authAccounts.push(scenarioContext.azureAccount)
        templateInput = {
            "providers": ["AZURE"],
            "repoPath": "terraform_templates/silos/azure_k3s_vnet_silo",
            "repoPointer": "main",
            "repoUrl": scenarioContext.gitRepo,
            "type": "SILO",
            "authAccounts": authAccounts
        }
    } else if (scenarioContext.awsAccount) {
        authAccounts.push(scenarioContext.awsAccount)
        templateInput = {
            "providers": ["AWS"],
            "repoPath": "terraform_templates/silos/aws_k3s_vpc_silo",
            "repoPointer": "main",
            "repoUrl": scenarioContext.gitRepo,
            "type": "SILO",
            "authAccounts": authAccounts            
        }
    }
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateSiloTemplate($templateInput: TemplateInput!) {
                    createTemplate(templateInput: $templateInput) {
                        id
                    }
                }`,
            variables: {
                "templateInput": templateInput
            }
        })
    scenarioContext.siloTemplate = gqlRes.data.createTemplate.id
    assert.ok(scenarioContext.siloTemplate && scenarioContext.siloTemplate.length > 0, "failed to register silo template")
});

Then('I register Instance template', async () => {
    const authAccounts = []
    if (scenarioContext.gitType === 'PRIVATE') {
        authAccounts.push(scenarioContext.gitAccount)
    }
    let templateInput = {}
    if (scenarioContext.azureAccount) {
        authAccounts.push(scenarioContext.azureAccount)
        templateInput = {
            "providers": ["AZURE"],
            "repoPath": "terraform_templates/instances/azure_k3s_instance",
            "repoPointer": "main",
            "repoUrl": scenarioContext.gitRepo,
            "type": "INSTANCE",
            "authAccounts": authAccounts
        }
    } else if (scenarioContext.awsAccount) {
        authAccounts.push(scenarioContext.awsAccount)
        templateInput = {
            "providers": ["AWS"],
            "repoPath": "terraform_templates/instances/aws_k3s_vpc_instance",
            "repoPointer": "main",
            "repoUrl": scenarioContext.gitRepo,
            "type": "INSTANCE",
            "authAccounts": authAccounts
        }
    }
    const gqlRes = await gqlClient
        .mutate({
            mutation: gql`
                mutation CreateInstanceTemplate($templateInput: TemplateInput!) {
                    createTemplate(templateInput: $templateInput) {
                        id
                    }
                }`,
            variables: {
                "templateInput": templateInput
            }
        })
    scenarioContext.instanceTemplate = gqlRes.data.createTemplate.id
    assert.ok(scenarioContext.instanceTemplate && scenarioContext.instanceTemplate.length > 0, "failed to register instance template")
});


Then('I create Silo', async () => {
    let userVariables = []
    if (scenarioContext.azureAccount) {
        userVariables = [
            {
                "key": "resource_group_name",
                "value": testVars.azureAccount.resourceGroupName
            }
        ]
    } else if (scenarioContext.awsAccount) {
        userVariables = [
            {
                "key": "dns_zone_id",
                "value": "testid"
            }
        ]
    }
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
                "userVariables": userVariables
            }
        })
    scenarioContext.siloId = gqlRes.data.createSilo.id
    assert.ok(scenarioContext.siloId && scenarioContext.siloId.length > 0, "failed to create silo")
});


Then('I wait for Silo to become Active', {timeout: 7 * 60 * 1000}, async () => {
    console.log('Waiting for Silo to be created, this may take several minutes, timeout is set to 5 minutes...')
    const status = await waitForSiloStatus(scenarioContext.siloId, 'ACTIVE')
    assert.strictEqual(status, 'ACTIVE', 'Silo still not active after 5 minutes')
})

Then('I wait for Instance to become Active', {timeout: 7 * 60 * 1000}, async () => {
    console.log('Waiting for Instance to be created, this may take several minutes, timeout is set to 5 minutes...')
    const status = await waitForInstanceStatus(scenarioContext.instanceId, 'ACTIVE')
    assert.strictEqual(status, 'ACTIVE', 'Instance still not active after 5 minutes')
})

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

Then('I delete Silo', {timeout: 7 * 60 * 1000}, async () => {
    await deleteSilo(scenarioContext.siloId)
    assert.ok(true, "destroy silo failed")
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
