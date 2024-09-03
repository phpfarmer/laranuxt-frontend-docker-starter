<script setup>
import { required, email } from '@vuelidate/validators';
import { useAuthStore } from '~/stores/auth';
import { useRuntimeConfig, useRouter } from 'nuxt/app';
import { FormTooManyAttempt, AlartErrorMessage, AlartSuccessMessage } from '~/components/Form/index.js';
import { useFormHandler } from '~/composables/useFormHandler';
import {InputLabel, PrimaryButton, TextInput, ContentBox} from "~/components/UI/index.js";

const props = defineProps({
  value: { type: Object, default: () => ({ id: '', name: '', email: '', email_update: null }) },
});

const router = useRouter();
const auth = useAuthStore();

const rules = {
  value: {
    name: { required },
    email: { required, email },
  },
};

const { v$, loading, success, error, message, isSubmitDisabled, isTooManyAttempts, onSubmit, apiRequest } = useFormHandler(rules, props, {
  url: `${useRuntimeConfig().public.apiBaseUrl}/api/account/profile`,
  method: 'POST',
});

const handleSubmitProfileInformation = async () => {
  if (isSubmitDisabled.value) return;

  try {
    const responseData = await onSubmit();
    await auth.setUser();
    if (responseData?.data?.email_update) {
      props.value.email_update = responseData?.data?.email_update;
    } else {
      props.value.email_update = null;
    }
  } catch (err) {
    console.error('Submission error:', err);
  }
};

const resendVerification = async () => {
  error.value = false;
  success.value = false;
  message.value = null;
  loading.value = true;

  try {
    const responseData = await apiRequest(`${useRuntimeConfig().public.apiBaseUrl}/api/account/email/verification-notification`, 'POST', {
      id: props.value.id,
      email: props.value.email_update.email,
    });

    message.value = responseData.message;
    success.value = true;
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const cancelEmailUpdate = async () => {
  error.value = false;
  success.value = false;
  message.value = null;
  loading.value = true;

  try {
    const responseData = await apiRequest(`${useRuntimeConfig().public.apiBaseUrl}/api/account/email/verification-notification`, 'DELETE', {
      id: props.value.id,
      email: props.value.email_update.email,
    });

    message.value = responseData.message;
    success.value = true;
    props.value.email_update = null;
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <content-box>
    <template v-slot:content-title>
      Profile Information
    </template>
    <template v-slot:content-sub-title>
      Update your account's profile information and email address.
    </template>

    <template v-slot:default>
      <AlartSuccessMessage v-if="success && !isTooManyAttempts">{{ message }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error && !isTooManyAttempts">{{ message }}</AlartErrorMessage>

      <form v-if="!isTooManyAttempts" class="mt-6 space-y-6" @submit.prevent="handleSubmitProfileInformation">
        <div>
          <InputLabel for="name" value="Name"/>

          <TextInput
              id="name"
              v-model="value.name"
              :validationObject="v$.value.name"
              autofocus
              class="mt-1 block w-full"
              required
              type="text"
          />
        </div>

        <div>
          <InputLabel for="email" value="Email"/>

          <TextInput
              id="email"
              v-model="value.email"
              :validationObject="v$.value.email"
              class="mt-1 block w-full"
              required
              type="email"
          />
        </div>

        <div v-if="props.value.email_update">
          <p class="text-sm mt-2 text-gray-800">
            Your new email address <strong>{{ props.value.email_update.email }}</strong> is not verified.
            Please check your email and click the verification link. Didn’t get it?
            <a href="#" @click.prevent="resendVerification" class="text-red-800">Resend verification email</a> or <a href="#" class="text-red-800" @click.prevent="cancelEmailUpdate">cancel this change</a>.
          </p>
        </div>

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading" type="submit">Save</PrimaryButton>
        </div>
      </form>

      <FormTooManyAttempt v-if="isTooManyAttempts">Please try again later after some time.</FormTooManyAttempt>
    </template>
  </content-box>
</template>
