<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form v-if="!isTooManyAttempts" @submit.prevent="onSubmit">
      <FormHeader subTitle="Please enter your credentials" title="Login"/>

      <AlartSuccessMessage v-if="success">{{ message }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error">{{ message }}</AlartErrorMessage>

      <label class="block mb-5" for="email">
        <InputLabel>Email address</InputLabel>
        <TextInput
            id="email"
            v-model="value.email"
            :validationObject="v$.value.email"
            placeholder="i.e john@example.com"
            required
            type="email"
        />
      </label>

      <label class="block mb-5" for="password">
        <InputLabel>Password</InputLabel>
        <TextInput
            id="password"
            v-model="value.password"
            :validationObject="v$.value.password"
            placeholder="********"
            required
            type="password"
        />
      </label>

      <div class="text-gray-600 text-sm mb-4">
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/forgot-password">
          Forgot Your Password?
        </nuxt-link>
      </div>

      <PrimaryButton :disabled="isSubmitDisabled" type="submit">
        Log in
      </PrimaryButton>


      <div class="text-gray-600 text-sm mt-4">
        Don't have account?
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/register">
          Register
        </nuxt-link>
      </div>
    </form>

    <div v-if="isTooManyAttempts" class="rounded-lg px-10 py-8 w-full max-w-md mx-auto">
      <FormHeader subTitle="Too many attempts to login" title="Login"/>
      <TooManyAttempt>Please try again later after some time.</TooManyAttempt>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { useAuthStore } from '~/stores/auth';
import {FormHeader, TooManyAttempt, AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import {PrimaryButton, InputLabel, TextInput} from '~/components/UI/index';

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '' }) },
});

const status = ref('');
const success = ref(false);
const isTooManyAttempts = ref(0);
const pending = ref(true);
const error = ref(false);
const message = ref('');

const rules = {
  value: {
    email: { required, email },
    password: { required },
  },
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const router = useRouter();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  success.value = (urlParams.get('status') === 'success');
  error.value = (urlParams.get('status') === 'error');
  message.value = decodeURIComponent(urlParams.get('message'));

  const emailParam = urlParams.get('email');
  if (emailParam) {
    props.value.email = decodeURIComponent(emailParam);
  }
});

const onSubmit = async () => {
  const config = useRuntimeConfig();
  success.value = false;
  error.value = false;
  message.value = null;
  pending.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: props.value.email,
        password: props.value.password,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Failed to submit login request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;
      const authStore = useAuthStore();
      authStore.setToken(responseData.access_token);
      await authStore.fetchUser();
      router.push('/account/dashboard');
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    pending.value = false;
  }
};
</script>

