import constants from '../utils/constants'

class TemplateData {
    type: TemplateType = TemplateType.UNDEFINED
    repoUrl: string = ''
    repoPath: string = ''
    repoPointer: string = '' // this can be git branch, git tag, git hash
    providers: ProviderType[] = []
    userVariables: TfVarDefinition[] = [] // variables that must be configured by the user via user input
    // authAccount TBD TODO
}

enum TemplateType {
    SILO = "SILO",
    INSTANCE = "INSTANCE",
    UNDEFINED = "UNDEFINED"
}

enum ProviderType {
    AZURE = "AZURE",
    AWS = "AWS",
    GCP = "GCP",
    HETZNER = "HETZNER",
    OVH = "OVH"
}

enum TfVariableType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOL = "BOOL",
    LIST = "LIST",
    SET = "SET",
    MAP = "MAP",
    OBJECT = "OBJECT",
    TUPLE = "TUPLE"
}

class Template {
    id : string = ''
    status: string = constants.STATUS_ACTIVE
    record_data : TemplateData = new TemplateData()
}

class TemplateInput {
    type: TemplateType = TemplateType.UNDEFINED
    repoUrl: string = ''
    repoPath: string = ''
    repoPointer: string = ''
    providers: ProviderType[] = []
}

class TfVarDefinition {
    key: string = ''
    type: TfVariableType = TfVariableType.STRING
    typestring: string = '' // to define complex types, i.e. objects or lists
    hasDefault: boolean = false
}

export { Template, TemplateInput, TemplateType, TfVarDefinition, ProviderType, TemplateData }