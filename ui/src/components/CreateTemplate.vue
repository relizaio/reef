<template>
    <div>
        <h4>Create Template</h4>
        <n-form :model="template">
            <n-form-item
                    path="type"
                    label="Type">
                <n-select
                    v-model:value="template.type"
                    v-on:update:value="handleTemplateTypeSwitch"
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
            <n-form-item
                    v-if="template.type === 'INSTANCE'"
                    path="parentTemplates"
                    label="Parent Templates (Silo Templates This Can Be Used With)">
                    <n-select
                        v-model:value="template.parentTemplates"
                        multiple
                        :options="parentTemplates" />
            </n-form-item>
            <n-button @click="createTemplate" type="success">Create</n-button>
        </n-form>
    </div>
</template>

<script lang="ts">
import { ref, Ref } from 'vue'
import { NButton, NDynamicInput, NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import Swal from 'sweetalert2'
import commonFunctions from '../utils/commonFunctions'

export default {
    name: 'CreateTemplate',
    components: {
        NButton, NDynamicInput, NForm, NFormItem, NInput, NSelect
    },
    props: {
    },
    emits: ['templateCreated'],
    async setup(props : any , { emit } : any) {

        const accounts: Ref<any[]> = ref([])
        const parentTemplates: Ref<any[]> = ref([])

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
            try {
                await graphqlClient
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
                emit('templateCreated')
            } catch (err: any) {
                Swal.fire(
                    'Error!',
                    commonFunctions.parseGraphQLError(err.message),
                    'error')
            }
            
        }

        async function handleTemplateTypeSwitch() {
            if (template.value.type === 'INSTANCE') await loadParentTemplates()
        }

        async function loadParentTemplates() {
            const tmplResponse = await graphqlClient.query({
                query: gql`
                    query getAllTemplates {
                        getAllTemplates {
                            id
                            status
                            recordData {
                                type
                                repoUrl
                                repoPath
                                repoPointer
                                providers
                            }
                        }
                    }
                `,
            })
            parentTemplates.value = tmplResponse.data.getAllTemplates
                .filter((t: any) => t.status === 'ACTIVE' && t.recordData.type === 'SILO')
                .map((t: any) => {
                    return {
                        label: t.id + ' ' + t.recordData.providers + ' ' + t.recordData.type,
                        value: t.id
                    }
                })
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
            handleTemplateTypeSwitch,
            parentTemplates,
            providers,
            template,
            types
        }
    }
}

</script>

<style scoped lang="scss">

</style>
