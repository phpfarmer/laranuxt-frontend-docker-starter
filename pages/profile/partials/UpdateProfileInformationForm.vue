<script setup>
import InputError from '~/components/UI/InputError.vue';
import InputLabel from '~/components/UI/InputLabel.vue';
import PrimaryButton from '~/components/UI/PrimaryButton.vue';
import TextInput from '~/components/UI/TextInput.vue';
import {computed, onMounted, ref, watch} from "vue";
import * as yup from "yup";
import {useField, useForm} from "vee-validate";
import {useAuthStore} from "~/stores/auth";
import {useAuthStorage} from "~/composables/auth";
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import FormHeader from '~/components/Form/FormHeader.vue';
import FormTooManyAttempt from '~/components/Form/TooManyAttempt';

import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import AlartSuccessMessage from '~/components/Form/AlartSuccessMessage';
import {useNuxtApp, useRoute, useRouter} from "nuxt/app";


const props = defineProps({
  mustVerifyEmail: Boolean,
  status: String,
});

const {$apiCallPOST, $apiCallGET} = useNuxtApp()

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const router = useRouter()
const route = useRoute()

const name = ref(null);
const email = ref(null);
const success = ref(null)
const error = ref(null);
const errorFields = ['name', 'email'];

const schema = yup.object({
  name: yup.string().required().label('Name'),
  email: yup.string().required().label('Email'),
})

const {handleSubmit, errors, isSubmitting, submitCount} = useForm({
  validationSchema: schema,
})

const {value: nameValue} = useField('name');
const {value: emailValue} = useField('email');

const auth = useAuthStore()
const {store} = useAuthStorage()

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 5
});

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const isValidationErrorExists = computed(() => {
  return Object.keys(errors.value).filter(fieldName => errorFields.some(key => key === fieldName)).length > 0
})

onMounted(async () => {
  await fetchAndSetProfileData();
})

const fetchAndSetProfileData = async () => {
  await csrf();
  const {data: user} = await $apiCallGET('/api/account/profile', {
    onResponseError({request, response}) {
      error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
    }
  });

  const {name, email} = user.value
  nameValue.value = name
  emailValue.value = email
}

const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  success.value = null;
  error.value = null;

  await $apiCallPOST('/api/account/profile', {
    body: values,
    async onResponse({request, response, options}) {
      isSubmitting.value = false

      if (response.status === 200) {
        success.value = response._data?.message;

        const {data: user} = await $apiCallGET('/api/account/profile')

        watch(user, (loggedInUser) => {
          store(loggedInUser)
          auth.user = loggedInUser
          auth.loggedIn = true

          if (route.query?.next) {
            //return router.push({
            //  path: route.query.next
            //})
          } else {
            //return router.push({
            //  path: '/account/dashboard'
            //})
            //window.location.pathname = '/account/dashboard'
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

<template>
  <section>
    <header class="space-y-2 mb-4">
      <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>
      <p class="mt-1 text-sm text-gray-600">
        Update your account's profile information and email address.
      </p>
    </header>

    <AlartSuccessMessage v-if="success && !isTooManyAttempts">{{ success }}</AlartSuccessMessage>
    <AlartErrorMessage v-if="error && !isTooManyAttempts">{{ error }}</AlartErrorMessage>

    <form v-if="!isTooManyAttempts" class="mt-6 space-y-6" @submit.prevent="onSubmit">
      <div>
        <InputLabel for="name" value="Name"/>

        <TextInput
            id="name"
            v-model="nameValue"
            autocomplete="name"
            autofocus
            class="mt-1 block w-full"
            required
            type="text"
        />

        <InputError :message="errors.name" class="mt-2"/>
      </div>

      <div>
        <InputLabel for="email" value="Email"/>

        <TextInput
            id="email"
            v-model="emailValue"
            autocomplete="email"
            class="mt-1 block w-full"
            required
            type="email"
        />

        <InputError :message="errors.email" class="mt-2"/>
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
