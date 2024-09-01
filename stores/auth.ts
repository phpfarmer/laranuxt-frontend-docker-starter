import { defineStore } from 'pinia';
import { useRuntimeConfig } from 'nuxt/app';

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
        async fetchUser() : Promise<any> {
            if (!this.user) {
                this.user = await this.fetchUserProfileData();
            }
            return this.user;
        },
        async setUser() : Promise<any> {
            this.user = await this.fetchUserProfileData();
        },
        async fetchUserProfileData() : Promise<any> {
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
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                return null;
            }
        },
        async logout() : Promise<void> {
            const config = useRuntimeConfig();
            await fetch(`${config.public.apiBaseUrl}/sanctum/csrf-cookie`);

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

    getters: {
        isUserLoggedIn(state): boolean {
            return !!state.user?.id;
        }
    }
});
