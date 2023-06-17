import constants from '../utils/constants'

class TemplateData {
    type: TemplateType = TemplateType.UNDEFINED
    repoUrl: string = ''
    repoPath: string = ''
    repoPointer: string = '' // this can be git branch, git tag, git hash
    providers: ProviderType[] = []
    userVariables: string[] = [] // variables configured by the user via user input
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

export { Template, TemplateInput, TemplateType, ProviderType, TemplateData }