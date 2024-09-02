import { ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';

export function useFormHandler(rules, props, config = {}) {
    const v$ = useVuelidate(rules, props);

    const loading = ref(false);
    const success = ref(false);
    const error = ref(false);
    const message = ref('');
    const submitCount = ref(0);

    const isTooManyAttempts = computed(() => submitCount.value >= 5);
    const isSubmitDisabled = computed(() => v$.value.$invalid);

    const getErrorMessage = (responseData) => {
        if (responseData.errors) {
            return responseData.errors[Object.keys(responseData.errors)[0]][0];
        }

        if (typeof config.errorMessage === 'function') {
            return config.errorMessage(responseData);
        }

        if (typeof config.errorMessage === 'string') {
            return config.errorMessage;
        }

        return 'An error occurred.';
    };

    const apiRequest = async (url, method = 'POST', body = null) => {
        success.value = false;
        error.value = false;
        message.value = null;
        loading.value = true;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: body ? JSON.stringify(body) : null,
            });

            if (!response.ok) {
                const responseData = await response.json();
                const errorMessage = getErrorMessage(responseData);
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            message.value = responseData.message;
            success.value = true;

            return responseData;
        } catch (err) {
            message.value = err.message;
            error.value = true;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const onSubmit = async () => {
        v$.value.$touch();
        if (isSubmitDisabled.value) return;

        submitCount.value += 1;
        return apiRequest(config.url, config.method || 'POST', props.value);
    };

    return {
        v$,
        loading,
        success,
        error,
        message,
        isSubmitDisabled,
        isTooManyAttempts,
        onSubmit,
        apiRequest,
    };
}