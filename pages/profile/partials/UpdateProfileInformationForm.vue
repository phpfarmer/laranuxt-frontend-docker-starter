<script setup>
import {InputLabel, PrimaryButton, TextInput} from '~/components/UI/index.js';
import {computed, ref} from "vue";
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import {useAuthStore} from "~/stores/auth";
import {AlartErrorMessage, AlartSuccessMessage, FormTooManyAttempt, FormHeader} from '~/components/Form/index.js';
import {useRuntimeConfig, useRouter} from "nuxt/app";
import ContentBox from "~/components/UI/ContentBox.vue";

const props = defineProps({
  value: { type: Object, default: () => ({ id: '', name: '', email: '', email_update: null }) },
});

const router = useRouter()

const loading = ref(false)
const success = ref(false)
const error = ref(false);
const message = ref('');
const submitCount = ref(0);

const auth = useAuthStore()

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 5
});

const rules = {
  value: {
    name: { required },
    email: { required, email },
  },
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const onSubmit = async () => {
  v$.value.$touch();
  if (isSubmitDisabled.value) {
    return false;
  }

  const config = useRuntimeConfig();
  success.value = false;
  error.value = false;
  message.value = null;
  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/account/profile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: props.value.name,
        email: props.value.email,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit profile update request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;
      await auth.setUser();

      // Update verification status if available
      if (responseData?.data?.email_update) {
        props.value.email_update = responseData?.data?.email_update;
      } else {
        props.value.email_update = null;
      }
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    loading.value = false;
  }
}

const resendVerification = async () => {
  const config = useRuntimeConfig();
  error.value = false;
  success.value = false;
  message.value = null;
  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/account/email/verification-notification`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id: props.value.id,
        email: props.value.email_update.email,
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
    loading.value = false;
  }
}

const cancelEmailUpdate = async () => {
  const config = useRuntimeConfig();
  error.value = false;
  success.value = false;
  message.value = null;
  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/account/email/verification-notification`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id: props.value.id,
        email: props.value.email_update.email,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit the request to cancel the email change.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;

      props.value.email_update = null;
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    loading.value = false;
  }
}
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

      <form v-if="!isTooManyAttempts" class="mt-6 space-y-6" @submit.prevent="onSubmit">
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

      <div v-if="isTooManyAttempts" class="rounded-lg px-10 py-8 w-full max-w-md mx-auto text-left">
        <FormHeader class="text-left" subTitle="Too many attempts to submit" title="Stop!"/>
        <FormTooManyAttempt>Please try again later after some time.</FormTooManyAttempt>
      </div>
    </template>
  </content-box>
</template>
