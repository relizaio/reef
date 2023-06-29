import test from 'node:test'
import assert from 'assert/strict'
import crypto from '../src/utils/crypto'
import account from '../src/services/account'
import { GitAccountDao } from '../src/model/Account'

test('create git account test', async (t) => {
    const passphrase = "testPassPhrase"
    const hmacSecret = "testHmacSecret"
    const gitUserName = "testGitUserName"
    const gitToken = "testGitToken"
    const cipherObjUserName = await crypto.encrypt(passphrase, gitUserName, hmacSecret)
    const cipherObjToken = await crypto.encrypt(passphrase, gitToken, hmacSecret)
    const gaDao : GitAccountDao = new GitAccountDao()
    gaDao.username = cipherObjUserName
    gaDao.token = cipherObjToken
    const createdAcct = await account.createGitAccount(gaDao)
    const getAcct = await account.getAccount(createdAcct.id)
    assert.strictEqual(createdAcct.id, getAcct.id)
})