<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form v-if="!isTooManyAttempts" @submit.prevent="onSubmit">
      <FormHeader subTitle="Please enter your email" title="Forgot Password"/>

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

      <div class="text-gray-600 text-sm mb-5">
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/login">
          Back to Login?
        </nuxt-link>
      </div>

      <PrimaryButton :disabled="isSubmitDisabled" type="submit">
        Send Password Reset Link
      </PrimaryButton>
    </form>

    <div v-if="isTooManyAttempts" class="rounded-lg px-10 py-8 w-full max-w-md mx-auto">
      <FormHeader subTitle="Too many attempts to password reset" title="Forgot Password"/>
      <FormTooManyAttempt>Please try again later after some time.</FormTooManyAttempt>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import {FormHeader, AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import {PrimaryButton, InputLabel, TextInput} from '~/components/UI/index';

const props = defineProps({
  value: { type: Object, default: () => ({ email: '' }) },
});

const success = ref(false);
const isTooManyAttempts = ref(0);
const pending = ref(true);
const error = ref(false);
const message = ref('');

const rules = {
  value: {
    email: { required, email },
  },
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const router = useRouter();

const onSubmit = async () => {
  const config = useRuntimeConfig();
  success.value = false;
  error.value = false;
  message.value = null;
  pending.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: props.value.email,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit the forgot password request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    pending.value = false;
  }
};
</script>