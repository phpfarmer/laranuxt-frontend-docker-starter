<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form @submit.prevent="onSubmit">

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useVuelidate } from '@vuelidate/core';
import { minLength, required, email, sameAs } from '@vuelidate/validators';
import { useAuthStore } from '~/stores/auth';
import {FormHeader, TooManyAttempt, AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import {PrimaryButton, InputLabel, TextInput} from '~/components/UI/index';

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '', message: '' }) },
});

const success = ref('');
const isTooManyAttempts = ref(0);
const isSubmitDisabled = ref(false);
const pending = ref(true);
const error = ref(false);
const message = ref(props.value.message || '');

const rules = {
  value: {
    name: { required },
    email: { required, email },
    password: { required, minLength: minLength(8) },
    password_confirmation: { required, sameAsPassword: sameAs(ref('password'), 'Passwords must match') },
  },
};

const v$ = useVuelidate(rules, props);

const router = useRouter();

const onSubmit = async () => {
  const config = useRuntimeConfig();
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
      this.value.id = responseData.id;
      this.$emit('continueNext');
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    pending.value = false;
  }
};
</script>