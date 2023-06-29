import constants from "../utils/constants"
import { cipherDaoFromObject, CipherObject } from "./CipherObject"

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

    repositoryVendor: string = 'GitHub'
    username: string = ''
    token: string = ''
}

class GitAccountDao extends AccountProvider {
    providerName = 'Git'

    repositoryVendor: string = 'GitHub'
    username: CipherObject = new CipherObject()
    token: CipherObject = new CipherObject()
}

class AccountDao {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    record_data : AccountProvider = new AccountProvider()
}

export {
    AccountDao,
    AzureAccount,
    GitAccount,
    GitAccountDao
}