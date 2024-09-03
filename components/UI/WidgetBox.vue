<template>
  <div class="bg-white p-4 sm:p-8 shadow sm:rounded-lg mb-5">
    <h2 v-if="title" class="mb-4 font-semibold pl-1 pt-2">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>