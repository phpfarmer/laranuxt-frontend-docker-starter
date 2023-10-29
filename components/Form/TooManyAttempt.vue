<script lang="ts" setup>
defineProps<{
  content?: string
}>()
</script>

<template>
  <div class="mb-8 space-y-2 text-center">
    <p class="text-gray-500 text-sm">
      <slot>{{ content }}</slot>
    </p>
  </div>
</template>