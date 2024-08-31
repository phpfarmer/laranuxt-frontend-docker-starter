<template>
  <div class="rounded-lg px-8 py-8 w-full max-w-md mx-auto">
    <form>
      <FormHeader subTitle="Please check your email to verify your account" title="Registration Successful"/>

      <p class="text-sm">We've sent a confirmation email to the address you provided. Please click on the link in the email to complete your registration.</p>

      <PrimaryButton :disabled="isSubmitDisabled" class="mb-5 mt-6" type="submit">
        Resend Confirmation Email
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
import {FormHeader} from '~/components/Form/index.js';
import {PrimaryButton} from "~/components/UI/index.js";

const props = defineProps({
  value: { type: Object, default: () => ({ email: '', password: '', message: '' }) },
});
</script>