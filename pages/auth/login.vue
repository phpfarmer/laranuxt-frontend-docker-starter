<template>
  <div class="flex items-center justify-center w-full h-full">
    <Title>Login | {{ title }}</Title>
    <LoginForm v-if="form" :value="form.user" @update:value="updateUser" />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import LoginForm from '~/pages/auth/forms/LoginForm.vue';

definePageMeta({
  layout: 'login',
  middleware: 'guest'
});

const title = useState('title');
const form = ref({
  user: {
    email: '',
    password: '',
    message: '',
  }
});

const updateUser = (newValue) => {
  form.value.user = newValue;
};
</script>
