<template>
  <v-card
    id="detail-comment-container"
    flat
  >
    <v-textarea
      id="detail-comment-textarea"
      ref="textarea"
      auto-grow
      rows="5"
      persistent-hint
      :counter="maxLength"
      :rules="rules"
      :value="value"
      :label="placeholder"
      :autofocus="autofocus"
      @input="emitInput($event)"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class DetailComment extends Vue {
  // Refs
  $refs!: {
    textarea: any
  }

  /** Array of validations rules for the textarea. */
  get rules (): Array<(val) => boolean | string> {
    // include whitespace in maximum length check
    return [
      val => (val && val.trim().length > 0) || 'Detail is required.',
      val => (val && val.length <= this.maxLength) || 'Maximum characters exceeded.'
    ]
  }

  /** Public method to reset Vuetify validation on textarea. */
  resetValidation (): void {
    (this.$refs.textarea as any).resetValidation()
  }

  /** Comment (v-model) passed into this component (required). */
  @Prop({ default: '' }) readonly value!: string

  /** Placeholder passed into this component (optional). */
  @Prop({ default: '' }) readonly placeholder!: string

  /** Max Length passed into this component (optional). */
  @Prop({ default: 4096 }) readonly maxLength!: number

  /** Autofocus passed into this component (optional). */
  @Prop({ default: false }) readonly autofocus!: boolean

  /** Prompt the validations. Used for global validations. */
  @Prop({ default: false }) readonly validateForm!: boolean

  detailedComment = ''

  /** Called when component is created. */
  created (): void {
    // inform parent of initial validity
    this.emitValid(this.value)
  }

  /**
   * Called when prop changes (ie, v-model is updated by parent).
   * This method is debounced to prevent excessive validation.
   */
  @Watch('value')
  @Debounce(300)
  onValueChanged (val: string): void {
    this.emitValid(val)
  }

  /** Validate business name field */
  @Watch('validateForm')
  validateBusinessName (): void {
    if (this.validateForm && !this.detailedComment) {
      this.$refs.textarea.validate()
      this.$refs.textarea.error = true
    }
  }

  /** Emits an event with the changed comment (ie, updated v-model). */
  @Emit('input')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitInput (val: string): void {}

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  emitValid (val: string): boolean {
    // component is valid if every rule is valid
    return this.rules.every(rule => rule(val) === true)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#detail-comment-container {
  line-height: 1.2rem;
  font-size: $px-14;

  // Setting the backgroud color of text area to stay consistent between all components.
  // Move the placeholder and input text from the edges.
  :deep() {
    .theme--light.v-input input, .theme--light.v-input textarea {
      background-color: $gray1;
      padding-top: 0.5rem;
      padding-left: 0.5rem;
    }
  }
}
</style>
