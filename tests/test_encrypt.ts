import test from 'node:test'
import assert from 'assert/strict'
import crypto from '../src/utils/crypto'

test('encrypt test', async (t) => {
    const passphrase = "testPassPhrase"
    const hmacSecret = "testHmacSecret"
    const plainText = "Hello World test"
    const cipherObj = await crypto.encrypt(passphrase, plainText, hmacSecret)
    console.log(`cypher text in test = ${cipherObj.iv}`)
    const decipherText = await crypto.decrypt(passphrase, hmacSecret, cipherObj)
    console.log(decipherText)
    assert.strictEqual(plainText, decipherText)
})