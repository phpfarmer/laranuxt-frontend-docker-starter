import type {AuthUser} from '~/stores/auth'

export const useAuthStorage = (
    {authUserKey} = {
        authUserKey: 'auth.user',
    },
) => {
    const user = useCookie<AuthUser>(authUserKey)

    const store = (newUser: Record<string, any>) => {
        user.value = newUser
    }

    const clear = () => {
        user.value = {}
    }

    return {store, clear, user}
}
