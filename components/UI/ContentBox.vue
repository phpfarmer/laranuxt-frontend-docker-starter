<template>
  <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg mb-5">
      <header v-if="$slots['content-title'] || $slots['content-sub-title']" class="space-y-2 mb-4">
        <h2 v-if="$slots['content-title']" class="text-lg font-medium text-gray-900">
          <slot name="content-title">
            Default title
          </slot>
        </h2>

        <div v-if="$slots['content-sub-title']" class="mt-1 text-sm text-gray-600">
          <slot name="content-sub-title">
            Default sub title
          </slot>
        </div>
      </header>

      <slot />
  </div>
</template>
<script setup>
</script>