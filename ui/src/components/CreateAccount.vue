<template>
    <div>
        <h4>Create Account</h4>
        <n-select
            v-model:value="selectedProviderType"
            required
            :options="providerTypes" />
        <n-form
            v-if="selectedProviderType === 'AWS'"
            :model="awsAccount">
            <n-form-item
                    path="accessKey"
                    label="Access Key">
                <n-input
                    placeholder="Enter Access Key"
                    v-model:value="awsAccount.accessKey" />
            </n-form-item>
            <n-form-item
                    path="secretKey"
                    label="Secret Key">
                <n-input
                    placeholder="Enter Secret Key"
                    v-model:value="awsAccount.secretKey" />
            </n-form-item>
            <n-form-item
                    path="region"
                    label="Region">
                <n-input
                    placeholder="Enter Region"
                    v-model:value="awsAccount.region" />
            </n-form-item>
            <n-button @click="createAccountWrapper(AccountType.AWS)" type="success">Create AWS Account</n-button>
        </n-form>
        <n-form
            v-if="selectedProviderType === 'AZURE'"
            :model="azureAccount">
            <n-form-item
                    path="clientId"
                    label="Client ID">
                <n-input
                    placeholder="Enter Client ID"
                    v-model:value="azureAccount.clientId" />
            </n-form-item>
            <n-form-item
                    path="clientSecret"
                    label="Client Secret">
                <n-input
                    placeholder="Enter Client Secret"
                    v-model:value="azureAccount.clientSecret" />
            </n-form-item>
            <n-form-item
                    path="subscriptionId"
                    label="Subscription ID">
                <n-input
                    placeholder="Enter Subscription ID"
                    v-model:value="azureAccount.subscriptionId" />
            </n-form-item>
            <n-form-item
                    path="tenantId"
                    label="Tenant ID">
                <n-input
                    placeholder="Enter Tenant ID"
                    v-model:value="azureAccount.tenantId" />
            </n-form-item>
            <n-button @click="createAccountWrapper(AccountType.Azure)" type="success">Create Azure Account</n-button>
        </n-form>
        <n-form
            v-if="selectedProviderType === 'GIT'"
            :model="gitAccount">
            <n-form-item
                    path="username"
                    label="Username">
                <n-input
                    placeholder="Enter Username"
                    v-model:value="gitAccount.username" />
            </n-form-item>
            <n-form-item
                    path="token"
                    label="Password or Token">
                <n-input
                    placeholder="Enter Password or Token"
                    type="password"
                    v-model:value="gitAccount.token" />
            </n-form-item>
            <n-button @click="createAccountWrapper(AccountType.GitHttps)" type="success">Create Git HTTPS Account</n-button>
        </n-form>
        <n-form
            v-if="selectedProviderType === 'GITSSH'"
            :model="gitSshAccount">
            <n-form-item
                    path="username"
                    label="Username">
                <n-input
                    placeholder="Enter Username"
                    v-model:value="gitSshAccount.username" />
            </n-form-item>
            <n-button @click="createAccountWrapper(AccountType.GitSsh)" type="success">Create Git SSH Account</n-button>
        </n-form>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { NButton, NInput, NForm, NFormItem, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import Swal from 'sweetalert2'
import commonFunctions from '../utils/commonFunctions'

export default {
    name: 'CreateAccount',
    components: {
        NButton, NInput, NForm, NFormItem, NSelect
    },
    props: {
    },
    emits: ['accountCreated'],
    async setup(props : any, { emit } : any) {

        const providerTypes = [
            {
                label: 'AWS',
                value: 'AWS'
            }, {
                label: 'Azure',
                value: 'AZURE'
            }, 
            {
                label: 'Git HTTPS',
                value: 'GIT'
            }, 
            {
                label: 'Git SSH',
                value: 'GITSSH'
            }
        ]
        const gitRepositoryVendors = ['GITHUB', 'GITLAB', 'BITBUCKET']

        const selectedProviderType = ref('')

        const awsAccount = ref({
            accessKey: '',
            secretKey: '',
            region: ''
        })

        const azureAccount = ref({
            clientId: '',
            clientSecret: '',
            resourceGroupName: '', // optional
            subscriptionId: '',
            tenantId: ''
        })

        const gitAccount = ref({
            token: '',
            username: '',
            repositoryVendor: ''
        })

        const gitSshAccount = ref({
            username: ''
        })

        async function createAccountWrapper (accountType: AccountType) {
            try {
                switch (accountType) {
                    case AccountType.GitHttps:
                        await createGitHttpsAccount()
                        emit('accountCreated')
                        break
                    case AccountType.AWS:
                        await createAwsAccount()
                        emit('accountCreated')
                        break
                    case AccountType.Azure:
                        await createAzureAccount()
                        emit('accountCreated')
                        break
                    case AccountType.GitSsh:
                        const sshAct = await createGitSshAccount()
                        console.log(sshAct)
                        Swal.fire('Account SSH Public Key', sshAct.data.createGitSshAccount.pubkey, 'info')
                        emit('accountCreated')
                        break
                    default:
                        console.log('unknown account')
                        break
                }
            } catch (err: any) {
                Swal.fire(
                    'Error!',
                    commonFunctions.parseGraphQLError(err.message),
                    'error')
            }
        }

        async function createAwsAccount () {
            await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateAwsAccount($awsAccount: AwsAccountInput!) {
                            createAwsAccount(awsAccount: $awsAccount) {
                                id
                            }
                        }`,
                    variables: {
                        awsAccount: awsAccount.value
                    }
                })
        }

        async function createAzureAccount () {
            await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateAzureAccount($azureAccount: AzureAccountInput!) {
                            createAzureAccount(azureAccount: $azureAccount) {
                                id
                            }
                        }`,
                    variables: {
                        azureAccount: azureAccount.value
                    }
                })
        }

        async function createGitHttpsAccount () {
            await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateGitAccount($gitAccount: GitAccountInput!) {
                            createGitAccount(gitAccount: $gitAccount) {
                                id
                            }
                        }`,
                    variables: {
                        gitAccount: gitAccount.value
                    }
                })
        }

        async function createGitSshAccount () {
            return await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateGitSshAccount($gitAccount: GitSshAccountInput!) {
                            createGitSshAccount(gitAccount: $gitAccount) {
                                id
                                pubkey
                            }
                        }`,
                    variables: {
                        gitAccount: gitSshAccount.value
                    }
                })
        }

        enum AccountType {
            GitHttps,
            GitSsh,
            AWS,
            Azure
        }

        return {
            AccountType,
            createAccountWrapper,
            awsAccount,
            azureAccount,
            gitAccount,
            gitSshAccount,
            gitRepositoryVendors,
            providerTypes,
            selectedProviderType
        }
    }
}

</script>

<style scoped lang="scss">

</style>
