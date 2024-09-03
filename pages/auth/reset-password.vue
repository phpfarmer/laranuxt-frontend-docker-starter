<template>
  <div class="flex items-center justify-center h-full">
    <Title>Reset Password | {{ title }}</Title>
    <ResetPasswordForm v-if="form" :value="form.user" @update:value="updateUser" />
  </div>
</template>


<script setup>
import {ref} from "vue";
import {useState} from "nuxt/app";
import ResetPasswordForm from "~/pages/auth/forms/ResetPasswordForm.vue";

definePageMeta({
  layout: 'login',
  middleware: 'guest'
})

const title = useState('title')
const form = ref({
  user: {
    email: '',
    password: '',
    password_confirmation: '',
    token: '',
  }
});

const updateUser = (newValue) => {
  form.value.user = newValue;
};

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  form.value.user.email = urlParams.get('email') || '';
  form.value.user.token = urlParams.get('token') || '';
});
</script>