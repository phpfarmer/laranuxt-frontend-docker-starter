<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useFormHandler } from '~/composables/useFormHandler';
import { required, minLength } from '@vuelidate/validators';
import { InputLabel, TextInput, DangerButton, SecondaryButton, Modal, ContentBox } from '~/components/UI/index.js';
import { AlartErrorMessage, AlartSuccessMessage } from '~/components/Form/index.js';

const props = defineProps({
  value: { type: Object, default: () => ({ password: '' }) },
});

const rules = {
  value: {
    password: { required, minLength: minLength(8) },
  },
};

const { v$, loading, success, error, message, isSubmitDisabled, onSubmit } = useFormHandler(rules, props, {
  url: `${useRuntimeConfig().public.apiBaseUrl}/api/account/profile/delete`,
  method: 'DELETE',
  errorMessage: 'Unable to submit profile delete request.',
});

const confirmingUserDeletion = ref(false);

const confirmUserDeletion = () => {
  confirmingUserDeletion.value = true;
};

const closeModal = () => {
  confirmingUserDeletion.value = false;
};

const auth = useAuthStore()
const router = useRouter()
const handleSubmit = async () => {
  if (isSubmitDisabled.value) return;

  try {
    await onSubmit();
    await auth.logout();
    await router.push('/auth/login');
  } catch (err) {
    console.error('Submission error:', err);
  }
};
</script>

<template>
  <content-box>
    <template v-slot:content-title>
      Delete Account
    </template>
    <template v-slot:content-sub-title>
      Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting
      your account, please download any data or information that you wish to retain.
    </template>

    <template v-slot:default>
      <DangerButton @click="confirmUserDeletion">Delete Account</DangerButton>

      <Modal :show="confirmingUserDeletion" @close="closeModal" @submit.prevent="handleSubmit">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Are you sure you want to delete your account?
          </h2>

          <AlartSuccessMessage v-if="success">{{ message }}</AlartSuccessMessage>
          <AlartErrorMessage v-if="error">{{ message }}</AlartErrorMessage>

          <p class="mt-1 text-sm text-gray-600">
            Once your account is deleted, all of its resources and data will be permanently deleted and you will be logged
            out instantly! Please enter your password to confirm you would like to permanently delete your account.
          </p>

          <form class="mt-6 space-y-6" @submit.prevent="handleSubmit">
            <div class="mt-6">
              <InputLabel class="sr-only" for="password" value="Password"/>

              <TextInput
                  id="password"
                  v-model="value.password"
                  :validationObject="v$.value.password"
                  class="mt-1 block w-3/4"
                  placeholder="Password"
                  type="password"
                  @keyup.enter="handleSubmit"
              />
            </div>

            <div class="mt-6 flex justify-end">
              <SecondaryButton @click="closeModal"> Cancel</SecondaryButton>

              <DangerButton
                  :class="{ 'opacity-25': false }"
                  :disabled="loading"
                  class="ml-3"
                  type="submit"
                  @click="handleSubmit"
              >
                Delete Account
              </DangerButton>
            </div>
          </form>

        </div>
      </Modal>
    </template>
  </content-box>
</template>
