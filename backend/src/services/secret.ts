import { SecretDao } from '../model/Secret'
import { cipherDaoFromObject, cipherObjectFromDao } from '../model/CipherObject'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import crypto from '../utils/crypto'

async function getSecret (secretId: string) : Promise<SecretDao> {
    const queryText = `SELECT * FROM ${schema}.secrets where uuid = $1`
    const queryParams = [secretId]
    const queryRes = await runQuery(queryText, queryParams)
    const sDao : SecretDao = {
        id: queryRes.rows[0].uuid,
        secret: queryRes.rows[0].secret
    }
    return sDao
}

async function getSecretDecrypted (secretId: string) : Promise<string> {
    const sDao : SecretDao = await getSecret(secretId)
    return await crypto.decrypt(cipherObjectFromDao(sDao.secret))
}

async function saveToDb (secret: SecretDao) {
    const secretUuidForDb = secret.id
    const queryText = `INSERT INTO ${schema}.secrets (uuid, secret) values ($1, $2) RETURNING *`
    const queryParams = [secretUuidForDb, JSON.stringify(secret.secret)]
    const queryRes = await runQuery(queryText, queryParams)
    return queryRes.rows[0]
}

async function createSecret (pt: string) : Promise<string> {
    const et = await crypto.encrypt(pt)
    const sDao : SecretDao = {
        id: utils.uuidv4(),
        secret: cipherDaoFromObject(et)
    }
    const savedRow = await saveToDb(sDao)
    return savedRow.uuid
}

export default {
    createSecret,
    getSecretDecrypted
}