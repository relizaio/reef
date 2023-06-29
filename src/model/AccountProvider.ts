class AccountProvider {
    providerName: string = 'Undefined'
}

class AzureAccount extends AccountProvider {
    providerName = 'Azure'

    subscriptionId: string = '' // ARM_SUBSCRIPTION_ID
    clientId: string = '' // ARM_CLIENT_ID or app id
    clientSecret: string  = '' // ARM_CLIENT_SECRET
    tenantId: string = '' // ARM_TENANT_ID
    resourceGroupName: string = '' // optional, required if scoped to resource group
}

class GitAccount extends AccountProvider {
    providerName = 'Git'

    username: string = ''
    token: string = ''
}

export default {
    AzureAccount,
    GitAccount
}