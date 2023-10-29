import {defineNuxtPlugin, useFetch, useRuntimeConfig} from "nuxt/app";
import Cookies from "js-cookie";

export default defineNuxtPlugin(NuxtApp => {
    const config = useRuntimeConfig()
    NuxtApp.provide('apiCallPOST', async (url, options) => {
        return useFetch(url, Object.assign({}, {
            method: 'POST',
            baseURL: 'http://localhost:8089',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN')
            }
        }, options))
    })

    NuxtApp.provide('apiCallGET', async (url, options) => {
        return useFetch(url, Object.assign({}, {
            method: 'GET',
            baseURL: 'http://localhost:8089',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN')
            }
        }, options))
    })

    NuxtApp.provide('apiCallDELETE', async (url, options) => {
        return useFetch(url, Object.assign({}, {
            method: 'DELETE',
            baseURL: 'http://localhost:8089',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN')
            }
        }, options))
    })
})