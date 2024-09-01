<script setup>
import DangerButton from '~/components/UI/DangerButton.vue';
import InputError from '~/components/UI/InputError.vue';
import InputLabel from '~/components/UI/InputLabel.vue';
import Modal from '~/components/UI/Modal.vue';
import SecondaryButton from '~/components/UI/SecondaryButton.vue';
import TextInput from '~/components/UI/TextInput.vue';
import {computed, nextTick, ref} from 'vue';
import {useNuxtApp, useRouter} from "nuxt/app";
import * as yup from "yup";
import {useField, useForm} from "vee-validate";
import {UNKNOWN_SERVER_ERROR_MESSAGE} from "~/static/texts";
import AlartErrorMessage from '~/components/Form/AlartErrorMessage';
import {useAuthStore} from "../../../stores/auth";

const {$apiCallDELETE, $apiCallGET} = useNuxtApp()

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const confirmingUserDeletion = ref(false);
const passwordInput = ref(null);
const password = ref(null);

const success = ref(null)
const error = ref(null);

const schema = yup.object({
  password: yup.string().required().label('Password'),
})

const {handleSubmit, errors, isSubmitting} = useForm({
  validationSchema: schema,
})

const {value: passwordValue} = useField('password');

const confirmUserDeletion = () => {
  confirmingUserDeletion.value = true;

  nextTick(() => passwordInput.value.focus());
};

const isSubmitDisabled = computed(() => {
  return isSubmitting.value
})

const auth = useAuthStore()
const router = useRouter()
const onSubmit = handleSubmit(async (values) => {
  await csrf();
  isSubmitting.value = true
  success.value = null;
  error.value = null;

  await $apiCallDELETE('/api/account/profile/delete', {
    body: values,
    async onResponse({request, response, options}) {
      isSubmitting.value = false
      if (response.status === 200) {
        success.value = response._data?.message;

        setTimeout(async () => {
          await auth.logout();
          router.push('/auth/login');
        }, 1000);
      }
    },
    onResponseError({request, response}) {
      error.value = (response?._data?.message) ? response._data?.message : UNKNOWN_SERVER_ERROR_MESSAGE
    }
  })

  isSubmitting.value = false
});

const closeModal = () => {
  confirmingUserDeletion.value = false;
};
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-lg font-medium text-gray-900">Delete Account</h2>

      <p class="mt-1 text-sm text-gray-600">
        Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting
        your account, please download any data or information that you wish to retain.
      </p>
    </header>

    <DangerButton @click="confirmUserDeletion">Delete Account</DangerButton>

    <Modal :show="confirmingUserDeletion" @close="closeModal" @submit.prevent="onSubmit">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Are you sure you want to delete your account?
        </h2>

        <AlartErrorMessage v-if="success">{{ success }}</AlartErrorMessage>
        <AlartErrorMessage v-if="error">{{ error }}</AlartErrorMessage>

        <p class="mt-1 text-sm text-gray-600">
          Once your account is deleted, all of its resources and data will be permanently deleted and you will be logged
          out instantly! Please enter your password to confirm you would like to permanently delete your account.
        </p>

        <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
          <div class="mt-6">
            <InputLabel class="sr-only" for="password" value="Password"/>

            <TextInput
                id="password"
                ref="passwordInput"
                v-model="passwordValue"
                class="mt-1 block w-3/4"
                placeholder="Password"
                type="password"
                @keyup.enter="onSubmit"
            />

            <InputError :message="errors.password" class="mt-2"/>
          </div>

          <div class="mt-6 flex justify-end">
            <SecondaryButton @click="closeModal"> Cancel</SecondaryButton>

            <DangerButton
                :class="{ 'opacity-25': false }"
                :disabled="isSubmitDisabled"
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
  </section>
</template>
