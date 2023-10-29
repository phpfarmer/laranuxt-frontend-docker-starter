import {useAuthStore} from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuthStore()
    const router = useRouter()

    if (auth.isUserLoggedIn) {
        return router.push({
            path: '/account/dashboard'
        })
    }
})
