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
            templatePagination: () => {
                const templatePagination = reactive({
                    page: 1,
                    pageSize: 10,
                    onChange: (page: number) => {
                        templatePagination.page = page
                    }
                })
                return templatePagination
            }
        }
    },
    getters: {
        templatePagination (state: any) {
            return state.templatePagination()
        }
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