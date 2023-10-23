<template>
  <v-text-field
    id="agm-location"
    ref="textAreaRef"
    filled
    :label="textFieldlabel"
    :rules="rules"
    :value="locationValue"
    @input="emitInput($event)"
  />
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class AgmLocation extends Vue {
  // Refs
  $refs!: {
    textAreaRef: any
  }

  /** The AGM location text field value. */
  @Prop({ default: '' }) readonly locationValue!: string

  /** The AGM location text field label. */
  @Prop({ default: 'AGM Location' }) readonly textFieldlabel!: string

  /** The AGM location text field rules. */
  @Prop({ default: () => [] }) readonly rules!: any[]

  /** Prompt the validations. Used for global validations. */
  @Prop({ default: false }) readonly validateForm!: boolean

  agmLocation = ''

  /** Called when component is created. */
  created (): void {
    // inform parent of initial validity
    this.emitValid(this.locationValue)
  }

  /** Validate the AGM location text field */
  @Watch('validateForm')
  validateAgmLocation (): void {
    if (this.validateForm && !this.agmLocation) {
      this.$refs.textAreaRef.validate()
      this.$refs.textAreaRef.error = true
    }
  }

  /** Emits an event with the changed input (ie, updated v-model). */
  @Emit('update:agmLocation')
  emitInput (val: string): void {
    this.emitValid(val)
    this.$refs.textAreaRef.error = false
  }

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  emitValid (val: string): boolean {
    // component is valid if every rule is valid
    return this.rules.every(rule => rule(val) === true)
  }
}
</script>
