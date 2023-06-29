import { AccountDao, GitAccountDao } from '../model/Account'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'

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

export default {
    createGitAccount
}