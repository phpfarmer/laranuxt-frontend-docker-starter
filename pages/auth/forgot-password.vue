<template>
  <div class="flex items-center justify-center h-full">
    <Title>Forgot Password | {{ title }}</Title>
    <form v-if="!isTooManyAttempts" class="rounded-lg px-8 py-8 w-full max-w-md mx-auto" @submit="onSubmit">
      <FormHeader subTitle="Please enter your email" title="Forgot Password"/>

      <AlartSuccessMessage v-if="success">{{ success }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error">{{ error }}</AlartErrorMessage>

      <label class="block mb-5" for="email">
        <InputLabel>Email address</InputLabel>
        <TextInput
            id="email"
            v-model="emailValue"
            placeholder="i.e john@example.com"
            required
            type="email"
        />
        <InputError :message="errors.email" class="mt-2"/>
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
import FormHeader from '~/components/Form/FormHeader.vue';
import FormTooManyAttempt from '~/components/Form/TooManyAttempt';
import PrimaryButton from '~/components/UI/PrimaryButton';
import InputError from '~/components/UI/InputError';
import InputLabel from '~/components/UI/InputLabel';
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import AlartSuccessMessage from '~/components/Form/AlartSuccessMessage';
import TextInput from '~/components/UI/TextInput'
import {computed, ref} from "vue";
import {Form, useField, useForm} from 'vee-validate'
import * as yup from 'yup';
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import {useState} from "nuxt/app";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title')

const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const success = ref(null)
const error = ref(null)

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const schema = yup.object({
  email: yup.string().required().email().label('Email'),
})

const {handleSubmit, errors, isSubmitting, submitCount} = useForm({
  validationSchema: schema,
})

const {value: emailValue} = useField('email');

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 10;
});

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  error.value = null;
  success.value = null;

  await $apiCallPOST('/forgot-password', {
    body: values,
    async onResponse({request, response, options}) {
      if (response.status === 200) {
        success.value = response._data?.status;
      }
    },
    onResponseError({request, response}) {
      error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
    }
  })

  isSubmitting.value = false
})
</script>