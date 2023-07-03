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
    // Write code here that turns the phrase above into concrete actions
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


Then('I register Silo template', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('I register Instance template', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});


Then('I create Silo', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});


Then('I create Instance', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});