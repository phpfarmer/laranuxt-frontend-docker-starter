<template>
  <div class="flex items-center justify-center h-full">
    <Title>Reset Password | {{ title }}</Title>
    <form class="rounded-lg px-8 py-8 w-full max-w-md mx-auto" @submit="onSubmit">
      <FormHeader
          subTitle="Please enter your new password"
          title="Reset Password"
      />

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


      <label class="block mb-5" for="password">
        <InputLabel>Password</InputLabel>
        <TextInput
            id="password"
            v-model="passwordValue"
            placeholder="********"
            required
            type="password"
        />
        <InputError :message="errors.password" class="mt-2"/>
      </label>

      <label class="block mb-5" for="password_confirmation">
        <InputLabel>Password Confirmation</InputLabel>
        <TextInput
            id="password_confirmation"
            v-model="passwordConfirmationValue"
            placeholder="********"
            required
            type="password"
        />
        <InputError :message="errors.password_confirmation" class="mt-2"/>
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
import FormHeader from '~/components/Form/FormHeader.vue';
import PrimaryButton from '~/components/UI/PrimaryButton';
import InputError from '~/components/UI/InputError';
import InputLabel from '~/components/UI/InputLabel';
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import TextInput from '~/components/UI/TextInput'
import {computed, ref} from "vue";
import {Form, useField, useForm} from 'vee-validate'
import * as yup from 'yup';
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import {useRouter, useState} from "nuxt/app";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title')

const router = useRouter()
const route = useRoute()
const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const error = ref(null)

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const schema = yup.object({
  email: yup.string().required().email().label('Email address'),
  password: yup.string().required().label('Password'),
  password_confirmation: yup.string().required().oneOf([yup.ref('password'), null], 'Passwords must match').label('Password Confirmation'),
  token: yup.string().required().min(64).label('Token'),
})

const {handleSubmit, errors, isSubmitting} = useForm({
  validationSchema: schema,
  initialValues: {
    email: route?.query?.email,
    token: route?.query?.token,
  },
})

const {value: emailValue} = useField('email');
const {value: passwordValue} = useField('password');
const {value: passwordConfirmationValue} = useField('password_confirmation');

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  error.value = null;

  await $apiCallPOST('/reset-password', {
    body: values,
    onResponse({request, response, options}) {
      if (response.status === 200) {
        useState('passwordResetSuccessMessage', () => response._data?.status)

        return router.push({
          path: '/auth/login'
        })
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