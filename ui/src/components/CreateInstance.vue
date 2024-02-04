<template>
    <div>
        <h4>Create Instance</h4>
        <n-form :model="instance">
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
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDynamicInput, NForm, NFormItem, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import commonFunctions from '@/utils/commonFunctions'

export default {
    name: 'CreateInstance',
    components: {
        NButton, NDynamicInput, NForm, NFormItem, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()

        const silos: Ref<any[]> = ref([])
        const silosForSelection: Ref<any[]> = ref([])
        const templates: Ref<any[]> = ref([])
        const templatesForSelection: Ref<any[]> = ref([])

        const instance = ref({
            templateId: '',
            siloId: '',
            userVariables: []
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
                            label: t.recordData.providers + ' - ' + t.recordData.repoUrl + ' - ' + t.recordData.repoPath + ' - ' + t.recordData.repoPointer,
                            value: t.id
                        }
                    })
            }
        }

        async function onInstanceTemplateSelected () {
            const selectedTemplate = await loadTemplateWithVariables(instance.value.templateId)
            instance.value.userVariables = commonFunctions.deepCopy(selectedTemplate.recordData.userVariables)
        }

        async function createInstance () {
            const gqlRes = await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateInstance($siloId: ID!, $templateId: ID!, $userVariables: [KeyValueInput]) {
                            createInstance(siloId: $siloId, templateId: $templateId, userVariables: $userVariables) {
                                id
                            }
                        }`,
                    variables: instance.value
                })
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
                                }
                            }
                        }
                    }
                `,
            })
            silos.value = silosResponse.data.getAllActiveSilos
            silosForSelection.value = silosResponse.data.getAllActiveSilos.map((s: any) => {
                return {
                    label: s.id + " " + s.template.recordData.providers,
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
