<script setup>
import {InputLabel, PrimaryButton, TextInput} from '~/components/UI/index.js';
import {FormTooManyAttempt, AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import {computed, ref} from 'vue';
import {useRouter} from "nuxt/app";
import {useVuelidate} from '@vuelidate/core';
import {minLength, required, helpers} from '@vuelidate/validators';
import ContentBox from "~/components/UI/ContentBox.vue";

const props = defineProps({
  value: { type: Object, default: () => ({ current_password: '', password: '', password_confirmation: '' }) },
});

const router = useRouter()

const loading = ref(false)
const success = ref(false)
const error = ref(false);
const message = ref('');
const submitCount = ref(0);

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 5
});

const rules = {
  value: {
    current_password: {required},
    password: { required, minLength: minLength(8) },
    password_confirmation: {required,
      sameAsPassword: helpers.withParams(
          { type: 'sameAsPassword', message: 'Passwords must match.' },
          function (fieldValue, parentVm) {
            return fieldValue === parentVm.password;
          }
      )
    },
  }
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
    const response = await fetch(`${config.public.apiBaseUrl}/api/account/password-change`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        current_password: props.value.current_password,
        password: props.value.password,
        password_confirmation: props.value.password_confirmation,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit profile password update request.';

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
</script>

<template>
  <content-box>
    <template v-slot:content-title>
      Update Password
    </template>
    <template v-slot:content-sub-title>
      Ensure your account is using a long, random password to stay secure.
    </template>

    <template v-slot:default>
      <AlartSuccessMessage v-if="success && !isTooManyAttempts">{{ message }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error && !isTooManyAttempts">{{ message }}</AlartErrorMessage>

      <form v-if="!isTooManyAttempts" class="mt-6 space-y-6" @submit.prevent="onSubmit">
        <div>
          <InputLabel for="current_password" value="Current Password"/>

          <TextInput
              id="current_password"
              v-model="value.current_password"
              :validationObject="v$.value.current_password"
              class="mt-1 block w-full"
              type="password"
          />
        </div>

        <div>
          <InputLabel for="password" value="New Password"/>

          <TextInput
              id="password"
              v-model="value.password"
              :validationObject="v$.value.password"
              class="mt-1 block w-full"
              type="password"
          />
        </div>

        <div>
          <InputLabel for="password_confirmation" value="Confirm Password"/>

          <TextInput
              id="password_confirmation"
              v-model="value.password_confirmation"
              :validationObject="v$.value.password_confirmation"
              class="mt-1 block w-full"
              type="password"
          />
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
