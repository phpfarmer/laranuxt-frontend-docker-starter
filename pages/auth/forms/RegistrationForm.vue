<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form @submit.prevent="onSubmit">
      <FormHeader subTitle="Please enter your account information" title="Register"/>

      <AlartSuccessMessage v-if="success">{{ message }}</AlartSuccessMessage>
      <AlartErrorMessage v-if="error">{{ message }}</AlartErrorMessage>

      <label class="block mb-5" for="name">
        <InputLabel>Name</InputLabel>
        <TextInput
            id="name"
            v-model="value.name"
            :validationObject="v$.value.name"
            placeholder="i.e John Doe"
            required
            type="text"
        />
      </label>

      <label class="block mb-5" for="email">
        <InputLabel>Email address</InputLabel>
        <TextInput
            id="email"
            v-model="value.email"
            :validationObject="v$.value.email"
            placeholder="i.e john@example.com"
            required
            type="email"
        />
      </label>

      <label class="block mb-5" for="password">
        <InputLabel>Password</InputLabel>
        <TextInput
            id="password"
            v-model="value.password"
            :validationObject="v$.value.password"
            placeholder="********"
            required
            type="password"
        />
      </label>

      <label class="block mb-5" for="password_confirmation">
        <InputLabel>Password Confirmation</InputLabel>
        <TextInput
            id="password_confirmation"
            v-model="value.password_confirmation"
            :validationObject="v$.value.password_confirmation"
            placeholder="********"
            required
            type="password"
        />
      </label>

      <div class="mb-0 mt-4 flex gap-2 justify-between items-center">
        <Checkbox v-model="value.is_terms_and_condition" :validation-object="v$.value.is_terms_and_condition">
          <template v-slot:label>
              <span class="ml-1 text-sm" :class="{ 'text-error': !!v$.value.is_terms_and_condition.$error }">
              <span> I agree with </span>
              <nuxt-link
                  class="text-primary-500 hover:underline font-semibold text-sm inline"
                  to="/terms"
              >
                Terms and Condition
              </nuxt-link>
              </span>
          </template>
        </Checkbox>
      </div>

      <div class="mb-5 mt-1 flex gap-2 justify-between items-center">
        <Checkbox v-model="value.is_privacy_policy" :validation-object="v$.value.is_privacy_policy">
          <template v-slot:label>
              <span class="ml-1 text-sm" :class="{ 'text-error': !!v$.value.is_privacy_policy.$error }">
              <span> I agree with </span>
              <nuxt-link
                  class="text-primary-500 hover:underline font-semibold text-sm inline"
                  to="/privacy"
              >
                Privacy Policy
              </nuxt-link>
              </span>
          </template>
        </Checkbox>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useVuelidate } from '@vuelidate/core';
import { minLength, required, email, sameAs } from '@vuelidate/validators';
import {FormHeader, AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import {PrimaryButton, InputLabel, TextInput, Checkbox} from '~/components/UI/index';

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '', message: '' }) },
});

const success = ref('');
const pending = ref(true);
const error = ref(false);
const message = ref(props.value.message || '');

const rules = {
  value: {
    name: { required },
    email: { required, email },
    password: { required, minLength: minLength(8) },
    password_confirmation: { required, sameAsPassword: sameAs(ref('password'), 'Passwords must match') },
    is_terms_and_condition: {mustAgree: value => value === true},
    is_privacy_policy: {mustAgree: value => value === true},
  },
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const router = useRouter();
const emit = defineEmits(['continueNext']);

const onSubmit = async () => {
  const config = useRuntimeConfig();
  v$.value.$touch();
  error.value = false;
  message.value = null;
  pending.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: props.value.name,
        email: props.value.email,
        password: props.value.password,
        password_confirmation: props.value.password_confirmation,
        is_terms_and_condition: {mustAgree: value => value === true},
        is_privacy_policy: {mustAgree: value => value === true},
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Failed to submit registration request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      props.value.id = responseData.id;
      emit('continueNext');
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    pending.value = false;
  }
};
</script>