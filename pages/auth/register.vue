<template>
  <div class="flex items-center justify-center h-full">
    <Title>Register | {{ title }}</Title>
    <form class="rounded-lg px-8 py-8 w-full max-w-md mx-auto" @submit="onSubmit">
      <FormHeader subTitle="Please enter your account information" title="Register"/>

      <AlartErrorMessage v-if="error">{{ error }}</AlartErrorMessage>

      <label class="block mb-5" for="name">
        <InputLabel>Name</InputLabel>
        <TextInput
            id="name"
            v-model="nameValue"
            placeholder="i.e John Doe"
            required
            type="text"
        />
        <InputError :message="errors.name" class="mt-2"/>
      </label>

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

      <div class="mb-5 mt-4 flex gap-2 justify-between items-center">
        <label class="flex flex-wrap gap-2 items-center text-sm">
          <input
              class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 transition duration-300"
              type="checkbox"
          >
          <span> I agree with </span>
          <nuxt-link
              class="text-primary-500 hover:underline font-semibold text-sm inline"
              to="/toc"
          >
            Terms and Condition
          </nuxt-link>
        </label>
      </div>

      <PrimaryButton :disabled="isSubmitDisabled" class="mb-5" type="submit">
        Register
      </PrimaryButton>

      <div class="text-gray-600 text-sm">
        Already have an account?
        <nuxt-link
            class="text-primary-500 hover:underline font-semibold text-sm"
            to="/auth/login"
        >
          Login
        </nuxt-link>
      </div>
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
import {computed, ref, watch} from "vue";
import {Form, useField, useForm} from 'vee-validate'
import * as yup from 'yup';
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import {useAuthStore} from "~/stores/auth";
import {useState} from "nuxt/app";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title')

const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const error = ref(null)

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const schema = yup.object({
  name: yup.string().required().label('Name'),
  email: yup.string().required().email().label('Email address'),
  password: yup.string().required().label('Password'),
  password_confirmation: yup.string().required().oneOf([yup.ref('password'), null], 'Passwords must match').label('Password Confirmation'),
})

const {handleSubmit, errors, isSubmitting} = useForm({
  validationSchema: schema,
})

const {value: nameValue} = useField('name');
const {value: emailValue} = useField('email');
const {value: passwordValue} = useField('password');
const {value: passwordConfirmationValue} = useField('password_confirmation');

const auth = useAuthStore()
const {store} = useAuthStorage()

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  error.value = null;

  await $apiCallPOST('/register', {
    body: values,
    async onResponse({request, response, options}) {
      if (response.status === 201) {
        const {data: user} = await $apiCallGET('/api/user')

        watch(user, (loggedInUser) => {
          store(loggedInUser)
          auth.user = loggedInUser
          auth.loggedIn = true
          isSubmitting.value = false
          window.location.pathname = '/account/dashboard'
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