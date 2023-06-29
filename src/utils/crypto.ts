import {scryptSync, randomFillSync, createCipheriv, createDecipheriv} from 'node:crypto'
  
const algorithm = 'aes-256-cbc';
const keyLength = 32 // key length is based on algorithm, for aes-256-cbc it's 32 bytes

async function encrypt (passphrase: string, plainText: string) {
    let encrypted = ''
    const key = scryptSync(passphrase, 'salt', keyLength)
    const iv = randomFillSync(new Uint8Array(16))
    const cipher = createCipheriv(algorithm, key, iv)
    encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const cipherObj = {
        ct: encrypted,
        iv: iv
    }
    return cipherObj
}

async function decrypt (passphrase: string, cipherText: string, iv: Uint8Array) {
    const key = scryptSync(passphrase, 'salt', keyLength)
    const decipher = createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(cipherText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

export default {
    decrypt,
    encrypt
}