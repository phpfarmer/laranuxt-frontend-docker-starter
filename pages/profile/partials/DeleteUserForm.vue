<script setup>
import {InputLabel, TextInput, DangerButton, SecondaryButton, Modal} from '~/components/UI/index.js';
import {AlartErrorMessage, AlartSuccessMessage} from '~/components/Form/index.js';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import {computed, ref} from 'vue';
import {useRouter} from "nuxt/app";
import {useAuthStore} from "~/stores/auth";
import ContentBox from "~/components/UI/ContentBox.vue";

const props = defineProps({
  value: { type: Object, default: () => ({ password: '' }) },
});

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const success = ref(false)
const error = ref(false);
const message = ref('');

const rules = {
  value: {
    password: { required, minLength: minLength(8) },
  }
};

const v$ = useVuelidate(rules, props);
const isSubmitDisabled = computed(() => {
  return v$.value.$invalid;
});

const confirmingUserDeletion = ref(false);

const confirmUserDeletion = () => {
  confirmingUserDeletion.value = true;
};

const onSubmit = async () => {
  v$.value.$touch();
  if (isSubmitDisabled.value) {
    return false;
  }

  const config = useRuntimeConfig();
  success.value = false;
  error.value = false;
  message.value = null;
  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/account/profile/delete`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        password: props.value.password,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      let errorMessage = 'Unable to submit profile delete request.';

      if (responseData.errors && typeof responseData.errors === 'object') {
        const firstErrorField = Object.keys(responseData.errors)[0];
        errorMessage = responseData.errors[firstErrorField][0];
      }
      throw new Error(errorMessage);
    } else {
      const responseData = await response.json();
      message.value = responseData.message;
      success.value = true;

      setTimeout(async () => {
        await auth.logout();
        router.push('/auth/login');
      }, 1000);
    }
  } catch (err) {
    message.value = err.message;
    error.value = true;
  } finally {
    loading.value = false;
  }
}

const closeModal = () => {
  confirmingUserDeletion.value = false;
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

      <Modal :show="confirmingUserDeletion" @close="closeModal" @submit.prevent="onSubmit">
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

          <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
            <div class="mt-6">
              <InputLabel class="sr-only" for="password" value="Password"/>

              <TextInput
                  id="password"
                  v-model="value.password"
                  :validationObject="v$.value.password"
                  class="mt-1 block w-3/4"
                  placeholder="Password"
                  type="password"
                  @keyup.enter="onSubmit"
              />
            </div>

            <div class="mt-6 flex justify-end">
              <SecondaryButton @click="closeModal"> Cancel</SecondaryButton>

              <DangerButton
                  :class="{ 'opacity-25': false }"
                  :disabled="loading"
                  class="ml-3"
                  type="submit"
                  @click="onSubmit"
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
