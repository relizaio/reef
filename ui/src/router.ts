import { createRouter, createWebHistory, Router } from 'vue-router'

const routes : any[] = [
    {
        path: '/',
        name: 'home',
        component: import('@/components/AppHome.vue')
    }
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