<template>
  <v-card flat id="detail-comment-container">
    <v-textarea
      ref="textarea"
      outlined
      auto-grow
      rows="5"
      id="detail-comment-textarea"
      :counter="maxLength"
      :rules="rules"
      :value="value"
      :placeholder="placeholder"
      :autofocus="autofocus"
      @input="emitInput($event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import _ from 'lodash'
import { computed, ref, watch, defineEmits } from 'vue'

const textarea = ref('') // This may not work with vuetify

const props = defineProps({
  /** Comment (v-model) passed into this component (required). */
  value: { type: string, default: '' },
  /** Placeholder passed into this component (optional). */
  placeholder: { type: string, default: '' },
  /** Max Length passed into this component (optional). */
  maxLength: { type: number, default: 4096 },
  /** Autofocus passed into this component (optional). */
  autofocus: { type: boolean, default: false }
})

const emits = defineEmits<{
  (e: 'input', value: string)
  (e: 'valid', value: boolean)
}>

/** Array of validations rules for the textarea. */
const rules = computed((): Array<(val) => boolean | string> => {
  // include whitespace in maximum length check
  return [
    val => (val && val.trim().length > 0) || 'Detail is required.',
    val => (val && val.length <= this.maxLength) || 'Maximum characters exceeded.'
  ]
})

watch(props.value, () => onValueChanged)

/** Public method to reset Vuetify validation on textarea. */
function resetValidation (): void {
  (textarea as any).resetValidation()
}

/**
 * Called when prop changes (ie, v-model is updated by parent).
 * This method is debounced to prevent excessive validation.
 */
const onValueChanged = _.debounce(async (val: string): void => {
  await emitValid(val)
}, 300)

function emitInput (val: string): void {}

/** Indicates whether or not this component is valid. */
function emitValid (val: string): boolean {
  // component is valid if every rule is valid
  return rules.every(rule => rule(val) === true)
}

emitValid(props.value)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#detail-comment-container {
  line-height: 1.2rem;
  font-size: $px-14;
}
</style>
