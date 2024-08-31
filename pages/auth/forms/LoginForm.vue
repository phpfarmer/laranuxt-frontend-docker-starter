<template>
  <div class="flex items-center justify-center h-full">
    <Title>Login | {{ title }}</Title>
    <form v-if="!isTooManyAttempts" class="rounded-lg px-8 py-8 w-full max-w-md mx-auto" @submit.prevent="onSubmit">
      <FormHeader subTitle="Please enter your credentials" title="Login"/>

      <AlartSuccessMessage v-if="success">{{ success }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error">{{ error }}</AlartErrorMessage>

      <label class="block mb-5" for="email">
        <InputLabel>Email address</InputLabel>
        <TextInput
            id="email"
            v-model="value.email"
            placeholder="i.e john@example.com"
            required
            type="email"
        />
        <pre>{{ v$.value.email }}</pre>
      </label>

      <label class="block mb-5" for="password">
        <InputLabel>Password</InputLabel>
        <TextInput
            id="password"
            v-model="value.password"
            placeholder="********"
            required
            type="password"
        />
        <pre>{{ v$.value.password }}</pre>
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
definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title');
</script>

<script>
import FormHeader from '~/components/Form/Header';
import FormTooManyAttempt from '~/components/Form/TooManyAttempt';
import PrimaryButton from '~/components/UI/PrimaryButton';
import InputError from '~/components/UI/InputError';
import InputLabel from '~/components/UI/InputLabel';
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import TextInput from '~/components/UI/TextInput'
import AlartSuccessMessage from "../../components/Form/AlartSuccessMessage";

import { useVuelidate } from '@vuelidate/core'
import { minLength, required, email } from '@vuelidate/validators'
import {useRuntimeConfig} from "nuxt/app";

import {useAuthStore} from '~/stores/auth'
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";

export default {
  name: 'LoginForm',

  components: {
    FormHeader, FormTooManyAttempt, PrimaryButton, InputError, InputLabel, AlartErrorMessage, TextInput, AlartSuccessMessage
  },

  props: {
    value: { type: Object, default: null, required: true },
  },

  data() {
    return {
      success: '',
      isTooManyAttempts: 0,
      isSubmitDisabled: false,
      pending: true,
      error: false,
      message: null,
    }
  },

  setup () {
    return { v$: useVuelidate() }
  },

  validations: {
    value: {
      email: {required, email},
      password: {required, minLength: minLength(8)},
    }
  },

  computed: {

  },

  mounted() {
    this.message = this.value.message || '';
  },

  methods: {
    async onSubmit() {
      const config = useRuntimeConfig();
      this.error = false;
      this.message = null;
      try {
        const response = await fetch(config.public.apiBaseUrl + '/login', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: this.value.email,
            password: this.value.password,
          }),
        });

        if (!response.ok) {
          const responseData = await response.json();
          let errorMessage = 'Failed to submit login request.';

          if (responseData.errors && typeof responseData.errors === 'object') {
            const firstErrorField = Object.keys(responseData.errors)[0];
            errorMessage = responseData.errors[firstErrorField][0];
          }
          throw new Error(errorMessage);
        } else {
          const responseData = await response.json();
          this.message = responseData.message;
          const authStore = useAuthStore();
          authStore.setToken(responseData.access_token);
          await authStore.fetchUser();
          this.$router.push('/account/dashboard');
        }
      } catch (error) {
        this.message = error;
        this.error = true;
      } finally {
        this.pending = false;
      }
    }
  },
}

/*const title = useState('title')
const success = useState('passwordResetSuccessMessage')
const submitCount = ref(0);
const isSubmitting = ref(false);

const router = useRouter()
const route = useRoute()
const {$apiCallPOST, $apiCallGET} = useNuxtApp()
const error = ref(null)

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const auth = useAuthStore()
const {store} = useAuthStorage()

const isTooManyAttempts = computed(() => {
  return submitCount.value >= 10;
});

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})*/

/*const onSubmit = handleSubmit(async (values) => {
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
            /!*return router.push({
              path: '/account/dashboard'
            })*!/
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
})*/
</script>