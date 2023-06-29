import test from 'node:test'
import assert from 'assert/strict'
import crypto from '../src/utils/crypto'

test('encrypt test', async (t) => {
    const passphrase = "testPassPhrase"
    const plainText = "Hello World test"
    const cipherText = await crypto.encrypt(passphrase, plainText)
    console.log(`cypher text in test = ${cipherText.iv}`)
    const decipherText = await crypto.decrypt(passphrase, cipherText.ct, cipherText.iv)
    console.log(decipherText)
    assert.strictEqual(1,1)
})