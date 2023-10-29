<template>
  <span class="text-gray-700"><slot>{{ value }}</slot></span>
</template>
<script setup>
defineProps(['value']);
</script>