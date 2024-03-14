import constants from "../utils/constants"
import { CipherDao } from "./CipherObject"

class AccountProvider {
    providerName: string = 'Undefined'
}

class AwsAccount extends AccountProvider {
    providerName = constants.AWS_ACCOUNT_PROVIDER

    region: string = ''
    accessKey: string = ''
    secretKey: string  = ''
}

class AwsAccountDao extends AccountProvider {
    providerName = constants.AWS_ACCOUNT_PROVIDER

    region: string = ''
    accessKey: CipherDao = new CipherDao()
    secretKey: CipherDao = new CipherDao()
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

class GitSshAccount extends AccountProvider {
    providerName = constants.GIT_SSH_ACCOUNT_PROVIDER

    repositoryVendor: string = constants.GITHUB_REPOSITORY_VENDOR
    username: string = ''
    pubkey: string = ''
    privkey: string = ''
}

class GitSshAccountDao extends AccountProvider {
    providerName = constants.GIT_SSH_ACCOUNT_PROVIDER

    repositoryVendor: string = constants.GITHUB_REPOSITORY_VENDOR
    username: CipherDao = new CipherDao()
    pubkey: CipherDao = new CipherDao()
    privkey: CipherDao = new CipherDao()
}

class AccountDao {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    record_data : AccountProvider = new AccountProvider()
}

class AccountDto {
    id : string = ''
    providerName: string = ''
    pubkey: string = ''
}

export {
    AccountDao,
    AccountDto,
    AwsAccount,
    AwsAccountDao,
    AzureAccount,
    AzureAccountDao,
    GitAccount,
    GitAccountDao,
    GitSshAccount,
    GitSshAccountDao
}