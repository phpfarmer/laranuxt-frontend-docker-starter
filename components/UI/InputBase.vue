<script setup>
import {onMounted, ref} from 'vue';

const props = defineProps({
  modelValue: String,
  validationObject: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const input = ref(null);

onMounted(() => {
  if (input.value.hasAttribute('autofocus')) {
    input.value.focus();
  }
});

defineExpose({focus: () => input.value.focus()});

const validationErrors = computed(() => {
  return props.validationObject?.errors || [];
});

const hasValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined && String(props.modelValue).trim().length > 0;
});

const hasError = computed(() => {
  return !!props.validationObject?.errors || (!!props.error && props.error.trim().length > 0);
});
</script>

<template>
  <div class="border-0 p-0">
    <input
        ref="input"
        :value="modelValue"
        class="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
        @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="validationObject && validationObject.errors" class="text-red-500 text-sm mt-1">
      <ul>
        <li v-for="(error, index) in validationObject.errors" :key="index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>
