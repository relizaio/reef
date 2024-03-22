<template>
    <div>
        <h4>Create Silo</h4>
        <n-form>
            <label>Silo Name</label>
            <n-input
                placeholder="Enter Silo Name (Optional)"
                v-model:value="silo.description" />
            <label>Select Template</label>
            <n-select
                v-model:value="silo.templateId"
                v-on:update:value="onTemplateSelected"
                required
                :options="templatesForSelection" />
            <div
                style="margin-top:20px;"
                v-if="silo.userVariables && silo.userVariables.length">
                <label>Set Properties</label>
                <n-dynamic-input
                    v-model:value="silo.userVariables"
                    preset="pair"
                    key-placeholder="Please input the key"
                    value-placeholder="Please input the value" />
                <n-button @click="createSilo" type="success">Create</n-button>
            </div>
        </n-form>
    </div>
</template>

<script lang="ts">
import { ref, Ref } from 'vue'
import { NButton, NDynamicInput, NForm, NInput, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import Swal from 'sweetalert2'
import commonFunctions from '../utils/commonFunctions'

export default {
    name: 'CreateSilo',
    components: {
        NButton, NDynamicInput, NForm, NInput, NSelect
    },
    props: {
    },
    emits: ['siloCreated'],
    async setup(props : any, { emit } : any) {

        const templates: Ref<any[]> = ref([])
        const templatesForSelection: Ref<any[]> = ref([])

        const silo = ref({
            templateId: '',
            userVariables: [],
            description: ''
        })

        async function loadTemplates() {
            const tmplResponse = await graphqlClient.query({
                query: gql`
                    query getTemplates($status: String) {
                        getTemplates(status: $status) {
                            id
                            status
                            recordData {
                                type
                                repoUrl
                                repoPath
                                repoPointer
                                providers
                                description
                            }
                        }
                    }
                `,
                variables: {
                    status: 'ACTIVE'
                }
            })
            templates.value = tmplResponse.data.getTemplates
            templatesForSelection.value = tmplResponse.data.getTemplates
                .filter((t: any) => t.recordData.type === 'SILO')
                .map((t: any) => {
                    return {
                        label: t.recordData.description + ' - ' + t.recordData.providers + ' - ' + t.recordData.repoUrl + ' - ' + t.recordData.repoPath + ' - ' + t.recordData.repoPointer,
                        value: t.id
                    }
            })
        }

        async function loadTemplateWithVariables (templateId: string) {
            const tmplResponse = await graphqlClient.query({
                query: gql`
                    query getTemplate($templateId: ID!) {
                        getTemplate(templateId: $templateId) {
                            id
                            status
                            recordData {
                                type
                                repoUrl
                                repoPath
                                repoPointer
                                providers
                                description
                                userVariables {
                                    key
                                    value
                                }
                            }
                        }
                    }
                `,
                variables: {
                    templateId
                }
            })
            return tmplResponse.data.getTemplate
        }

        async function onTemplateSelected () {
            const selectedTemplate = await loadTemplateWithVariables(silo.value.templateId)
            silo.value.userVariables = commonFunctions.deepCopy(selectedTemplate.recordData.userVariables)
        }

        async function createSilo () {
            try {
                await graphqlClient
                    .mutate({
                        mutation: gql`
                            mutation CreateSilo($templateId: ID!, $userVariables: [KeyValueInput], $description: String) {
                                createSilo(templateId: $templateId, userVariables: $userVariables, description: $description) {
                                    id
                                }
                            }`,
                        variables: silo.value
                    })
                emit('siloCreated')
            } catch (err: any) {
                Swal.fire(
                    'Error!',
                    commonFunctions.parseGraphQLError(err.message),
                    'error')
            }
        }

        const onCreate = async function () {
            loadTemplates()
        }

        await onCreate()

        return {
            createSilo,
            onTemplateSelected,
            silo,
            templatesForSelection
        }
    }
}

</script>

<style scoped lang="scss">

</style>
