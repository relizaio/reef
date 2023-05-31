import constants from '../utils/constants'
import { Property } from './Property'

class Silo {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    properties : Property[] = []
}


export type { Silo }