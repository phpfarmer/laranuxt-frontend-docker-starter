<script setup>
import DeleteUserForm from './partials/DeleteUserForm.vue';
import UpdatePasswordForm from './partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm.vue';
import {useState} from "nuxt/app";
import ResponsiveNavLink from '@/components/UI/ResponsiveNavLink.vue';
import {useAuthStore} from "../../stores/auth";
import WidgetBox from "~/components/UI/WidgetBox.vue";

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
    form.value.user.id = userData.id || '';
    form.value.user.name = userData.name || '';
    form.value.user.email = userData.email || '';
    form.value.user.email_update = userData.email_update || null;
  }
}

const form = ref({
  user: {
    id: '',
    name: '',
    email: '',
    current_password: '',
    password: '',
    password_confirmation: '',
    email_update: '',
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

      <div class="container mx-auto flex flex-wrap md:flex-nowrap">
        <!-- Left Column (Account Links) -->
        <div class="w-full md:w-1/3 px-4 mb-6 md:mb-0">
          <widget-box title="Account Settings">
            <ul>
              <ResponsiveNavLink :active="true" :href="'/profile/edit'"> Profile</ResponsiveNavLink>
              <ResponsiveNavLink as="button" method="post" @click="onLogout">
                Log out
              </ResponsiveNavLink>
            </ul>
          </widget-box>
        </div>

        <!-- Right Column (Settings Form) -->
        <div class="w-full md:w-2/3 px-4">
          <UpdateProfileInformationForm :value="form.user" @update:value="updateUser" />

          <UpdatePasswordForm :value="form.user" @update:value="updateUser" />

          <DeleteUserForm :value="form.user" @update:value="updateUser" />
        </div>
      </div>
    </div>
  </div>
</template>
