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
                    v-on:update:value="updateTemplatesForSelection"
                    required
                    :options="templatesForSelection" />
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
            siloId: ''
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
                                userVariables {
                                    key
                                    value
                                }
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
                            label: t.id + ' ' + t.recordData.providers + ' ' + t.recordData.type,
                            value: t.id
                        }
                    })
            }
        }

        async function createInstance () {
            const gqlRes = await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateInstance($siloId: ID!, $templateId: ID!) {
                            createInstance(siloId: $siloId, templateId: $templateId) {
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
            silosForSelection,
            templatesForSelection,
            updateTemplatesForSelection
        }
    }
}

</script>

<style scoped lang="scss">

</style>
