import { Injectable } from '@nestjs/common'
import { SecretDao } from '../model/Secret'
import { cipherDaoFromObject, cipherObjectFromDao } from '../model/CipherObject'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import crypto from '../utils/crypto'

@Injectable()
export class SecretService {
    async getSecret (secretId: string) : Promise<SecretDao> {
        const queryText = `SELECT * FROM ${schema}.secrets where uuid = $1`
        const queryParams = [secretId]
        const queryRes = await runQuery(queryText, queryParams)
        const sDao : SecretDao = {
            id: queryRes.rows[0].uuid,
            secret: queryRes.rows[0].secret
        }
        return sDao
    }
    
    async getSecretDecrypted (secretId: string) : Promise<string> {
        const sDao : SecretDao = await this.getSecret(secretId)
        return await crypto.decrypt(cipherObjectFromDao(sDao.secret))
    }
    
    async saveToDb (secret: SecretDao) {
        const secretUuidForDb = secret.id
        const queryText = `INSERT INTO ${schema}.secrets (uuid, secret) values ($1, $2) RETURNING *`
        const queryParams = [secretUuidForDb, JSON.stringify(secret.secret)]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async createSecret (pt: string) : Promise<string> {
        const et = await crypto.encrypt(pt)
        const sDao : SecretDao = {
            id: utils.uuidv4(),
            secret: cipherDaoFromObject(et)
        }
        const savedRow = await this.saveToDb(sDao)
        return savedRow.uuid
    }
}