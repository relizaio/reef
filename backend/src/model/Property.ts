type Sensitivity = "sensitive" | "nonsensitive"

class Property {
    key : string = ''
    value : string = ''
    sensitivity? : Sensitivity = "nonsensitive"
}

export type { Property }