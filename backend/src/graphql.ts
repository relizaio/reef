
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ProviderType {
    AZURE = "AZURE",
    AWS = "AWS",
    GCP = "GCP",
    HETZNER = "HETZNER",
    OVH = "OVH"
}

export enum TemplateType {
    SILO = "SILO",
    INSTANCE = "INSTANCE"
}

export class AwsAccountInput {
    region: string;
    accessKey: string;
    secretKey: string;
    description?: Nullable<string>;
}

export class AzureAccountInput {
    subscriptionId: string;
    clientId: string;
    clientSecret: string;
    tenantId: string;
    resourceGroupName?: Nullable<string>;
    description?: Nullable<string>;
}

export class GitAccountInput {
    username: string;
    token: string;
    repositoryVendor?: Nullable<string>;
    description?: Nullable<string>;
}

export class GitSshAccountInput {
    username: string;
    repositoryVendor?: Nullable<string>;
    description?: Nullable<string>;
}

export class TemplateInput {
    type: TemplateType;
    repoUrl?: Nullable<string>;
    repoPath?: Nullable<string>;
    repoPointer?: Nullable<string>;
    providers?: Nullable<Nullable<ProviderType>[]>;
    authAccounts?: Nullable<Nullable<string>[]>;
    parentTemplates?: Nullable<Nullable<string>[]>;
    description?: Nullable<string>;
}

export class KeyValueInput {
    key?: Nullable<string>;
    value?: Nullable<string>;
}

export abstract class IQuery {
    abstract hello(): Nullable<string> | Promise<Nullable<string>>;

    abstract getSilo(siloId: string): Nullable<Silo> | Promise<Nullable<Silo>>;

    abstract getInstance(instanceId: string): Nullable<Instance> | Promise<Nullable<Instance>>;

    abstract getTemplate(templateId: string): Nullable<Template> | Promise<Nullable<Template>>;

    abstract getAllActiveSilos(): Nullable<Nullable<Silo>[]> | Promise<Nullable<Nullable<Silo>[]>>;

    abstract getAllActiveInstances(): Nullable<Nullable<Instance>[]> | Promise<Nullable<Nullable<Instance>[]>>;

    abstract getAllActiveAccounts(): Nullable<Nullable<Account>[]> | Promise<Nullable<Nullable<Account>[]>>;

    abstract getInstancesOfSilo(siloId: string, statuses?: Nullable<Nullable<string>[]>): Nullable<Nullable<Instance>[]> | Promise<Nullable<Nullable<Instance>[]>>;

    abstract getAllTemplates(): Nullable<Nullable<Template>[]> | Promise<Nullable<Nullable<Template>[]>>;

    abstract getTemplates(status?: Nullable<string>): Nullable<Nullable<Template>[]> | Promise<Nullable<Nullable<Template>[]>>;
}

export abstract class IMutation {
    abstract createSilo(templateId: string, userVariables?: Nullable<Nullable<KeyValueInput>[]>, description?: Nullable<string>): Nullable<Silo> | Promise<Nullable<Silo>>;

    abstract updateSilo(siloId: string, templateIds?: Nullable<Nullable<string>[]>): Nullable<Silo> | Promise<Nullable<Silo>>;

    abstract destroySilo(siloId: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract createInstance(siloId: string, templateId: string, instanceId?: Nullable<string>, userVariables?: Nullable<Nullable<KeyValueInput>[]>, description?: Nullable<string>): Nullable<Instance> | Promise<Nullable<Instance>>;

    abstract destroyInstance(instanceId: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract createTemplate(templateInput: TemplateInput): Nullable<Template> | Promise<Nullable<Template>>;

    abstract createAwsAccount(awsAccount: AwsAccountInput): Nullable<Account> | Promise<Nullable<Account>>;

    abstract createAzureAccount(azureAccount: AzureAccountInput): Nullable<Account> | Promise<Nullable<Account>>;

    abstract createGitAccount(gitAccount: GitAccountInput): Nullable<Account> | Promise<Nullable<Account>>;

    abstract createGitSshAccount(gitAccount: GitSshAccountInput): Nullable<Account> | Promise<Nullable<Account>>;
}

export class Account {
    id?: Nullable<string>;
    providerName?: Nullable<string>;
    pubkey?: Nullable<string>;
    description?: Nullable<string>;
}

export class Silo {
    id: string;
    status?: Nullable<string>;
    template?: Nullable<Template>;
    properties?: Nullable<Nullable<KeyValue>[]>;
    description?: Nullable<string>;
}

export class Instance {
    id: string;
    status?: Nullable<string>;
    properties?: Nullable<Nullable<KeyValue>[]>;
    description?: Nullable<string>;
}

export class KeyValue {
    key?: Nullable<string>;
    value?: Nullable<string>;
}

export class Template {
    id: string;
    status?: Nullable<string>;
    recordData?: Nullable<TemplateData>;
}

export class TemplateData {
    type?: Nullable<TemplateType>;
    repoUrl?: Nullable<string>;
    repoPath?: Nullable<string>;
    repoPointer?: Nullable<string>;
    providers?: Nullable<Nullable<ProviderType>[]>;
    authAccounts?: Nullable<Nullable<string>[]>;
    parentTemplates?: Nullable<Nullable<string>[]>;
    userVariables?: Nullable<Nullable<KeyValue>[]>;
    description?: Nullable<string>;
}

type Nullable<T> = T | null;
