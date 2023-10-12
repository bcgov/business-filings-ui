<template>
  <v-text-field
    id="year-txt"
    ref="textarea"
    hide-spin-buttons
    type="number"
    filled
    :label="label"
    :rules="rules"
    :value="value"
    @input="emitInput($event)"
  />
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class AgmYear extends Vue {
  // Refs
  $refs!: {
    textarea: any
  }

  @Prop({ default: '' }) readonly value!: string

  @Prop({ default: 'Year' }) readonly label!: string

  @Prop({ default: () => [] }) readonly rules!: any[]

  @Prop({ default: false }) readonly validateForm!: boolean

  agmYear = null

  /** Called when component is created. */
  created (): void {
    // inform parent of initial validity
    this.emitValid(this.value)
  }

  @Watch('value')
  @Debounce(300)
  onValueChanged (val: string): void {
    this.emitValid(val)
  }

  /** Validate business name field */
  @Watch('validateForm')
  validateAgmYear (): void {
    if (this.validateForm && !this.agmYear) {
      this.$refs.textarea.validate()
      this.$refs.textarea.error = true
    }
  }

  /** Emits an event with the changed input (ie, updated v-model). */
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
