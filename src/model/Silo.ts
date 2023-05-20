class Silo {
    id : string = ''
    properties : SiloProperty[] = []
}

class SiloProperty {
    key : string = ''
    value : string = ''
}

export type { Silo, SiloProperty }