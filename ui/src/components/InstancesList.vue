<template>
    <div>
        <h4>Instances</h4>
        <vue-feather 
            class="icons clickable"
            type="plus-circle"
            @click="showCreateInstanceModal = true"
            title="Create Instance" />
        <n-data-table
            :columns="instanceFields"
            :data="instances"
            :pagination="instancePagination"
            size="small" />
        <n-modal
            v-model:show="showCreateInstanceModal"
            preset="dialog"
            :show-icon="false">
            <create-instance />
        </n-modal>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDataTable, NModal, NPopover, NSelect, DataTableColumns, useNotification, NotificationType } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'
import CreateInstance from './CreateInstance.vue'

export default {
    name: 'InstancesList',
    components: {
        CreateInstance,
        NButton, NDataTable, NModal, NPopover, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()
        const notification = useNotification()

        const instanceFields: DataTableColumns<any> = [
            {
                key: 'id',
                title: 'ID'
            },
            {
                key: 'status',
                title: 'Status'
            }
        ]

        const instancePagination = store.getters.instancePagination

        const instances: Ref<any[]> = ref([])

        const showCreateInstanceModal = ref(false)

        const notify = async function (type: NotificationType, title: string, content: string) {
            notification[type]({
                content: content,
                meta: title,
                duration: 3500,
                keepAliveOnHover: true
            })
        }

        async function loadInstances() {
            const instResponse = await graphqlClient.query({
                query: gql`
                    query getAllActiveInstances {
                        getAllActiveInstances {
                            id
                            status
                        }
                    }
                `,
            })
            instances.value = instResponse.data.getAllActiveInstances
        }

        const onCreate = async function () {
            loadInstances()
        }

        await onCreate()

        return {
            showCreateInstanceModal,
            instanceFields,
            instancePagination,
            instances
        }
    }
}

</script>

<style scoped lang="scss">

</style>
