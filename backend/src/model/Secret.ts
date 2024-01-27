import utils from "../utils/utils"
import { CipherDao } from "./CipherObject"

class SecretDao {
    id : string = utils.uuidv4()
    secret: CipherDao = new CipherDao()
}

export {
    SecretDao
}