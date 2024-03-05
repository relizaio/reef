import test from 'node:test'
import assert from 'assert/strict'
import crypto from '../src/utils/crypto'
import { AccountService } from '../src/services/account.service'
import { GitAccountDao } from '../src/model/Account'
import * as cypherObject from '../src/model/CipherObject'

test('create git account test', async (t) => {
    let accountService: AccountService = new AccountService()
    const passphrase = "testPassPhrase"
    const hmacSecret = "testHmacSecret"
    const gitUserName = "testGitUserName"
    const gitToken = "testGitToken"
    const cipherObjUserName = await crypto.encrypt(gitUserName, passphrase, hmacSecret)
    const cipherObjToken = await crypto.encrypt(gitToken, passphrase, hmacSecret)
    const gaDao : GitAccountDao = new GitAccountDao()
    gaDao.username = cypherObject.cipherDaoFromObject(cipherObjUserName)
    gaDao.token = cypherObject.cipherDaoFromObject(cipherObjToken)
    const createdAcct = await accountService.createGitAccountFromDao(gaDao)
    const getAcct = await accountService.getAccount(createdAcct.id)
    assert.strictEqual(createdAcct.id, getAcct.id)
})