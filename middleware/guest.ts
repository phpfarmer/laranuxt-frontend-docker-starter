import {defineNuxtRouteMiddleware, navigateTo} from "nuxt/app";
import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore();
    const router = useRouter()

    if (authStore.user) {
        return router.push({
            path: '/account/dashboard'
        })
    }
});