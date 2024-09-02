<script lang="ts" setup>
import {ref} from 'vue';
import ApplicationLogo from '@/components/ApplicationLogo.vue';
import {Dropdown, DropdownLink, NavLink, ResponsiveNavLink} from '@/components/UI/index';
import {useAuthStore} from '~/stores/auth'
import {useState, useRouter} from "nuxt/app";

const showingNavigationDropdown = ref(false);
const {user} = useAuthStore()

const title = useState('title', () => 'laranuxt - Craft, Customize, Create')

const auth = useAuthStore()
const router = useRouter()

const loggedIn = computed(() => {
  return auth.isUserLoggedIn;
});

const onLogout = async () => {
  try {
    await auth.logout();
    router.push('/auth/login');
  } catch (e) {
    console.log(e);
  }
}
</script>

<template>
  <div>
    <Title>{{ title }}</Title>
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white border-b border-gray-100">
        <div class="mx-auto px-6 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="shrink-0 flex items-center">
                <NuxtLink :to="'/'">
                  <ApplicationLogo
                      class="block h-9 w-auto fill-current text-gray-800"
                  />
                </NuxtLink>
              </div>

              <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                <NavLink v-if="loggedIn" :active="true" :href="'/account/dashboard'">
                  Dashboard
                </NavLink>
              </div>
            </div>


            <div class="hidden sm:flex sm:items-center sm:ml-6">

              <div v-if="!loggedIn" class="hidden lg:flex lg:flex-1 lg:justify-end">
                <NuxtLink class="text-sm font-semibold leading-6 text-gray-900" to="/auth/login">
                  Log in <span aria-hidden="true">&rarr;</span>
                </NuxtLink>
              </div>

              <div class="ml-3 relative">
                <Dropdown v-if="loggedIn" align="right" width="96">
                  <template #trigger>
                    <span class="inline-flex rounded-md">
                        <button
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                            type="button"
                        >
                            {{ (loggedIn) ? user?.name : '' }}
                            <svg
                                class="ml-2 -mr-0.5 h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    clip-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    fill-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </span>
                  </template>

                  <template #content>
                    <div class="flex items-center px-4 py-2">
                      <img
                          :src="user?.profile_photo_url || 'https://via.placeholder.com/50'"
                          alt="Profile Image"
                          class="h-12 w-12 rounded-full object-cover"
                      />
                      <div class="ml-3 w-64">
                        <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
                        <p class="text-sm text-gray-500 truncate max-w-[215px]" title="{{ user?.email }}">
                          {{ user?.email }}
                        </p>
                      </div>
                    </div>

                    <hr class="border-gray-200 my-2"/>
                    <div class="py-1">
                      <DropdownLink :href="'/profile/edit'">Profile</DropdownLink>
                      <DropdownLink :href="'/settings'">Settings</DropdownLink>
                    </div>

                    <hr class="border-gray-200 my-2"/>
                    <div class="py-1">
                      <DropdownLink as="button" method="post" @click="onLogout" class="cursor-pointer ">Log out</DropdownLink>
                    </div>
                  </template>
                </Dropdown>
              </div>
            </div>

            <div class="-mr-2 flex items-center sm:hidden">
              <button
                  class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                  @click="showingNavigationDropdown = !showingNavigationDropdown"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      :class="{
                                            hidden: showingNavigationDropdown,
                                            'inline-flex': !showingNavigationDropdown,
                                        }"
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                  />
                  <path
                      :class="{
                                            hidden: !showingNavigationDropdown,
                                            'inline-flex': showingNavigationDropdown,
                                        }"
                      d="M6 18L18 6M6 6l12 12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
            :class="{ block: showingNavigationDropdown, hidden: !showingNavigationDropdown }"
            class="sm:hidden"
        >
          <div class="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink :active="true" :href="'/account/dashboard'">
              Dashboard
            </ResponsiveNavLink>
          </div>

          <div class="pt-4 pb-1 border-t border-gray-200">
            <div class="px-4">
              <div class="font-medium text-base text-gray-800">
                {{ (loggedIn) ? user?.name : '' }}
              </div>
              <div class="font-medium text-sm text-gray-500">{{ (loggedIn) ? user?.email : '' }}</div>
            </div>

            <div class="mt-3 space-y-1">
              <ResponsiveNavLink :href="'profile/edit'"> Profile</ResponsiveNavLink>
              <ResponsiveNavLink as="button" method="post" @click="onLogout">
                Log Out
              </ResponsiveNavLink>
            </div>
          </div>
        </div>
      </nav>

      <header v-if="$slots.header" class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <slot name="header"/>
        </div>
      </header>

      <main>
        <slot/>
      </main>
    </div>
  </div>
</template>
