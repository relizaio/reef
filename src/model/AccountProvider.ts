class AccountProvider {
    providerName: string = 'Undefined'
}

class AzureAccount extends AccountProvider {
    providerName = 'Azure'

    subscriptionId: string = '' // ARM_SUBSCRIPTION_ID
    clientId: string = '' // ARM_CLIENT_ID or app id
    clientSecret: string  = '' // ARM_CLIENT_SECRET
    tenantId: string = '' // ARM_TENANT_ID
}

export default AzureAccount