<template>
    <div>
        <h4>Create Template</h4>
        <n-form :model="template">
            <n-form-item
                    path="type"
                    label="Type">
                <n-select
                    v-model:value="template.type"
                    required
                    :options="types" />
            </n-form-item>
            <n-form-item
                    path="repoUrl"
                    label="Git Repo URL">
                <n-input
                    placeholder="Enter Git Repository URL"
                    v-model:value="template.repoUrl" />
            </n-form-item>
            <n-form-item
                    path="repoPath"
                    label="Git Repo Path">
                <n-input
                    placeholder="Enter Git Repository Relative Path"
                    v-model:value="template.repoPath" />
            </n-form-item>
            <n-form-item
                    path="repoPointer"
                    label="Git Repo Pointer (branch name, commit hash or tag)">
                <n-input
                    placeholder="Enter Git Repository Pointer"
                    v-model:value="template.repoPointer" />
            </n-form-item>
            <n-form-item
                    path="providers"
                    label="Providers">
                    <n-select
                        v-model:value="template.providers"
                        multiple
                        :options="providers" />
            </n-form-item>
            <n-form-item
                    path="authAccounts"
                    label="Authentication Accounts">
                    <n-select
                        v-model:value="template.authAccounts"
                        multiple
                        :options="accounts" />
            </n-form-item>
            <n-button @click="createTemplate" type="success">Create</n-button>
        </n-form>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDynamicInput, NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import commonFunctions from '@/utils/commonFunctions'

export default {
    name: 'CreateTemplate',
    components: {
        NButton, NDynamicInput, NForm, NFormItem, NInput, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {

        const accounts: Ref<any[]> = ref([])

        const template = ref({
            type: '',
            repoUrl: '',
            repoPath: '',
            repoPointer: '',
            authAccounts: [],
            providers: [],
            parentTemplates: []
        })
        const types = [
            {
                label: 'Silo',
                value: 'SILO'
            },
            {
                label: 'Instance',
                value: 'INSTANCE'
            }
        ]

        const providers = [
            {
                label: 'AWS',
                value: 'AWS'
            },
            {
                label: 'Azure',
                value: 'AZURE'
            }
        ]

        async function createTemplate() {
            const gqlRes = await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateTemplate($templateInput: TemplateInput!) {
                            createTemplate(templateInput: $templateInput) {
                                id
                            }
                        }`,
                    variables: {
                        templateInput: template.value
                    }
                })
            console.log(gqlRes)
        }

        async function loadAccounts() {
            const acctResponse = await graphqlClient.query({
                query: gql`
                    query getAllActiveAccounts {
                        getAllActiveAccounts {
                            id
                            providerName
                        }
                    }
                `,
            })
            accounts.value = acctResponse.data.getAllActiveAccounts.map((a: any) => {
                return {
                    label: a.id + ' ' + a.providerName,
                    value: a.id
                }
            })
        }

        await loadAccounts()

        return {
            accounts,
            createTemplate,
            providers,
            template,
            types
        }
    }
}

</script>

<style scoped lang="scss">

</style>
