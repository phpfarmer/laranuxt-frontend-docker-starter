<template>
  <div v-if="value.$error">
    <div class="text-error text-xxs" v-for="errorMessage in errorMessages" :key="errorMessage" v-text="errorMessage" />
  </div>
</template>

<script>
import ValidationTexts from './validationTexts'

export default {
  name: 'ValidationMessage',

  props: {
    value: {
      type: Object,
      required: true,
    },
  },

  computed: {
    errorMessages() {
      return (this.value && this.value.$errors) ? this.value.$errors.map(error => {
        return (error.$message) ? error.$message : ValidationTexts[error.$validator];
      }) : [];
    }
  }
}
</script>