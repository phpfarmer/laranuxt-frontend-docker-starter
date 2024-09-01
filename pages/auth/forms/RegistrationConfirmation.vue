<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form @submit.prevent="onSubmit">
      <FormHeader subTitle="Please check your email to verify your account" title="Registration Successful"/>

      <AlartSuccessMessage v-if="success">{{ message }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error">{{ message }}</AlartErrorMessage>

      <p class="text-sm">We've sent a confirmation email to the address you provided. Please click on the link in the email to complete your registration.</p>

      <PrimaryButton :disabled="pending" class="mb-5 mt-6" type="submit">
        Resend Confirmation Email
      </PrimaryButton>

      <div class="text-gray-600 text-sm">
        Already have an account?
        <nuxt-link
            class="text-primary-500 hover:underline font-semibold text-sm"
            to="/auth/login"
        >
          Login
        </nuxt-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import {AlartErrorMessage, AlartSuccessMessage, FormHeader} from '~/components/Form/index.js';
import {PrimaryButton} from "~/components/UI/index.js";

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '', message: '' }) },
});

const success = ref(false);
const pending = ref(false);
const error = ref(false);
const message = ref('');

const onSubmit = async () => {
  const config = useRuntimeConfig();
  error.value = false;
  success.value = false;
  message.value = null;
  pending.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/email/verification-notification`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id: props.value.id,
        email: props.value.email,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit the request to resend the email verification.';

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