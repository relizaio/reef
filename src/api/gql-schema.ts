import gql from 'graphql-tag'

const typeDefs = gql`
    type Query {
        hello: String,
        getSilo(siloId: ID!): Silo
    },
    type Mutation {
        createSilo(templateId: ID!, userVariables: String): Silo,
        destroySilo(siloId: ID!): Boolean,
        createInstance(siloId: ID!): Boolean,
        destroyInstance(instanceId: ID!): Boolean,
        createTemplate(templateInput: TemplateInput!): Template
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
    input TemplateInput {
        type: TemplateType!
        repoUrl: String
        repoPath: String
        repoPointer: String
        providers: [ProviderType]
    },
    type Silo {
        id: ID!
        status: String
        properties: [SiloProperty]
    },
    type SiloProperty {
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