<script setup>
import {InputLabel, PrimaryButton, TextInput} from '~/components/UI/index.js';
import {computed, ref} from "vue";
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import {useAuthStore} from "~/stores/auth";
import {AlartErrorMessage, AlartSuccessMessage, FormTooManyAttempt, FormHeader} from '~/components/Form/index.js';
import {useRuntimeConfig, useRoute, useRouter} from "nuxt/app";

const props = defineProps({
  value: { type: Object, default: () => ({ name: '', email: '' }) },
});

const router = useRouter()
const route = useRoute()

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
  <section>
    <header class="space-y-2 mb-4">
      <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>
      <p class="mt-1 text-sm text-gray-600">
        Update your account's profile information and email address.
      </p>
    </header>

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

      <div v-if="props.mustVerifyEmail">
        <p class="text-sm mt-2 text-gray-800">
          Your email address is unverified.
          <Link
              :href="route('verification.send')"
              as="button"
              class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              method="post"
          >
            Click here to re-send the verification email.
          </Link>
        </p>

        <div
            v-show="props.status === 'verification-link-sent'"
            class="mt-2 font-medium text-sm text-green-600"
        >
          A new verification link has been sent to your email address.
        </div>
      </div>

      <div class="flex items-center gap-4">
        <PrimaryButton :disabled="loading" type="submit">Save</PrimaryButton>

        <Transition class="transition ease-in-out" enter-from-class="opacity-0" leave-to-class="opacity-0">
          <p v-if="false" class="text-sm text-gray-600">Saved.</p>
        </Transition>
      </div>
    </form>

    <div v-if="isTooManyAttempts" class="rounded-lg px-10 py-8 w-full max-w-md mx-auto text-left">
      <FormHeader class="text-left" subTitle="Too many attempts to submit" title="Stop!"/>
      <FormTooManyAttempt>Please try again later after some time.</FormTooManyAttempt>
    </div>
  </section>
</template>
