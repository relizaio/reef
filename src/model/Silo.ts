import constants from '../utils/constants'

class Silo {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    properties : SiloProperty[] = []
}

class SiloProperty {
    key : string = ''
    value : string = ''
}

export type { Silo, SiloProperty }