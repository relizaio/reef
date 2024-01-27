import {scryptSync, randomFillSync, createCipheriv, createDecipheriv, createHmac} from 'node:crypto'
import { CipherObject } from '../model/CipherObject'

const algorithm = 'aes-256-cbc';
const hmacAlgorithm = 'sha256'
const keyLength = 32 // key length is based on algorithm, for aes-256-cbc it's 32 bytes

const PASS_PHRASE = process.env.CRYPTO_PASS_PHRASE ? process.env.CRYPTO_PASS_PHRASE : 'defaultPassPhraseChangeOnProd'
const HMAC_SECRET = process.env.CRYPTO_HMAC_SECRET ? process.env.CRYPTO_HMAC_SECRET : 'defaultHmacSecretChangeOnProd'

async function encrypt (plainText: string, inputPassphrase?: string, inputHmacSecret?: string) {
    const passphrase = inputPassphrase ? inputPassphrase : PASS_PHRASE
    const hmacSecret = inputHmacSecret ? inputHmacSecret : HMAC_SECRET
    let encrypted = ''
    const key = scryptSync(passphrase, 'salt', keyLength)
    const iv = randomFillSync(new Uint8Array(16))
    const cipher = createCipheriv(algorithm, key, iv)
    encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const hmac = createHmac(hmacAlgorithm, hmacSecret);
    hmac.update(encrypted)
    const hmacText = hmac.digest('hex')
    const cipherObj: CipherObject = {
        ct: encrypted,
        iv: iv,
        hmac: hmacText
    }
    return cipherObj
}

async function decrypt (cipherObj: CipherObject, inputPassphrase?: string, inputHmacSecret?: string) : Promise<string> {
    const passphrase = inputPassphrase ? inputPassphrase : PASS_PHRASE
    const hmacSecret = inputHmacSecret ? inputHmacSecret : HMAC_SECRET
    const hmac = createHmac(hmacAlgorithm, hmacSecret);
    hmac.update(cipherObj.ct)
    const hmacText = hmac.digest('hex')
    if (hmacText !== cipherObj.hmac) {
        console.error('hmac does not match, aborting decryption')
        return ''
    } else {
        const key = scryptSync(passphrase, 'salt', keyLength)
        const decipher = createDecipheriv(algorithm, key, cipherObj.iv)
        let decrypted = decipher.update(cipherObj.ct, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }
}

export default {
    decrypt,
    encrypt
}