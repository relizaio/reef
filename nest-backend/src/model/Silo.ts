import constants from '../utils/constants'
import { Property } from './Property'

class Silo {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    template_id: string = ''
    template_pointer: string = '' // git commit hash
    properties : Property[] = []
    instance_templates : string[] = []
}


export type { Silo }