import constants from "../utils/constants"
import { CipherDao } from "./CipherObject"

class AccountProvider {
    providerName: string = 'Undefined'
}

class AzureAccount extends AccountProvider {
    providerName = constants.AZURE_ACCOUNT_PROVIDER

    subscriptionId: string = '' // ARM_SUBSCRIPTION_ID
    clientId: string = '' // ARM_CLIENT_ID or app id
    clientSecret: string  = '' // ARM_CLIENT_SECRET
    tenantId: string = '' // ARM_TENANT_ID
    resourceGroupName: string = '' // optional, required if scoped to resource group
}

class AzureAccountDao extends AccountProvider {
    providerName = constants.AZURE_ACCOUNT_PROVIDER

    subscriptionId: CipherDao = new CipherDao()
    clientId: CipherDao = new CipherDao()
    clientSecret: CipherDao = new CipherDao()
    tenantId: CipherDao = new CipherDao()
    resourceGroupName: string = ''
}

class GitAccount extends AccountProvider {
    providerName = constants.GIT_ACCOUNT_PROVIDER

    repositoryVendor: string = constants.GITHUB_REPOSITORY_VENDOR
    username: string = ''
    token: string = ''
}

class GitAccountDao extends AccountProvider {
    providerName = constants.GIT_ACCOUNT_PROVIDER

    repositoryVendor: string = constants.GITHUB_REPOSITORY_VENDOR
    username: CipherDao = new CipherDao()
    token: CipherDao = new CipherDao()
}

class AccountDao {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    record_data : AccountProvider = new AccountProvider()
}

export {
    AccountDao,
    AzureAccount,
    AzureAccountDao,
    GitAccount,
    GitAccountDao
}