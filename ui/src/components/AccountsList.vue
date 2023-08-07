<template>
    <div>
        <h4>Accounts</h4>
        <vue-feather 
            class="icons clickable"
            type="plus-circle"
            @click="showCreateAccountModal = true"
            title="Create Account" />
        <n-data-table
            :columns="accountFields"
            :data="accounts"
            :pagination="accountPagination"
            size="small" />
        <n-modal
            v-model:show="showCreateAccountModal"
            preset="dialog"
            :show-icon="false">
            <!-- create-silo / -->
        </n-modal>
    </div>
</template>

<script lang="ts">
import { ComputedRef, ref, Ref, computed, h, reactive } from 'vue'
import { useStore } from 'vuex'
import { NButton, NDataTable, NModal, NPopover, NSelect, DataTableColumns, useNotification, NotificationType } from 'naive-ui'
import gql from 'graphql-tag'
import graphqlClient from '../utils/graphql'

export default {
    name: 'AccountsList',
    components: {
        NButton, NDataTable, NModal, NPopover, NSelect
    },
    props: {
    },
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()
        const notification = useNotification()

        const accountFields: DataTableColumns<any> = [
            {
                key: 'id',
                title: 'id'
            },
            {
                key: 'providerName',
                title: 'Provider'
            }

        ]

        const accountPagination = store.getters.accountPagination

        const accounts: Ref<any[]> = ref([])

        const showCreateAccountModal = ref(false)

        const notify = async function (type: NotificationType, title: string, content: string) {
            notification[type]({
                content: content,
                meta: title,
                duration: 3500,
                keepAliveOnHover: true
            })
        }

        async function loadAccounts() {
            const acctResponse = await graphqlClient.query({
                query: gql`
                    query getAllActiveAccounts {
                        getAllActiveAccounts {
                            id
                            providerName
                        }
                    }
                `,
            })
            accounts.value = acctResponse.data.getAllActiveAccounts
        }

        const onCreate = async function () {
            loadAccounts()
        }

        await onCreate()

        return {
            showCreateAccountModal,
            accountFields,
            accountPagination,
            accounts
        }
    }
}

</script>

<style scoped lang="scss">

</style>
