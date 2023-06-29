import test from 'node:test'
import assert from 'assert/strict'
import crypto from '../src/utils/crypto'

test('encrypt test', async (t) => {
    const passphrase = "testPassPhrase"
    const hmacSecret = "testHmacSecret"
    const plainText = "Hello World test"
    const cipherObj = await crypto.encrypt(plainText, passphrase, hmacSecret)
    console.log(`cypher text in test = ${cipherObj.iv}`)
    const decipherText = await crypto.decrypt(cipherObj, passphrase, hmacSecret)
    console.log(decipherText)
    assert.strictEqual(plainText, decipherText)
})