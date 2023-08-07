import { createRouter, createWebHistory, Router } from 'vue-router'

const routes : any[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/components/AppHome.vue')
    },
    {
        path: '/templates',
        name: 'templates',
        component: () => import('@/components/TemplatesList.vue')
    },
    {
        path: '/silos',
        name: 'silos',
        component: () => import('@/components/SilosList.vue')
    },
    {
        path: '/instances',
        name: 'instances',
        component: () => import('@/components/InstancesList.vue')
    },
    {
        path: '/accounts',
        name: 'accounts',
        component: () => import('@/components/AccountsList.vue')
    },
]

const Router : Router = createRouter({
    history: createWebHistory(),
    routes
})

export default {
    name: 'Router',
    // mode: 'history',
    // base: process.env.BASE_URL,
    Router
}