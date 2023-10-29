<script lang="ts" setup>
defineProps<{
  title?: string,
  content?: string
}>()
</script>

<template>
  <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4" role="alert">
    <p v-if="title" class="font-bold">{{ title }}</p>
    <p class="text-sm">
      <slot>{{ content }}</slot>
    </p>
  </div>
</template>