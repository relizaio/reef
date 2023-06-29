import {scryptSync, randomFillSync, createCipheriv, createDecipheriv, createHmac} from 'node:crypto'
import { CipherObject } from '../model/CipherObject'

const algorithm = 'aes-256-cbc';
const hmacAlgorithm = 'sha256'
const keyLength = 32 // key length is based on algorithm, for aes-256-cbc it's 32 bytes

async function encrypt (passphrase: string, plainText: string, hmacSecret: string) {
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

async function decrypt (passphrase: string, hmacSecret: string, cipherObj: CipherObject) {
    const hmac = createHmac(hmacAlgorithm, hmacSecret);
    hmac.update(cipherObj.ct)
    const hmacText = hmac.digest('hex')
    if (hmacText !== cipherObj.hmac) {
        console.error('hmac does not match, aborting decryption')
        return
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