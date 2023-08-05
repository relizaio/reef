<template>
    <div>
        <h4>Create Silo</h4>
        <n-form>
            <n-select
                v-model:value="silo.templateId"
                v-on:update:value="onTemplateSelected"
                required
                :options="templatesForSelection" />
            <div
                v-if="silo.userVariables && silo.userVariables.length">
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
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDynamicInput, NForm, NSelect } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import commonFunctions from '@/utils/commonFunctions'

export default {
    name: 'CreateSilo',
    components: {
        NButton, NDynamicInput, NForm, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()

        const templates: Ref<any[]> = ref([])
        const templatesForSelection: Ref<any[]> = ref([])

        const silo = ref({
            templateId: '',
            userVariables: []
        })

        async function loadTemplates() {
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
                                userVariables {
                                    key
                                    value
                                }
                            }
                        }
                    }
                `,
            })
            templates.value = tmplResponse.data.getAllTemplates
            templatesForSelection.value = tmplResponse.data.getAllTemplates.map((t: any) => {
                return {
                    label: t.id + ' ' + t.recordData.providers + ' ' + t.recordData.type,
                    value: t.id
                }
            })
            console.log(templates.value)
        }

        async function onTemplateSelected () {
            const selectedTemplate = templates.value.filter(t => t.id === silo.value.templateId)[0]
            silo.value.userVariables = commonFunctions.deepCopy(selectedTemplate.recordData.userVariables)
        }

        async function createSilo () {
            const gqlRes = await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation CreateSilo($templateId: ID!, $userVariables: [KeyValueInput]) {
                            createSilo(templateId: $templateId, userVariables: $userVariables) {
                                id
                            }
                        }`,
                    variables: silo.value
                })
            console.log(gqlRes)
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
