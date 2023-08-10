import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String,
        getSilo(siloId: ID!): Silo,
        getInstance(instanceId: ID!): Instance,
        getAllActiveSilos: [Silo],
        getAllActiveInstances: [Instance],
        getAllActiveAccounts: [Account],
        getInstancesOfSilo(siloId: ID!): [Instance],
        getAllTemplates: [Template]
    },
    type Mutation {
        createSilo(templateId: ID!, userVariables: [KeyValueInput]): Silo,
        updateSilo(siloId: ID!, templateIds: [ID]): Silo,
        destroySilo(siloId: ID!): Boolean,
        createInstance(siloId: ID!, templateId: ID!): Instance,
        destroyInstance(instanceId: ID!): Boolean,
        createTemplate(templateInput: TemplateInput!): Template,
        createAwsAccount(awsAccount: AwsAccountInput!): Account,
        createAzureAccount(azureAccount: AzureAccountInput!): Account,
        createGitAccount(gitAccount: GitAccountInput!): Account
    },
    enum ProviderType {
        AZURE
        AWS
        GCP
        HETZNER
        OVH
    },
    enum TemplateType {
        SILO
        INSTANCE
    },
    input AwsAccountInput {
        region: String!
        accessKey: String!
        secretKey: String!
    },
    input AzureAccountInput {
        subscriptionId: String!
        clientId: String!
        clientSecret: String!
        tenantId: String!
        resourceGroupName: String
    },
    input GitAccountInput {
        username: String!
        token: String!
        repositoryVendor: String
    },
    input TemplateInput {
        type: TemplateType!
        repoUrl: String
        repoPath: String
        repoPointer: String
        providers: [ProviderType]
        authAccounts: [ID]
        parentTemplates: [ID]
    },
    input KeyValueInput {
        key: String
        value: String
    },
    type Account {
        id: ID
        providerName: String
    },
    type Silo {
        id: ID!
        status: String
        template: Template
        properties: [KeyValue]
    },
    type Instance {
        id: ID!
        status: String
        properties: [KeyValue]
    },
    type KeyValue {
        key: String
        value: String
    },
    type Template {
        id: ID!
        status: String
        recordData: TemplateData
    }

    type TemplateData {
        type: TemplateType
        repoUrl: String
        repoPath: String
        repoPointer: String
        providers: [ProviderType]
        authAccounts: [ID]
        parentTemplates: [ID]
        userVariables: [KeyValue]
    }
`

export default {
    typeDefs: typeDefs
}