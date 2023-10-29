<template>
  <div class="flex items-center justify-center h-full">
    <Title>Login | {{ title }}</Title>
    <form v-if="!isTooManyAttempts" class="rounded-lg px-8 py-8 w-full max-w-md mx-auto" @submit="onSubmit">
      <FormHeader subTitle="Please enter your credentials" title="Login"/>

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

      <div class="text-gray-600 text-sm mb-4">
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/forgot-password">
          Forgot Your Password?
        </nuxt-link>
      </div>

      <PrimaryButton :disabled="isSubmitDisabled" type="submit">
        Log in
      </PrimaryButton>


      <div class="text-gray-600 text-sm mt-4">
        Don't have account?
        <nuxt-link class="text-primary-500 hover:underline font-semibold text-sm" to="/auth/register">
          Register
        </nuxt-link>
      </div>
    </form>

    <div v-if="isTooManyAttempts" class="rounded-lg px-10 py-8 w-full max-w-md mx-auto">
      <FormHeader subTitle="Too many attempts to login" title="Login"/>
      <FormTooManyAttempt>Please try again later after some time.</FormTooManyAttempt>
    </div>
  </div>
</template>

<script setup>
import FormHeader from '~/components/Form/Header';
import FormTooManyAttempt from '~/components/Form/TooManyAttempt';
import PrimaryButton from '~/components/UI/PrimaryButton';
import InputError from '~/components/UI/InputError';
import InputLabel from '~/components/UI/InputLabel';
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import TextInput from '~/components/UI/TextInput'
import {computed, ref, watch} from "vue";
import {useAuthStore} from '~/stores/auth'
import {Form, useField, useForm} from 'vee-validate'
import * as yup from 'yup';
import {useAuthStorage} from "~/composables/auth";
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import {useRoute, useState} from "nuxt/app";
import AlartSuccessMessage from "../../components/Form/AlartSuccessMessage";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title')
const success = useState('passwordResetSuccessMessage')

/*const email = ref('rosalia.paucek@example.net')
const password = ref('password')*/

const router = useRouter()
const route = useRoute()
const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const error = ref(null)

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const schema = yup.object({
  email: yup.string().required().email().label('Email'),
  password: yup.string().required().label('Password'),
})

const {handleSubmit, errors, isSubmitting, submitCount} = useForm({
  validationSchema: schema,
})

const {value: emailValue} = useField('email');
const {value: passwordValue} = useField('password');

const auth = useAuthStore()
const {store} = useAuthStorage()

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 10;
});

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true

  await $apiCallPOST('/login', {
    body: values,
    async onResponse({request, response, options}) {
      if (response.status === 204) {
        const {data: user} = await $apiCallGET('/api/account/profile')

        watch(user, (loggedInUser) => {
          store(loggedInUser)
          auth.user = loggedInUser
          auth.loggedIn = true
          isSubmitting.value = false
          if (route.query?.next) {
            return router.push({
              path: route.query.next
            })
          } else {
            /*return router.push({
              path: '/account/dashboard'
            })*/
            window.location.pathname = '/account/dashboard'
          }
        }, {
          deep: true,
          immediate: true
        })
      }
    },
    onResponseError({request, response}) {
      error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
    }
  })

  isSubmitting.value = false
})
</script>