<template>
  <div class="flex items-center justify-center h-full">
    <Title>Forgot Password | {{ title }}</Title>
    <ForgotPasswordForm v-if="form" :value="form.user" @update:value="updateUser" />
  </div>
</template>


<script setup>
import {ref} from "vue";
import {useState} from "nuxt/app";
import ForgotPasswordForm from "~/pages/auth/forms/ForgotPasswordForm.vue";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
});

const title = useState('title');
const form = ref({
  user: {
    email: '',
  }
});

const updateUser = (newValue) => {
  form.value.user = newValue;
};
</script>