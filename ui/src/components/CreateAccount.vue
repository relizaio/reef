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
            <n-button type="success">Create AWS Account</n-button>
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
            <n-button @click="createAzureAccount" type="success">Create Azure Account</n-button>
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
            <n-button @click="createGitAccount" type="success">Create Git Account</n-button>
        </n-form>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NInput, NForm, NFormItem, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import commonFunctions from '@/utils/commonFunctions'

export default {
    name: 'CreateAccount',
    components: {
        NButton, NInput, NForm, NFormItem, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {

        const providerTypes = [
            {
                label: 'AWS',
                value: 'AWS'
            }, {
                label: 'Azure',
                value: 'AZURE'
            }, 
            {
                label: 'Git',
                value: 'GIT'
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

        async function createAzureAccount () {
            const gqlRes = await graphqlClient
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
            console.log(gqlRes)
        }

        async function createGitAccount () {
            const gqlRes = await graphqlClient
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
            console.log(gqlRes)
        }

        return {
            createAzureAccount,
            createGitAccount,
            awsAccount,
            azureAccount,
            gitAccount,
            gitRepositoryVendors,
            providerTypes,
            selectedProviderType
        }
    }
}

</script>

<style scoped lang="scss">

</style>
