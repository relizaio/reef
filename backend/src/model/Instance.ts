import constants from '../utils/constants'
import { Property } from './Property'

class Instance {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    description: string = ''
    silo_id: string = ''
    template_id: string = ''
    template_pointer: string = '' // git commit hash
    properties : Property[] = []
}

export type { Instance }