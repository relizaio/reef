<template>
    <div>
        <h4>Silos</h4>
        <vue-feather 
            class="icons clickable"
            type="plus-circle"
            @click="showCreateSiloModal = true"
            title="Add Silo" />
        <n-data-table
            :columns="siloFields"
            :data="silos"
            :pagination="siloPagination"
            size="small" />
        <n-modal
            v-model:show="showCreateSiloModal"
            preset="dialog"
            :show-icon="false">
            <create-silo 
                @siloCreated="siloCreated"/>
        </n-modal>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDataTable, NIcon, NModal, NPopover, NSelect, DataTableColumns, useNotification, NotificationType } from 'naive-ui'
import { Trash } from '@vicons/tabler'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import CreateSilo from './CreateSilo.vue'

export default {
    name: 'SilosList',
    components: {
        CreateSilo,
        NButton, NDataTable, NModal, NPopover, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()
        const notification = useNotification()

        const siloFields: DataTableColumns<any> = [
            {
                key: 'id',
                title: 'Id'
            },
            {
                key: 'status',
                title: 'Status'
            },
            {
                key: 'controls',
                title: 'Controls',
                render: (row: any) => {
                    return h(NIcon, {
                            size: 22,
                            class: 'icons clickable',
                            title: 'Destroy Instance',
                            onClick: () => destroySilo(row.id)
                        }, {
                            default: () => h(Trash)
                        })
                }
            }
        ]

        const siloPagination = store.getters.siloPagination

        const silos: Ref<any[]> = ref([])

        const showCreateSiloModal = ref(false)

        const notify = async function (type: NotificationType, title: string, content: string) {
            notification[type]({
                content: content,
                meta: title,
                duration: 3500,
                keepAliveOnHover: true
            })
        }

        async function loadSilos() {
            const silosResponse = await graphqlClient.query({
                query: gql`
                    query getAllActiveSilos {
                        getAllActiveSilos {
                            id
                            status
                        }
                    }
                `,
                fetchPolicy: 'no-cache'
            })
            silos.value = silosResponse.data.getAllActiveSilos
            console.log(silos.value)
        }

        async function destroySilo (siloId: string) {
            await graphqlClient
                .mutate({
                    mutation: gql`
                        mutation destroySilo($siloId: ID!) {
                            destroySilo(siloId: $siloId)
                        }`,
                    variables: {
                        siloId
                    }
                })
        }

        const siloCreated = async function () {
            showCreateSiloModal.value = false
            onCreate()
            notify('info', 'Created', 'Silo scheduled for creation.')
        }

        const onCreate = async function () {
            loadSilos()
        }

        await onCreate()

        return {
            showCreateSiloModal,
            siloCreated,
            siloFields,
            siloPagination,
            silos
        }
    }
}

</script>

<style scoped lang="scss">

</style>
