<template>
  <div class="border-0 p-0 input-wrapper" :class="{ 'is-disabled': disabled, 'has-error': hasError }">
    <div class="w-full">
      <slot name="default" />
    </div>

    <!-- Display static errorText when it exists -->
    <div v-if="errorText" class="text-sm text-red-600" v-text="errorText" />

    <!-- Display validation errors using ErrorMessage component when validationObject exists -->
    <ErrorMessage v-if="validationObject" class="text-error-wrap" v-bind:modelValue="validationObject" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ErrorMessage from "./ErrorMessage.vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  errorText: {
    type: String,
    required: false,
    default: null,
  },
  validationObject: {
    type: Object,
    required: false,
    default: null,
  },
});

const hasError = computed(() => {
  return (!!props.errorText && props.errorText.trim().length > 0) || !!props.validationObject?.$error;
});
</script>
