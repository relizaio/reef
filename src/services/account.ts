import { AccountDao, AzureAccount, AzureAccountDao, GitAccountDao } from '../model/Account'
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

async function createGitAccount (ga: GitAccountDao) : Promise<AccountDao> {
    const adao : AccountDao = new AccountDao()
    adao.id = utils.uuidv4()
    adao.status = constants.STATUS_ACTIVE
    adao.record_data = ga
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

async function azureAccountDaoFromAzureAccount (aa: AzureAccount) : Promise<AzureAccountDao> {
    const aaDao = new AzureAccountDao()
    aaDao.resourceGroupName = aa.resourceGroupName
    aaDao.clientId = cipherDaoFromObject(await crypto.encrypt(aa.clientId))
    aaDao.clientSecret = cipherDaoFromObject(await crypto.encrypt(aa.clientSecret))
    aaDao.subscriptionId = cipherDaoFromObject(await crypto.encrypt(aa.subscriptionId))
    aaDao.tenantId = cipherDaoFromObject(await crypto.encrypt(aa.tenantId))
    return aaDao
}

async function getAzureAccount (accountId: string) : Promise<AzureAccount> {
    const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1`
    const queryParams = [accountId]
    const queryRes = await runQuery(queryText, queryParams)
    const aaDao : AzureAccountDao = queryRes.rows[0].record_data
    const aa = new AzureAccount()
    console.log(aaDao.clientId.iv)
    aa.clientId = await crypto.decrypt(cipherObjectFromDao(aaDao.clientId))
    aa.clientSecret = await crypto.decrypt(cipherObjectFromDao(aaDao.clientSecret))
    aa.subscriptionId = await crypto.decrypt(cipherObjectFromDao(aaDao.subscriptionId))
    aa.tenantId = await crypto.decrypt(cipherObjectFromDao(aaDao.tenantId))
    aa.resourceGroupName = aaDao.resourceGroupName
    return aa
}

export default {
    createAzureAccount,
    createGitAccount,
    getAccount,
    getAzureAccount
}