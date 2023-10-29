import {defineStore} from 'pinia'

export interface AuthUser extends Record<string, any> {
}

export interface AuthState {
    loggedIn: boolean
    user: AuthUser | null
    loading: boolean
}

export const useAuthStore = defineStore({
    id: 'auth',

    //data
    state: (): AuthState => {
        const {user} = useAuthStorage()

        console.log('AuthUserStore', user);
        return {
            loggedIn: !!user?.value?.id,
            user: user.value,
            loading: false,
        }
    },

    //methods
    actions: {
        logout() {
            const {clear} = useAuthStorage()
            clear()

            this.loggedIn = false
            this.user = null
        },
    },

    //computed
    getters: {
        isUserLoggedIn(): boolean {
            return !!this.loggedIn;
        }
    }
})
