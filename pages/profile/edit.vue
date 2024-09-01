<script setup>
import DeleteUserForm from './partials/DeleteUserForm.vue';
import UpdatePasswordForm from './partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm.vue';
import {useState} from "nuxt/app";
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

const title = useState('title')

const auth = useAuthStore()
const router = useRouter()

const onLogout = async () => {
  try {
    await auth.logout();
    router.push('/auth/login');
  } catch (e) {
    console.log(e);
  }
}

onMounted(async () => {
  await fetchAndSetProfileData();
})

const fetchAndSetProfileData = async () => {
  const userData = await auth.fetchUserProfileData();

  if (userData) {
    form.value.user.name = userData.name || '';
    form.value.user.email = userData.email || '';
  }
}

const form = ref({
  user: {
    name: '',
    email: '',
    current_password: '',
    password: '',
    password_confirmation: '',
  }
});

const updateUser = (newValue) => {
  form.value.user = newValue;
};
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
                Log out
              </ResponsiveNavLink>
            </ul>
          </div>
        </div>

        <!-- Right Column (Settings Form) -->
        <div class="w-2/3 px-4">

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <UpdateProfileInformationForm
                :value="form.user" @update:value="updateUser"
                class="max-w-full"
            />
          </div>

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <UpdatePasswordForm :value="form.user" @update:value="updateUser" class="max-w-full"/>
          </div>

          <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
            <DeleteUserForm class="max-w-full"/>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
