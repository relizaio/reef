import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String,
        getSilo(siloId: ID!): Silo
    },
    type Mutation {
        createSilo(templateId: ID!, userVariables: [KeyValueInput]): Silo,
        destroySilo(siloId: ID!): Boolean,
        createInstance(siloId: ID!): Boolean,
        destroyInstance(instanceId: ID!): Boolean,
        createTemplate(templateInput: TemplateInput!): Template,
        createAzureAccount(azureAccount: AzureAccountInput!): AccountId,
        createGitAccount(gitAccount: GitAccountInput!): AccountId
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
    },
    input KeyValueInput {
        key: String
        value: String
    },
    type AccountId {
        id: String
    },
    type Silo {
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
    }
`

export default {
    typeDefs: typeDefs
}