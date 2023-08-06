import constants from '../utils/constants'
import { Property } from './Property'

class Silo {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    template_id: string = ''
    properties : Property[] = []
    instance_templates : string[] = []
}


export type { Silo }