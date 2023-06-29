class CipherObject {
    iv : Uint8Array = new Uint8Array()
    ct : string = ''
    hmac : string = ''
}

class CipherTextStorage {
    ctToken : string = ''
    storageId : number = 0 // 0 === internal db
    order : number = 0
}

class CipherDao {
    ctStorage: [CipherTextStorage] = [new CipherTextStorage()]
    iv: Uint8Array = new Uint8Array()
    hmac: string = ''
}


// TODO, for now only supports internal db storage
export function cipherObjectFromDao (cipherDao : CipherDao) : CipherObject {
    const co : CipherObject = {
        iv: cipherDao.iv,
        hmac: cipherDao.hmac,
        ct: cipherDao.ctStorage[0].ctToken
    }
    return co
}

// TODO, for now only supports internal db storage
export function cipherDaoFromObject (cipherObj : CipherObject) : CipherDao {
    const cdao : CipherDao = {
        iv: cipherObj.iv,
        hmac: cipherObj.hmac,
        ctStorage: [{
            ctToken: cipherObj.ct,
            storageId: 0,
            order: 0
        }]
    }
    return cdao
}

export { CipherObject }