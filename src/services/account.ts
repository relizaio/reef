import { AccountDao, AzureAccount, AzureAccountDao, GitAccountDao } from '../model/Account'
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
    aaDao.clientId = await crypto.encrypt(aa.clientId)
    aaDao.clientSecret = await crypto.encrypt(aa.clientSecret)
    aaDao.subscriptionId = await crypto.encrypt(aa.subscriptionId)
    aaDao.tenantId = await crypto.encrypt(aa.tenantId)
    return aaDao
}

export default {
    createAzureAccount,
    createGitAccount,
    getAccount
}