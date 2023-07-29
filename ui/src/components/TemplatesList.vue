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
                title: 'TYPE'
            }
        ]

        const templatePagination = store.getters.templatePagination

        const templates: ComputedRef<any> = computed((): any => {
            return []
        })

        const notify = async function (type: NotificationType, title: string, content: string) {
            notification[type]({
                content: content,
                meta: title,
                duration: 3500,
                keepAliveOnHover: true
            })
        }

        const onCreate = async function () {
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
