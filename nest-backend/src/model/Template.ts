import constants from '../utils/constants'

class TemplateData {
    type: TemplateType = TemplateType.UNDEFINED
    repoUrl: string = ''
    repoPath: string = ''
    repoPointer: string = '' // this can be git branch, git tag, git hash
    providers: ProviderType[] = []
    userVariables: TfVarDefinition[] = [] // variables that must be configured by the user via user input
    authAccounts: string[] = [''] // uuids of auth accounts to use, TODO for now will use with single account, but allowing for multiple in the future
    parentTemplates: string[] = [''] // optional uuids of parent templates - i.e. silo template ids for instance template
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
    recordData : TemplateData = new TemplateData()
}

class TemplateInput {
    type: TemplateType = TemplateType.UNDEFINED
    repoUrl: string = ''
    repoPath: string = ''
    repoPointer: string = ''
    providers: ProviderType[] = []
    authAccounts: string[] = ['']
    parentTemplates: string[] = ['']
}

class TfVarDefinition {
    key: string = ''
    type: TfVariableType = TfVariableType.STRING
    typestring: string = '' // to define complex types, i.e. objects or lists
    hasDefault: boolean = false
    value: string | null = null // default value
}

export { Template, TemplateInput, TemplateType, TfVarDefinition, ProviderType, TemplateData }