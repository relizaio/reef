import { AccountDao, AwsAccount, AwsAccountDao, AzureAccount, AzureAccountDao, GitAccount, GitAccountDao } from '../model/Account'
import { cipherDaoFromObject, cipherObjectFromDao } from '../model/CipherObject'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import crypto from '../utils/crypto'

async function getAccount (accountId: string) : Promise<AccountDao> {
    const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1`
    const queryParams = [accountId]
    const queryRes = await runQuery(queryText, queryParams)
    const acDao : AccountDao = {
        id: queryRes.rows[0].uuid,
        status: queryRes.rows[0].status,
        record_data: queryRes.rows[0].record_data
    }
    return acDao
}

async function saveToDb (account: AccountDao) {
    const accountUuidForDb = account.id
    const queryText = `INSERT INTO ${schema}.accounts (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
    const queryParams = [accountUuidForDb, account.status, JSON.stringify(account.record_data)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createGitAccount (ga: GitAccount) : Promise<AccountDao> {
    const gaDao : GitAccountDao = await gitAccountDaoFromGitAccount(ga)
    const adao : AccountDao = new AccountDao()
    adao.id = utils.uuidv4()
    adao.status = constants.STATUS_ACTIVE
    adao.record_data = gaDao
    await saveToDb(adao)
    return adao
}

async function createAwsAccount (aa: AwsAccount) : Promise<AccountDao> {
    const aaDao : AwsAccountDao = await awsAccountDaoFromAwsAccount(aa)
    const adao : AccountDao = new AccountDao()
    adao.id = utils.uuidv4()
    adao.status = constants.STATUS_ACTIVE
    adao.record_data = aaDao
    await saveToDb(adao)
    return adao
}

async function createAzureAccount (aa: AzureAccount) : Promise<AccountDao> {
    const aaDao : AzureAccountDao = await azureAccountDaoFromAzureAccount(aa)
    const adao : AccountDao = new AccountDao()
    adao.id = utils.uuidv4()
    adao.status = constants.STATUS_ACTIVE
    adao.record_data = aaDao
    await saveToDb(adao)
    return adao
}

async function gitAccountDaoFromGitAccount (ga: GitAccount) : Promise<GitAccountDao> {
    const gaDao = new GitAccountDao()
    gaDao.repositoryVendor = ga.repositoryVendor
    gaDao.username = cipherDaoFromObject(await crypto.encrypt(ga.username))
    gaDao.token = cipherDaoFromObject(await crypto.encrypt(ga.token))
    return gaDao
}

async function awsAccountDaoFromAwsAccount (aa: AwsAccount) : Promise<AwsAccountDao> {
    const aaDao = new AwsAccountDao()
    aaDao.region = aa.region
    aaDao.accessKey = cipherDaoFromObject(await crypto.encrypt(aa.accessKey))
    aaDao.secretKey = cipherDaoFromObject(await crypto.encrypt(aa.secretKey))
    return aaDao
}

async function azureAccountDaoFromAzureAccount (aa: AzureAccount) : Promise<AzureAccountDao> {
    const aaDao = new AzureAccountDao()
    aaDao.resourceGroupName = aa.resourceGroupName
    aaDao.clientId = cipherDaoFromObject(await crypto.encrypt(aa.clientId))
    aaDao.clientSecret = cipherDaoFromObject(await crypto.encrypt(aa.clientSecret))
    aaDao.subscriptionId = cipherDaoFromObject(await crypto.encrypt(aa.subscriptionId))
    aaDao.tenantId = cipherDaoFromObject(await crypto.encrypt(aa.tenantId))
    return aaDao
}

async function getAzureAccount (accountId: string) : Promise<AzureAccount | null> {
    let aa : AzureAccount | null = null

    const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1 and record_data->>'providerName' = $2`
    const queryParams = [accountId, constants.AZURE_ACCOUNT_PROVIDER]
    const queryRes = await runQuery(queryText, queryParams)
    if (queryRes.rows && queryRes.rows.length) {
        const aaDao : AzureAccountDao = queryRes.rows[0].record_data
        aa = new AzureAccount()
        aa.clientId = await crypto.decrypt(cipherObjectFromDao(aaDao.clientId))
        aa.clientSecret = await crypto.decrypt(cipherObjectFromDao(aaDao.clientSecret))
        aa.subscriptionId = await crypto.decrypt(cipherObjectFromDao(aaDao.subscriptionId))
        aa.tenantId = await crypto.decrypt(cipherObjectFromDao(aaDao.tenantId))
        aa.resourceGroupName = aaDao.resourceGroupName
    }
    return aa
}

async function getAwsAccount (accountId: string) : Promise<AwsAccount | null> {
    let aa : AwsAccount | null = null

    const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1 and record_data->>'providerName' = $2`
    const queryParams = [accountId, constants.AWS_ACCOUNT_PROVIDER]
    const queryRes = await runQuery(queryText, queryParams)
    if (queryRes.rows && queryRes.rows.length) {
        const aaDao : AwsAccountDao = queryRes.rows[0].record_data
        aa = new AwsAccount()
        aa.region = aaDao.region
        aa.accessKey = await crypto.decrypt(cipherObjectFromDao(aaDao.accessKey))
        aa.secretKey = await crypto.decrypt(cipherObjectFromDao(aaDao.secretKey))
    }
    return aa
}

async function getAzureAccountFromSet(accountSet: string[]) : Promise<AzureAccount | null> {
    let aa : AzureAccount | null = null
    if (accountSet && accountSet.length) {
        let i = 0
        while (!aa && i < accountSet.length) {
            aa = await getAzureAccount(accountSet[i])
            ++i
        }
    }
    return aa
}

async function getAwsAccountFromSet(accountSet: string[]) : Promise<AwsAccount | null> {
    let aa : AwsAccount | null = null
    if (accountSet && accountSet.length) {
        let i = 0
        while (!aa && i < accountSet.length) {
            aa = await getAwsAccount(accountSet[i])
            ++i
        }
    }
    return aa
}

async function getGitAccount (accountId: string) : Promise<GitAccount | null> {
    let ga : GitAccount | null = null

    const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1 and record_data->>'providerName' = $2`
    const queryParams = [accountId, constants.GIT_ACCOUNT_PROVIDER]
    const queryRes = await runQuery(queryText, queryParams)
    if (queryRes.rows && queryRes.rows.length) {
        const gaDao : GitAccountDao = queryRes.rows[0].record_data
        ga = new GitAccount()
        ga.username = await crypto.decrypt(cipherObjectFromDao(gaDao.username))
        ga.token = await crypto.decrypt(cipherObjectFromDao(gaDao.token))
        ga.repositoryVendor = gaDao.repositoryVendor
    }
    return ga
}

async function getGitAccountFromSet(accountSet: string[]) : Promise<GitAccount | null> {
    let ga : GitAccount | null = null
    if (accountSet && accountSet.length) {
        let i = 0
        while (!ga && i < accountSet.length) {
            ga = await getGitAccount(accountSet[i])
            ++i
        }
    }
    return ga
}

export default {
    createAwsAccount,
    createAzureAccount,
    createGitAccount,
    getAccount,
    getAwsAccountFromSet,
    getAzureAccountFromSet,
    getGitAccountFromSet
}