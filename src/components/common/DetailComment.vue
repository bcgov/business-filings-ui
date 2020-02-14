<template>
  <v-card flat id="detail-comment-container">
    <v-textarea
      ref="textarea"
      outlined
      auto-grow
      rows="5"
      id="detail-comment-textfield"
      :counter="MAXLENGTH"
      :rules="rules"
      :value="value"
      :label="label"
      @input="emitInput($event)"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class DetailComment extends Vue {
  private readonly MAXLENGTH = 4096

  /** Array of validations rules for the textarea. */
  private get rules (): Array<Function> {
    // exclude whitespace in minimum length check
    // include whitespace in maximum length check
    return [
      val => (val && val.trim().length > 0) || 'Detail Comment is required.',
      val => (val && val.length <= this.MAXLENGTH) || 'Maximum characters exceeded.'
    ]
  }

  /** Public method to reset Vuetify validation on textarea. */
  resetValidation (): void {
    (this.$refs.textarea as any).resetValidation()
  }

  /** Comment (v-model) passed into this component. */
  @Prop({ default: '' })
  private value: string

  /** Label passed into this component. */
  @Prop({ default: '' })
  private label: string

  /**
   * Called when prop changes (ie, v-model is updated by parent).
   * This method is debounced to prevent excessive validation.
   */
  @Watch('value')
  @Debounce(300)
  private onValueChanged (val: string): void {
    const isValidComment = this.rules.every(rule => rule(val) === true)
    this.emitValid(isValidComment)
  }

  /** Emits an event with the changed comment (ie, updated v-model). */
  @Emit('input')
  private emitInput (val: string): void { }

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  private emitValid (val: boolean): void { }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

#detail-comment-container {
  line-height: 1.2rem;
  font-size: 0.875rem;
}
</style>
