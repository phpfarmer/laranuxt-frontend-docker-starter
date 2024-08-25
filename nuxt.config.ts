// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.BASE_URL_BACKEND_API
        }
    },
    css: [
        '~/assets/css/main.css'
    ],
    modules: [
        '@pinia/nuxt',
    ],
})
