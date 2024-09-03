<template>
  <div class="flex items-center justify-center w-full h-full">
    <Title>Register | {{ title }}</Title>
    <component :is="currentForm" :value="form.user" @update:value="updateUser" @continueNext="continueNext" />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import Step1 from '~/pages/auth/forms/RegistrationForm.vue';
import Step2 from '~/pages/auth/forms/RegistrationConfirmation.vue';

definePageMeta({
  layout: 'login',
  middleware: 'guest'
});

const title = useState('title');
const form = ref({
  user: {
    id: null,
    email: null,
    password: null,
    message: null,
    password_confirmation: null,
    is_terms_and_condition: false,
    is_privacy_policy: false,
  }
});

const updateUser = (newValue) => {
  form.value.user = newValue;
};

const props = defineProps({
  initialStep: {
    type: Number,
    default: 1,
  },
});

const formCurrentStep = ref(props.initialStep);
const currentForm = computed(() => {
  return formCurrentStep.value === 1 ? Step1 : Step2;
});

const continueNext = () => {
  formCurrentStep.value++;
};
</script>