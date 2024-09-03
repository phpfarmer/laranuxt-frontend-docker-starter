<script setup>
import {useAuthStore} from "~/stores/auth";
import {useState} from "nuxt/app";

definePageMeta({
  layout: 'account',
  middleware: 'auth'
})

const title = useState('title')
const auth = useAuthStore()
const fetchedUser = ref(null);

onMounted(async () => {
  fetchedUser.value = await auth.fetchUserProfileData();
});
</script>

<template>
  <div class="py-12">
    <Title>Dashboard | {{ title }}</Title>
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">You're logged in!</div>

        <div class="p-6 mb-4 text-sm text-gray-600">
          <pre>{{ fetchedUser }}</pre>
        </div>
        
      </div>
    </div>
  </div>
</template>
