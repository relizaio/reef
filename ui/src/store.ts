import { createStore } from 'vuex'
import { reactive } from 'vue'
import axios from 'axios'
import gql from 'graphql-tag'
import constants from './utils/constants'
import graphqlClient from './utils/graphql'
import graphqlQueries from './utils/graphqlQueries'

const storeObject : any = {
    state () {
        return {
            templates: [],
            accountPagination: () => {
                const accountPagination = reactive({
                    page: 1,
                    pageSize: 10,
                    onChange: (page: number) => {
                        accountPagination.page = page
                    }
                })
                return accountPagination
            },
            instancePagination: () => {
                const instancePagination = reactive({
                    page: 1,
                    pageSize: 10,
                    onChange: (page: number) => {
                        instancePagination.page = page
                    }
                })
                return instancePagination
            },
            templatePagination: () => {
                const templatePagination = reactive({
                    page: 1,
                    pageSize: 10,
                    onChange: (page: number) => {
                        templatePagination.page = page
                    }
                })
                return templatePagination
            },
            siloPagination: () => {
                const siloPagination = reactive({
                    page: 1,
                    pageSize: 10,
                    onChange: (page: number) => {
                        siloPagination.page = page
                    }
                })
                return siloPagination
            },
        }
    },
    getters: {
        instancePagination (state: any) {
            return state.instancePagination()
        },
        templatePagination (state: any) {
            return state.templatePagination()
        },
        siloPagination (state: any) {
            return state.siloPagination()
        },

    },
    mutations: {
    },
    actions: {
    },
    
}

const store = createStore(storeObject)

export default {
    name: 'Store',
    store
}