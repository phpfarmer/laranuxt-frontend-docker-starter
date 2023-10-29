<script setup>
import DeleteUserForm from './partials/DeleteUserForm.vue';
import UpdatePasswordForm from './partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm.vue';
import {useNuxtApp, useState} from "nuxt/app";
import ResponsiveNavLink from '@/components/UI/ResponsiveNavLink.vue';
import {useAuthStore} from "../../stores/auth";

defineProps({
  mustVerifyEmail: Boolean,
  status: String,
});

definePageMeta({
  layout: 'account',
  middleware: 'auth'
})

const {$apiCallPOST, $apiCallGET} = useNuxtApp()

const title = useState('title')

async function csrf() {
  return $apiCallGET('/sanctum/csrf-cookie')
}

const auth = useAuthStore()
const router = useRouter()
const onLogout = async () => {
  await csrf();

  try {
    await $apiCallPOST('/logout')
    auth.logout()
    router.push('/auth/login')
  } catch (e) {
    console.log(e);
  }
}
</script>

<template>
  <div class="py-12">
    <Title>Profile | {{ title }}</Title>
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

      <div class="container mx-auto flex">
        <!-- Left Column (Account Links) -->
        <div class="w-1/3 px-4">
          <div class="bg-white p-4 rounded shadow">
            <h2 class="mb-4 font-semibold pl-1 pt-2">Account Settings</h2>
            <ul>
              <ResponsiveNavLink :active="true" :href="'/profile/edit'"> Profile</ResponsiveNavLink>
              <ResponsiveNavLink as="button" method="post" @click="onLogout">
                Log Out
              </ResponsiveNavLink>
            </ul>
          </div>
        </div>

        <!-- Right Column (Settings Form) -->
        <div class="w-2/3 px-4">

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <UpdateProfileInformationForm
                :must-verify-email="mustVerifyEmail"
                :status="status"
                class="max-w-full"
            />
          </div>

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <UpdatePasswordForm class="max-w-full"/>
          </div>

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <DeleteUserForm class="max-w-full"/>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
