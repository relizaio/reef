<template>
    <div>
        <h4>Templates</h4>
        <vue-feather class="icons clickable" type="plus-circle" title="Add Template" />
        <n-data-table
            :columns="templateFields"
            :data="templates"
            :pagination="templatePagination"
            size="small" />
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDataTable, NModal, NPopover, NSelect, DataTableColumns, useNotification, NotificationType } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'

export default {
    name: 'TemplatesList',
    components: {
        NButton, NDataTable, NModal, NPopover, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()
        const notification = useNotification()

        const templateFields: DataTableColumns<any> = [
            {
                key: 'type',
                title: 'TYPE',
                render: (row: any) => {
                    return row.recordData.type
                }
            }
        ]

        const templatePagination = store.getters.templatePagination

        const templates: Ref<any[]> = ref([])

        const notify = async function (type: NotificationType, title: string, content: string) {
            notification[type]({
                content: content,
                meta: title,
                duration: 3500,
                keepAliveOnHover: true
            })
        }

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
                                authAccounts
                                parentTemplates
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
            console.log(templates.value)
        }

        const onCreate = async function () {
            loadTemplates()
        }

        await onCreate()

        return {
            templateFields,
            templatePagination,
            templates
        }
    }
}

</script>

<style scoped lang="scss">

</style>
