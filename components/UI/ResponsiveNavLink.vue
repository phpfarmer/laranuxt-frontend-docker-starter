<script setup>
import {computed} from 'vue';

const props = defineProps(['href', 'active']);

const classes = computed(() =>
    props.active
        ? 'block w-full pl-3 pr-4 py-2 border-l-4 border-green-400 cursor-pointer text-left text-base font-medium text-green-700 bg-green-50 focus:outline-none focus:text-green-800 focus:bg-green-100 focus:border-green-700 transition duration-150 ease-in-out'
        : 'block w-full pl-3 pr-4 py-2 border-l-4 border-transparent cursor-pointer text-left text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out'
);
</script>

<template>
  <NuxtLink :class="classes" :to="href">
    <slot/>
  </NuxtLink>
</template>
