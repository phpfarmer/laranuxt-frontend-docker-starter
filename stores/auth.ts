import { defineStore } from 'pinia';
import {useRuntimeConfig} from "nuxt/app";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),
    persist: true,
    actions: {
        setToken(token) : void {
            this.token = token;
        },
        async fetchUser() :Promise<void> {
            if (this.user) {
                return;
            }

            try {
                const config = useRuntimeConfig();
                const response : Response = await fetch(`${config.public.apiBaseUrl}/api/account/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    this.user = await response.json();
                } else {
                    this.user = null;
                }
            } catch (error) {
                this.user = null;
            }
        },
        async logout() :Promise<void> {
            const config = useRuntimeConfig();
            await fetch(`${config.public.apiBaseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            this.user = null;
            this.token = null;
        },
    },
});