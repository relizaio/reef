<template>
    <div>
        <h4>Create Instance</h4>
        <n-form :model="instance">
            <n-form-item
                    path="description"
                    label="Instance Name">
                <n-input
                    placeholder="Enter Instance Name (Optional)"
                    v-model:value="instance.description" />
            </n-form-item>
            <n-form-item
                    path="typsiloIde"
                    label="Silo">
                <n-select
                    v-model:value="instance.siloId"
                    v-on:update:value="updateTemplatesForSelection"
                    required
                    :options="silosForSelection" />
            </n-form-item>
            <n-form-item
                    v-if="instance.siloId"
                    path="templateId"
                    label="Template">
                <n-select
                    v-model:value="instance.templateId"
                    v-on:update:value="onInstanceTemplateSelected"
                    required
                    :options="templatesForSelection" />
            </n-form-item>
            <n-form-item
                v-if="instance.siloId && instance.userVariables && instance.userVariables.length">
                <label>Set Properties</label>
                <n-dynamic-input
                    v-model:value="instance.userVariables"
                    preset="pair"
                    key-placeholder="Please input the key"
                    value-placeholder="Please input the value" />
            </n-form-item>
            <n-button @click="createInstance" type="success">Create</n-button>
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
    name: 'CreateInstance',
    components: {
        NButton, NDynamicInput, NForm, NFormItem, NInput, NSelect
    },
    props: {
    },
    emits: ['instanceCreated'],
    async setup(props : any, { emit } : any) {

        const silos: Ref<any[]> = ref([])
        const silosForSelection: Ref<any[]> = ref([])
        const templates: Ref<any[]> = ref([])
        const templatesForSelection: Ref<any[]> = ref([])

        const initUserVars: any[] = []
        const instance = ref({
            templateId: '',
            siloId: '',
            userVariables: initUserVars,
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
                                parentTemplates
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

        async function updateTemplatesForSelection() {
            const silo = silos.value.find((a: any) => a.id === instance.value.siloId)
            if (silo) {
                templatesForSelection.value = templates.value
                    .filter((t: any) => {
                        return (t.recordData.type === 'INSTANCE' && t.recordData.parentTemplates &&
                        t.recordData.parentTemplates.includes(silo.template.id))
                    })
                    .map((t: any) => {
                        return {
                            label: t.recordData.description + ' - ' + t.recordData.providers + ' - ' + t.recordData.repoUrl + ' - ' + t.recordData.repoPath + ' - ' + t.recordData.repoPointer,
                            value: t.id
                        }
                    })
            }
        }

        async function onInstanceTemplateSelected () {
            const selectedTemplate = await loadTemplateWithVariables(instance.value.templateId)
            const silo = silos.value.find((a: any) => a.id === instance.value.siloId)
            const existingSiloKeys = silo.properties.map((prop: any) => prop.key)
            const userVars: any[] = []
            selectedTemplate.recordData.userVariables.forEach((uv: any) => {
                if (!existingSiloKeys.includes(uv.key)) userVars.push(uv)
            });
            instance.value.userVariables = userVars
        }

        async function createInstance () {
            try {
                await graphqlClient
                    .mutate({
                        mutation: gql`
                            mutation CreateInstance($siloId: ID!, $templateId: ID!, $userVariables: [KeyValueInput], $description: String) {
                                createInstance(siloId: $siloId, templateId: $templateId, userVariables: $userVariables, description: $description) {
                                    id
                                }
                            }`,
                        variables: instance.value
                    })
                emit('instanceCreated')
            } catch (err: any) {
                Swal.fire(
                    'Error!',
                    commonFunctions.parseGraphQLError(err.message),
                    'error')
            }
        }

        async function loadSilos () {
            const silosResponse = await graphqlClient.query({
                query: gql`
                    query getAllActiveSilos {
                        getAllActiveSilos {
                            id
                            template {
                                id
                                status
                                recordData {
                                    type
                                    providers
                                    parentTemplates
                                    description
                                }
                            }
                            properties {
                                key
                            }
                        }
                    }
                `,
            })
            silos.value = silosResponse.data.getAllActiveSilos
            silosForSelection.value = silosResponse.data.getAllActiveSilos.map((s: any) => {
                return {
                    label: s.template.recordData.description + " - " + s.template.recordData.providers,
                    value: s.id
                }
            })
        }

        const onCreate = async function () {
            loadSilos()
            loadTemplates()
        }

        await onCreate()

        return {
            createInstance,
            instance,
            onInstanceTemplateSelected,
            silosForSelection,
            templatesForSelection,
            updateTemplatesForSelection
        }
    }
}

</script>

<style scoped lang="scss">

</style>
