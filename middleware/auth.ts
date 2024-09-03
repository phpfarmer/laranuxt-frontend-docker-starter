import {defineNuxtRouteMiddleware} from "nuxt/app";
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore();
    const router = useRouter()

    if (!authStore.user) {
        await authStore.fetchUser();
    }

    if (!authStore.user && to.path !== '/login') {
        return router.push({
            path: '/auth/login',
            query: {
                next: to.path,
            },
        })
    }
});
