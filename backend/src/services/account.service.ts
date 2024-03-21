import { Injectable } from '@nestjs/common'
import { AccountDao, AccountDto, AwsAccount, AwsAccountDao, AzureAccount, AzureAccountDao, GitAccount, GitSshAccount, GitAccountDao, GitSshAccountDao } from '../model/Account'
import { AwsAccountInput, AzureAccountInput, GitAccountInput, GitSshAccountInput } from 'src/graphql'
import { cipherDaoFromObject, cipherObjectFromDao } from '../model/CipherObject'
import { runQuery, schema } from '../utils/pgUtils'
import utils from '../utils/utils'
import constants from '../utils/constants'
import crypto from '../utils/crypto'

@Injectable()
export class AccountService {
    async getAccount (accountId: string) : Promise<AccountDao> {
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
    
    async getAllActiveAccounts () : Promise<AccountDto[]> {
        const queryText = `SELECT * FROM ${schema}.accounts where status = 'ACTIVE'`
        const queryRes = await runQuery(queryText, [])
        return queryRes.rows.map((r: any) => this.transformDbRowToAccountDto(r))
    }
    
    transformDbRowToAccountDto(dbRow: any): AccountDto {
        const account : AccountDto = {
            id: dbRow.uuid,
            providerName: dbRow.record_data.providerName,
            description: dbRow.record_data.description,
            pubkey: ''
        }
        return account
    }
    
    async saveToDb (account: AccountDao) {
        const accountUuidForDb = account.id
        const queryText = `INSERT INTO ${schema}.accounts (uuid, status, record_data) values ($1, $2, $3) RETURNING *`
        const queryParams = [accountUuidForDb, account.status, JSON.stringify(account.record_data)]
        const queryRes = await runQuery(queryText, queryParams)
        return queryRes.rows[0]
    }
    
    async createGitAccount (ga: GitAccountInput) : Promise<AccountDao> {
        const gaDao : GitAccountDao = await this.gitAccountDaoFromGitAccountInput(ga)
        return await this.createGitAccountFromDao(gaDao)
    }

    async createGitSshAccount (ga: GitSshAccountInput) : Promise<AccountDto> {
        const keypair = await utils.generateSshKeyPair()
        const aDao: GitSshAccountDao = new GitSshAccountDao()
        aDao.username = cipherDaoFromObject(await crypto.encrypt(ga.username))
        aDao.privkey = cipherDaoFromObject(await crypto.encrypt(keypair.privkey))
        aDao.pubkey = cipherDaoFromObject(await crypto.encrypt(keypair.pubkey))
        aDao.description = ga.description
        const savedDao = await this.createGitSshAccountFromDao(aDao)
        const aDto: AccountDto = {
            id: savedDao.id,
            providerName: aDao.providerName,
            pubkey: keypair.pubkey,
            description: ga.description
        }
        return aDto
    }

    async createGitAccountFromDao(gaDao: GitAccountDao) : Promise<AccountDao> {
        const adao : AccountDao = new AccountDao()
        adao.id = utils.uuidv4()
        adao.status = constants.STATUS_ACTIVE
        adao.record_data = gaDao
        await this.saveToDb(adao)
        return adao
    }

    async createGitSshAccountFromDao(gaDao: GitSshAccountDao) : Promise<AccountDao> {
        const adao : AccountDao = new AccountDao()
        adao.id = utils.uuidv4()
        adao.status = constants.STATUS_ACTIVE
        adao.record_data = gaDao
        await this.saveToDb(adao)
        return adao
    }
    
    async createAwsAccount (aa: AwsAccountInput) : Promise<AccountDao> {
        const aaDao : AwsAccountDao = await this.awsAccountDaoFromAwsAccountInput(aa)
        const adao : AccountDao = new AccountDao()
        adao.id = utils.uuidv4()
        adao.status = constants.STATUS_ACTIVE
        adao.record_data = aaDao
        await this.saveToDb(adao)
        return adao
    }
    
    async createAzureAccount (aa: AzureAccountInput) : Promise<AccountDao> {
        const aaDao : AzureAccountDao = await this.azureAccountDaoFromAzureAccountInput(aa)
        const adao : AccountDao = new AccountDao()
        adao.id = utils.uuidv4()
        adao.status = constants.STATUS_ACTIVE
        adao.record_data = aaDao
        await this.saveToDb(adao)
        return adao
    }
    
    async gitAccountDaoFromGitAccountInput (ga: GitAccountInput) : Promise<GitAccountDao> {
        const gaDao = new GitAccountDao()
        gaDao.repositoryVendor = ga.repositoryVendor
        gaDao.username = cipherDaoFromObject(await crypto.encrypt(ga.username))
        gaDao.token = cipherDaoFromObject(await crypto.encrypt(ga.token))
        gaDao.description = ga.description
        return gaDao
    }
    
    async awsAccountDaoFromAwsAccountInput (aa: AwsAccountInput) : Promise<AwsAccountDao> {
        const aaDao = new AwsAccountDao()
        aaDao.region = aa.region
        aaDao.description = aa.description
        aaDao.accessKey = cipherDaoFromObject(await crypto.encrypt(aa.accessKey))
        aaDao.secretKey = cipherDaoFromObject(await crypto.encrypt(aa.secretKey))
        return aaDao
    }
    
    async azureAccountDaoFromAzureAccountInput (aa: AzureAccountInput) : Promise<AzureAccountDao> {
        const aaDao = new AzureAccountDao()
        aaDao.resourceGroupName = aa.resourceGroupName
        aaDao.description = aa.description
        aaDao.clientId = cipherDaoFromObject(await crypto.encrypt(aa.clientId))
        aaDao.clientSecret = cipherDaoFromObject(await crypto.encrypt(aa.clientSecret))
        aaDao.subscriptionId = cipherDaoFromObject(await crypto.encrypt(aa.subscriptionId))
        aaDao.tenantId = cipherDaoFromObject(await crypto.encrypt(aa.tenantId))
        return aaDao
    }
    
    async getAzureAccount (accountId: string) : Promise<AzureAccount | null> {
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
    
    async getAwsAccount (accountId: string) : Promise<AwsAccount | null> {
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
    
    async getAzureAccountFromSet(accountSet: string[]) : Promise<AzureAccount | null> {
        let aa : AzureAccount | null = null
        if (accountSet && accountSet.length) {
            let i = 0
            while (!aa && i < accountSet.length) {
                aa = await this.getAzureAccount(accountSet[i])
                ++i
            }
        }
        return aa
    }
    
    async getAwsAccountFromSet(accountSet: string[]) : Promise<AwsAccount | null> {
        let aa : AwsAccount | null = null
        if (accountSet && accountSet.length) {
            let i = 0
            while (!aa && i < accountSet.length) {
                aa = await this.getAwsAccount(accountSet[i])
                ++i
            }
        }
        return aa
    }
    
    async getGitAccount (accountId: string) : Promise<GitAccount | null> {
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

    async getGitSshAccount (accountId: string) : Promise<GitSshAccount | null> {
        let ga : GitSshAccount | null = null
    
        const queryText = `SELECT * FROM ${schema}.accounts where uuid = $1 and record_data->>'providerName' = $2`
        const queryParams = [accountId, constants.GIT_SSH_ACCOUNT_PROVIDER]
        const queryRes = await runQuery(queryText, queryParams)
        if (queryRes.rows && queryRes.rows.length) {
            const gaDao : GitSshAccountDao = queryRes.rows[0].record_data
            ga = new GitSshAccount()
            ga.username = await crypto.decrypt(cipherObjectFromDao(gaDao.username))
            ga.privkey = await crypto.decrypt(cipherObjectFromDao(gaDao.privkey))
            ga.repositoryVendor = gaDao.repositoryVendor
        }
        return ga
    }
    
    async getGitAccountFromSet(accountSet: string[]) : Promise<GitAccount | GitSshAccount | null> {
        let ga : GitAccount | GitSshAccount | null = null
        if (accountSet && accountSet.length) {
            let i = 0
            while (!ga && i < accountSet.length) {
                ga = await this.getGitAccount(accountSet[i])
                if (!ga) ga = await this.getGitSshAccount(accountSet[i])
                ++i
            }
        }
        return ga
    }
}
