<script lang="ts" setup>
defineProps<{
  title?: string
  subTitle?: string
}>()
</script>

<template>
  <div class="mb-8 space-y-2 text-center">
    <h1 class="text-2xl font-semibold">
      {{ title }}
    </h1>
    <p class="text-gray-500 text-sm">
      {{ subTitle }}
    </p>
  </div>
</template>
