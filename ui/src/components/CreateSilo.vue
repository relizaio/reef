<template>
    <div>
        <h4>Create Silo</h4>
        <n-form>
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
            templatesForSelection.value = tmplResponse.data.getTemplates
                .filter((t: any) => t.recordData.type === 'SILO')
                .map((t: any) => {
                    return {
                        label: t.recordData.providers + ' - ' + t.recordData.repoUrl + ' - ' + t.recordData.repoPath + ' - ' + t.recordData.repoPointer,
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
