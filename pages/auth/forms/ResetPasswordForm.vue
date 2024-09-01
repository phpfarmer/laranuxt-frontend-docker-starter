<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form @submit.prevent="onSubmit">
      <FormHeader
          subTitle="Please enter your new password"
          title="Reset Password"
      />

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

      <label class="block mb-5" for="password_confirmation">
        <InputLabel>Password Confirmation</InputLabel>
        <TextInput
            id="password_confirmation"
            v-model="value.password_confirmation"
            :validationObject="v$.value.password_confirmation"
            placeholder="********"
            required
            type="password"
        />
      </label>

      <div class="text-gray-600 text-sm mb-5">
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/login">
          Back to Login?
        </nuxt-link>
      </div>

      <PrimaryButton :disabled="isSubmitDisabled" type="submit">
        Reset my password
      </PrimaryButton>
    </form>
  </div>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core';
import { minLength, required, email, helpers } from '@vuelidate/validators';
import {AlartErrorMessage, FormHeader} from '~/components/Form/index.js';
import {InputLabel, PrimaryButton, TextInput} from "~/components/UI/index.js";

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '', password_confirmation: '', token: '' }) },
});

const success = ref(false);
const pending = ref(false);
const error = ref(false);
const message = ref('');

const rules = {
  value: {
    email: { required, email },
    password: { required, minLength: minLength(8) },
    password_confirmation: {required,
      sameAsPassword: helpers.withParams(
          { type: 'sameAsPassword', message: 'Passwords must match.' },
          function (fieldValue, parentVm) {
            return fieldValue === parentVm.password;
          }
      )
    },
    token: { required, minLength: minLength(64) },
  },
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const router = useRouter();
const onSubmit = async () => {
  const config = useRuntimeConfig();
  error.value = false;
  success.value = false;
  message.value = null;
  pending.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: props.value.email,
        password: props.value.password,
        password_confirmation: props.value.password_confirmation,
        token: props.value.token,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to process the password change request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;
      const successMessage = encodeURIComponent('Your password has been successfully changed. Please log in.');
      router.push(`/auth/login?status=success&email=${props.value.email}&message=${successMessage}`);
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    pending.value = false;
  }
};
</script>