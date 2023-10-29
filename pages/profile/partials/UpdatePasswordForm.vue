<script setup>
import InputError from '~/components/UI/InputError.vue';
import InputLabel from '~/components/UI/InputLabel.vue';
import PrimaryButton from '~/components/UI/PrimaryButton.vue';
import TextInput from '~/components/UI/TextInput.vue';
import {computed, ref} from 'vue';
import {useNuxtApp, useRoute, useRouter} from "nuxt/app";
import * as yup from "yup";
import {useField, useForm} from "vee-validate";

import FormTooManyAttempt from '~/components/Form/TooManyAttempt';
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import AlartSuccessMessage from '~/components/Form/AlartSuccessMessage';
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "../../../static/texts";

const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const error = ref(null)
const success = ref(null)
const errorFields = ['name', 'email'];

const router = useRouter()
const route = useRoute()

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const schema = yup.object({
  current_password: yup.string().required().label('Current Password'),
  password: yup.string().required().label('Password'),
  password_confirmation: yup.string().required().oneOf([yup.ref('password'), null], 'Passwords must match').label('Password Confirmation'),
})

const {handleSubmit, errors, isSubmitting, submitCount} = useForm({
  validationSchema: schema,
})

const {value: currentPasswordValue} = useField('current_password');
const {value: passwordValue} = useField('password');
const {value: passwordConfirmationValue} = useField('password_confirmation');

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 5
});

const isValidationErrorExists = computed(() => {
  return Object.keys(errors.value).filter(fieldName => errorFields.some(key => key === fieldName)).length > 0
})

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  success.value = null;
  error.value = null;

  await $apiCallPOST('/api/account/password-change', {
    body: values,
    onResponse({request, response, options}) {
      if (response.status === 200) {
        success.value = response._data?.message;
      } else {
        error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
      }
    },
    onResponseError({request, response}) {
      error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
    }
  })

  isSubmitting.value = false
})
</script>

<template>
  <section>
    <header class="mb-4">
      <h2 class="text-lg font-medium text-gray-900">Update Password</h2>

      <p class="mt-1 text-sm text-gray-600">
        Ensure your account is using a long, random password to stay secure.
      </p>
    </header>

    <AlartSuccessMessage v-if="success && !isTooManyAttempts">{{ success }}</AlartSuccessMessage>
    <AlartErrorMessage v-if="error && !isTooManyAttempts">{{ error }}</AlartErrorMessage>

    <form v-if="!isTooManyAttempts" class="mt-6 space-y-6" @submit.prevent="onSubmit">
      <div>
        <InputLabel for="current_password" value="Current Password"/>

        <TextInput
            id="current_password"
            ref="currentPasswordInput"
            v-model="currentPasswordValue"
            autocomplete="current-password"
            class="mt-1 block w-full"
            type="password"
        />

        <InputError :message="errors.current_password" class="mt-2"/>
      </div>

      <div>
        <InputLabel for="password" value="New Password"/>

        <TextInput
            id="password"
            ref="passwordInput"
            v-model="passwordValue"
            autocomplete="new-password"
            class="mt-1 block w-full"
            type="password"
        />

        <InputError :message="errors.password" class="mt-2"/>
      </div>

      <div>
        <InputLabel for="password_confirmation" value="Confirm Password"/>

        <TextInput
            id="password_confirmation"
            v-model="passwordConfirmationValue"
            autocomplete="new-password"
            class="mt-1 block w-full"
            type="password"
        />

        <InputError :message="errors.password_confirmation" class="mt-2"/>
      </div>

      <div class="flex items-center gap-4">
        <PrimaryButton :disabled="isSubmitDisabled || isValidationErrorExists" type="submit">Save</PrimaryButton>

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
