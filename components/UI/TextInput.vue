<script setup>
import { ref } from 'vue';
import { InputBase } from "~/components/UI/index.js";

const props = defineProps({
  modelValue: String,
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    required: false,
    default: null,
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

const emit = defineEmits(['update:modelValue']);

const input = ref(null);

const handleInput = (event) => {
  const newValue = event.target.value;
  emit('update:modelValue', newValue);

  if (props.validationObject) {
    props.validationObject.$touch();
  }
};
</script>

<template>
  <InputBase v-bind="props" :modelValue="modelValue" :disabled="disabled" :errorText="errorText" :validationObject="validationObject">
    <input
        ref="input"
        :placeholder="placeholder"
        :value="modelValue"
        :type="type"
        class="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black transition duration-300"
        @input="handleInput"
    />
  </InputBase>
</template>
