const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

const { gql } = require('@apollo/client');
const { gqlClient, testVars } = require('../utils')

Given('I register Azure account', async () => {
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
    console.log(gqlRes)
    return 'pending';
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