<template>
    <div>
        <n-space id="vertNav" vertical>
            <n-layout has-sider>
                <n-layout-sider
                    bordered
                    collapse-mode="width"
                    :collapsed-width="64"
                    :width="240"
                    :collapsed="collapsed"
                    @collapse="collapsed = true"
                    @expand="collapsed = false"
                >
                    <n-menu
            v-model:value="activeKey"
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="computedMenuOptions"
            default-value="home"
            />
                </n-layout-sider>
                <n-layout>
                    <router-view style="margin-left: 5px; margin-right: 5px;"
                        class="nofloat viewWrapper"
                        @routerViewEvent="routerViewEventHandle"
                        :key="$route.fullPath"
                    />
                </n-layout>
            </n-layout>
        </n-space>
    </div>
</template>

<script lang="ts">
import { NSpace, NLayout, NLayoutSider, NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { ref, h, Component, ComputedRef, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { HomeOutlined as HomeIcon, CloudServerOutlined } from '@vicons/antd'
import { Folder, BrandGit, Key } from '@vicons/tabler'


function renderIcon (icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}


function menuOptions () : MenuOption[] {
    return [
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: 'home',
                            params: {}
                        }
                    },
                    { default: () => 'Home' }
                ),
            key: 'home',
            icon: renderIcon(HomeIcon)
        },
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: 'templates',
                            params: {}
                        }
                    },
                    { default: () => 'Templates' }
                ),
            key: 'templates',
            icon: renderIcon(BrandGit)
        },
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: 'silos',
                            params: {}
                        }
                    },
                    { default: () => 'Silos' }
                ),
            key: 'projects',
            icon: renderIcon(Folder)
        },
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: 'instances',
                            params: {}
                        }
                    },
                    { default: () => 'Instances' }
                ),
            key: 'instances',
            icon: renderIcon(CloudServerOutlined)
        },
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: 'home',
                            params: {}
                        }
                    },
                    { default: () => 'Accounts' }
                ),
            key: 'accounts',
            icon: renderIcon(Key)
        },
    ]
}

export default {
    name: 'LeftNavBar',
    components: {
        NSpace, NLayout, NLayoutSider, NMenu
    },
    props: { 
        queryValue: String
    },
    async setup(/*props : any, { emit } : any*/) {
        const computedMenuOptions : ComputedRef<MenuOption[]> = computed((): MenuOption[] => menuOptions())

        const routerViewEventHandle = function (event : any) {
            console.log(event)
        }

        return {
            activeKey: ref<string>('home'),
            collapsed: ref(true),
            computedMenuOptions,
            routerViewEventHandle
        }
    },
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>