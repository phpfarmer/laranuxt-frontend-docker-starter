<template>
  <div v-if="modelValue.$error">
    <div
        class="text-sm text-red-600"
        v-for="errorMessage in errorMessages"
        :key="errorMessage"
        v-text="errorMessage"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ValidationTexts from './validationTexts';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const errorMessages = computed(() => {
  if (props.modelValue) {
    const errors = [...props.modelValue.$errors];

    return errors.map(error => {
      return error.$message || ValidationTexts[error.$validator];
    });
  }
  return [];
});
</script>
