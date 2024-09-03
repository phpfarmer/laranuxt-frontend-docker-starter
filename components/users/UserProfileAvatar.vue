<script setup>
import { computed } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  useImageAvatar: {
    type: Boolean,
    default: false,
  },
});

const userInitials = computed(() => {
  if (props.user?.name) {
    const nameParts = props.user.name.split(' ');
    const initials = nameParts[0].charAt(0) + (nameParts[1]?.charAt(0) || '');
    return initials.toUpperCase();
  }
  return '';
});
</script>

<template>
  <div class="flex items-center p-4">
    <div
        v-if="useImageAvatar && user?.avatarUrl"
        class="h-12 w-12 rounded-full bg-gray-300"
    >
      <img :src="user.avatarUrl" alt="User Avatar" class="h-full w-full rounded-full object-cover" />
    </div>
    <div
        v-else
        class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-semibold"
    >
      {{ userInitials }}
    </div>
    <div class="ml-4 w-64">
      <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
      <p class="text-sm text-gray-500 truncate max-w-[30ch]" title="{{ user?.email }}">{{ user?.email }}</p>
    </div>
  </div>
</template>
