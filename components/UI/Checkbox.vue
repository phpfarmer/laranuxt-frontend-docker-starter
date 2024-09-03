<script setup>
import {computed} from 'vue';
import {InputBase} from "~/components/UI/index.js";

const emit = defineEmits(['update:checked']);

const props = defineProps({
  modelValue: {
    type: [String, Object],
    required: false,
    default: null,
  },
  label: {
    type: String,
    required: false,
    default: '',
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

const proxyChecked = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    if (props.validationObject) {
      newValue = newValue || null;
      props.validationObject.$touch();
    }

    emit('update:modelValue', newValue);
  }
});

const hasError = computed(() => {
  return (!!props.errorText && props.errorText.trim().length > 0) || !!props.validationObject?.$error;
});

const checkboxClasses = computed(() => {
  return hasError ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500';
});
</script>

<template>
  <InputBase v-bind="props" :modelValue="modelValue" :disabled="disabled" :errorText="errorText" :validationObject="validationObject">
    <input
        v-model="proxyChecked"
        :value="modelValue"
        class="w-4 h-4 rounded transition duration-300"
        :class="[checkboxClasses]"
        type="checkbox"
    />
    <slot name="label"><span class="ml-2 text-sm" :class="{ 'text-error': hasError }" v-text="label" /></slot>
  </InputBase>
</template>
