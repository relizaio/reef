<template>
    <div>
        <n-notification-provider>
            <n-space vertical>
                <n-layout>
                    <n-layout-content >
                        <top-nav-bar />
                    </n-layout-content>
                </n-layout>
                <n-layout>
                    <n-layout-content >
                        <left-nav-bar />
                    </n-layout-content>
                </n-layout>
            </n-space>
        </n-notification-provider>
    </div>
</template>

<script lang="ts">
import { NLayout, NSpace, NLayoutContent, NNotificationProvider } from 'naive-ui'
import TopNavBar from './TopNavBar.vue'
import LeftNavBar from './LeftNavBar.vue'
import { useStore } from 'vuex'

export default {
    name: 'AppWrapper',
    components: {
        TopNavBar, LeftNavBar, NLayout, NSpace, NLayoutContent, NNotificationProvider
    },
    props: {},
    async setup(/*props : any, { emit } : any*/) {
        const store = useStore()

        return {
        }
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
