<script setup>
import { InputLabel, PrimaryButton, TextInput, ContentBox } from '~/components/UI/index.js';
import { FormTooManyAttempt, AlartErrorMessage, AlartSuccessMessage } from '~/components/Form/index.js';
import { minLength, required, helpers } from '@vuelidate/validators';
import { useFormHandler } from '~/composables/useFormHandler';

const props = defineProps({
  value: { type: Object, default: () => ({ current_password: '', password: '', password_confirmation: '' }) },
});

const rules = {
  value: {
    current_password: { required },
    password: { required, minLength: minLength(8) },
    password_confirmation: {
      required,
      sameAsPassword: helpers.withParams(
          { type: 'sameAsPassword', message: 'Passwords must match.' },
          (fieldValue, parentVm) => fieldValue === parentVm.password
      ),
    },
  }
};

const { v$, loading, success, error, message, onSubmit, isTooManyAttempts } = useFormHandler(rules, props, {
  url: `${useRuntimeConfig().public.apiBaseUrl}/api/account/password-change`,
  body: {
    current_password: props.value.current_password,
    password: props.value.password,
    password_confirmation: props.value.password_confirmation,
  },
  errorMessage: 'Unable to submit profile password update request.',
});
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

      <FormTooManyAttempt v-if="isTooManyAttempts">Please try again later after some time.</FormTooManyAttempt>
    </template>
  </content-box>
</template>
