<template>
    <div>
        <h4>Silos</h4>
        <vue-feather class="icons clickable" type="plus-circle" title="Add Silo" />
        <n-data-table
            :columns="siloFields"
            :data="silos"
            :pagination="siloPagination"
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
    name: 'SilosList',
    components: {
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
                title: 'id'
            }
        ]

        const siloPagination = store.getters.siloPagination

        const silos: Ref<any[]> = ref([])

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
                        }
                    }
                `,
            })
            silos.value = silosResponse.data.getAllActiveSilos
            console.log(silos.value)
        }

        const onCreate = async function () {
            loadSilos()
        }

        await onCreate()

        return {
            siloFields,
            siloPagination,
            silos
        }
    }
}

</script>

<style scoped lang="scss">

</style>
