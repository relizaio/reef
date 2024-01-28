<template>
    <div>
        <h4>Templates</h4>
        <vue-feather
            @click="showCreateTemplateModal = true"
            class="icons clickable"
            type="plus-circle"
            title="Add Template" />
        <n-data-table
            :columns="templateFields"
            :data="templates"
            :pagination="templatePagination"
            size="small" />
        <n-modal
            v-model:show="showCreateTemplateModal"
            preset="dialog"
            :show-icon="false">
            <create-template />
        </n-modal>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDataTable, NModal, NPopover, NSelect, DataTableColumns, useNotification, NotificationType } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import CreateTemplate from './CreateTemplate.vue'

export default {
    name: 'TemplatesList',
    components: {
        CreateTemplate,
        NButton, NDataTable, NModal, NPopover, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()
        const notification = useNotification()

        const showCreateTemplateModal = ref(false)

        const templateFields: DataTableColumns<any> = [
            {
                key: 'repoUrl',
                title: 'Git Repository',
                render: (row: any) => {
                    return row.recordData.repoUrl
                }
            },
            {
                key: 'repoPath',
                title: 'Path within Repository',
                render: (row: any) => {
                    return row.recordData.repoPath
                }
            },
            {
                key: 'repoPointer',
                title: 'Pointer',
                render: (row: any) => {
                    return row.recordData.repoPointer
                }
            },
            {
                key: 'type',
                title: 'Type',
                render: (row: any) => {
                    return row.recordData.type
                }
            },
            {
                key: 'providers',
                title: 'Providers',
                render: (row: any) => {
                    return row.recordData.providers
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
                variables: {
                    status: 'ACTIVE'
                }
            })
            templates.value = tmplResponse.data.getTemplates
        }

        const onCreate = async function () {
            loadTemplates()
        }

        await onCreate()

        return {
            showCreateTemplateModal,
            templateFields,
            templatePagination,
            templates
        }
    }
}

</script>

<style scoped lang="scss">

</style>
