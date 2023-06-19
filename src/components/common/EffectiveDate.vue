<template>
  <v-card
    id="effective-date"
    flat
  >
    <v-row>
      <v-col
        cols="12"
        sm="3"
      >
        <label class="title-label">Effective Date of Continuation Out</label>
      </v-col>
      <v-col
        cols="12"
        sm="9"
      >
        <v-menu
          ref="menu"
          v-model="menu"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="18rem"
        >
          <template #activator="{ on }">
            <v-text-field
              id="date-text-field"
              ref="textarea"
              v-model="dateFormatted"
              :rules="effectiveDateRules"
              label="Date of Continuation Out"
              hint="YYYY/MM/DD"
              append-icon="mdi-calendar"
              filled
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="date"
            :max="maxDate"
            no-title
            @input="menu=true"
          />
        </v-menu>

        <div
          v-if="$v.dateFormatted.isNotNull"
          class="validationErrorInfo"
        >
          <span v-if="!$v.dateFormatted.isValidFormat">
            Date must be in format YYYY/MM/DD.
          </span>
          <span v-else-if="!$v.dateFormatted.isValidEffectiveDate">
            Please enter a day before {{ formatDate(maxDate, false) }}.
          </span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Watch } from 'vue-property-decorator'
import { isNotNull, isValidFormat, isValidEffectiveDate } from '@/validators'
import { Getter } from 'pinia-class'
import { DateMixin } from '@/mixins'
import { useRootStore } from '@/stores'

@Component({
  validations: {
    dateFormatted: { isNotNull, isValidFormat, isValidEffectiveDate }
  }
})
export default class EffectiveDate extends Mixins(DateMixin) {
  // Refs
  $refs!: {
    textarea: any
  }

  // Prop passed into this component.
  @Prop({ default: '' }) readonly initialEffectiveDate!: string

  /** Prompt the validations. Used for global validations. */
  @Prop({ default: false }) readonly validateForm!: boolean

  @Getter(useRootStore) getCurrentDate!: string

  // Local properties.
  date = '' // bound to date picker
  dateFormatted = '' // bound to text field
  menu = false // bound to calendar menu

  /** The array of validations rules for the Effective Date text field. */
  get effectiveDateRules (): Array<(v) => boolean | string> {
    return [
      v => isNotNull(v) || 'A Date of Continuation Out is required.'
    ]
  }

  /** The maximum date that can be entered. */
  get maxDate (): string {
    return this.getCurrentDate
  }

  /** Called when component is mounted. */
  mounted (): void {
    // load initial data
    this.dateFormatted = this.formatDate(this.initialEffectiveDate)
  }

  /**
   * Local helper to change date from YYYY-MM-DD to YYYY/MM/DD.
   * @returns The formatted date.
   */
  formatDate (date: string, validate = true): string {
    if (validate && !this.isValidDate(date, '-')) return ''
    const [year, month, day] = date.split('-')
    return `${year}/${month}/${day}`
  }

  /**
   * Local helper to change date from YYYY/MM/DD to YYYY-MM-DD.
   * @returns The parsed date.
   */
  parseDate (date: string): string {
    // changes date from YYYY/MM/DD to YYYY-MM-DD
    if (!this.isValidDate(date, '/')) return ''
    const [year, month, day] = date.split('/')
    return `${year}-${month}-${day}`
  }

  /**
   * Local helper to determine if passed-in date is valid.
   * @returns True if date is valid, otherwise false.
   */
  isValidDate (date, separator): boolean {
    return (isNotNull.call(this, date) &&
      isValidFormat.call(this, date, separator) &&
      isValidEffectiveDate.call(this, date, separator))
  }

  /**
   * When prop changes, load (initial) data.
   */
  @Watch('initialEffectiveDate')
  onInitialEffectiveDateChanged (val: string): void {
    if (val) {
      this.dateFormatted = this.formatDate(val)
    }
  }

  /**
   * When text field changes, update date picker.
   */
  @Watch('dateFormatted')
  onDateFormattedChanged (val: string): void {
    this.date = this.parseDate(val)
  }

  /**
   * When date picker changes, update text field etc.
   */
  @Watch('date')
  onDateChanged (val: string): void {
    const effectiveDate = this.isValidDate(val, '-') ? val : null
    // only update text field if date is valid
    // this is to retain previous invalid values
    if (effectiveDate) {
      this.dateFormatted = this.formatDate(val)
    }
    this.emitEffectiveDate(effectiveDate)
    this.emitValid(Boolean(effectiveDate))
  }

  /** Validate date text field */
  @Watch('validateForm')
  validateDateField (): void {
    if (this.validateForm && !this.dateFormatted) {
      this.$refs.textarea.validate()
      this.$refs.textarea.error = true
    }
  }

  /**
   * Emits an event with the new value of Effective Date.
   */
  @Emit('update:effectiveDate')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitEffectiveDate (val: string): void { /* no empty function */ }

  /**
   * Emits an event indicating whether or not this component is valid.
   */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitValid (val: boolean): void { /* no empty function */ }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
.title-label {
  color: $gray9;
  font-weight: bold;
}

.validationErrorInfo {
  color: $app-red;
}
</style>
