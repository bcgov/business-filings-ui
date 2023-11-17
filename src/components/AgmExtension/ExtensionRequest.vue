<template>
  <VcardTemplate id="extension-request">
    <template #icon>
      mdi-calendar-range
    </template>

    <template #title>
      Extension Request
    </template>

    <template #content>
      <div
        class="px-6 py-7"
        :class="{ 'invalid-section': !extensionRequestValid && showErrors }"
      >
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Is this the first AGM?</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <v-radio-group
              id="first-agm-radio-group"
              v-model="data.isFirstAgm"
              class="mt-0 pt-0"
            >
              <v-radio
                label="Yes"
                :value="true"
              />
              <v-radio
                label="No - Specify AGM Year below"
                :value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>AGM Year</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <AgmYear
              v-model="agmYear"
              label="AGM year"
              :disableEdit="isFirstAgm"
              @valid="agmYearValid=$event"
            />
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div
        class="px-6 py-7"
        :class="{ 'invalid-section': !extensionRequestValid && showErrors }"
      >
        <v-expand-transition>
          <v-row
            v-if="!isFirstAgm"
            no-gutters
          >
            <v-col
              cols="12"
              sm="3"
            >
              <strong>Previous AGM date or a reference date</strong>
            </v-col>
            <v-col
              cols="12"
              sm="9"
            >
              <DatePicker
                class="pt-2 pl-4"
                title="Previous AGM date or a reference date"
                nudge-right="40"
                :inputRules="dateRules"
                @emitDate="previousAgmDateText = $event"
                @emitCancel="previousAgmDateText = ''"
              />
            </v-col>
          </v-row>
        </v-expand-transition>
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Has an extension been requested for this AGM year already?</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <v-radio-group
              id="prev-extension-radio-group"
              v-model="data.isPrevExtension"
              class="mt-0 pt-0 pl-5"
            >
              <v-radio
                label="Yes - Specify the date the extension expires"
                :value="true"
              />
              <DatePicker
                class="pt-2 pl-8"
                title="Date of extension expiry"
                nudge-right="40"
                :inputRules="dateRules"
                :disablePicker="!data.isPrevExtension"
                :minDate="extensionExpiryMin"
                :maxDate="extensionExpiryMax"
                @emitDate="extensionExpiryDateText = $event"
                @emitCancel="extensionExpiryDateText = ''"
              />
              <v-radio
                label="No - this is the first extension request for this AGM"
                :value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div
        class="px-6 py-7"
        :class="{ 'invalid-section': !extensionRequestValid && showErrors }"
      >
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Intended date this AGM will be held</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <DatePicker
              class="pt-2 pl-4"
              title="Intended date this AGM will be held"
              nudge-right="40"
              :inputRules="dateRules"
              @emitDate="intendedAgmDateText = $event"
              @emitCancel="intendedAgmDateText = ''"
            />
          </v-col>
        </v-row>
      </div>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { VcardTemplate } from '@/components/common'
import { AgmExtEvalIF } from '@/interfaces'
import { DatePicker } from '@bcrs-shared-components/date-picker'
import AgmYear from '@/components/AgmLocationChange/AgmYear.vue'
import { DateUtilities } from '@/services'

@Component({
  components: {
    AgmYear,
    DatePicker,
    VcardTemplate
  }
})
export default class ExtensionRequest extends Vue {
  @Prop({ required: true }) readonly data!: AgmExtEvalIF
  @Prop({ default: false }) readonly showErrors!: boolean

  /** The component DatePicker date texts. */
  extensionExpiryDateText = ''
  intendedAgmDateText = ''
  previousAgmDateText = ''

  /** Whether the extension can be granted. */
  isEligible = false

  /** Whether AGM year field is valid. */
  agmYearValid = false

  /** The array of validations rule(s) for the AGM Date text field. */
  get dateRules (): Array<(v) => boolean | string> {
    return [
      v => !!v || 'A date is required.'
    ]
  }

  /** Whether the extension request is valid or not */
  get extensionRequestValid (): boolean {
    const isFirstAgmValid = this.isFirstAgm && !!this.data.agmYear
    const isSubsequentAgmValid = (
      this.isFirstAgm === false &&
      !!this.data.agmYear &&
      !!this.data.prevAgmDate
    )
    const isPrevExtensionValid = (
      this.data.isPrevExtension &&
      !!this.data.prevExpiryDate
    )
    const isNotPrevExtensionValid = this.data.isPrevExtension === false

    return (
      (isFirstAgmValid || isSubsequentAgmValid) &&
      (isPrevExtensionValid || isNotPrevExtensionValid) &&
      this.agmYearValid &&
      !!this.data.intendedAgmDate
    )
  }

  get agmYear (): string {
    return this.data.agmYear
  }

  set agmYear (value: string) {
    this.data.agmYear = value
    this.emitData()
    this.emitValid()
  }

  get extensionExpiryMax (): string {
    if (this.isFirstAgm) {
      // For first AGM, max shouldn't be later than Incorporation date + 18 months + 12 months
      return DateUtilities.addMonthsToDate(30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      // For subsequent AGMs, max shouldn't be later than reference date + 15 months + 12 months
      return DateUtilities.addMonthsToDate(27, this.data.prevAgmDate)
    }
  }

  get extensionExpiryMin (): string {
    if (this.isFirstAgm) {
      // For first AGM, min shouldn't be later than Incorporation date + 18 months + 1 month
      return DateUtilities.addMonthsToDate(19, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      // For subsequent AGMs, min shouldn't be later than reference date + 15 months + 1 month
      return DateUtilities.addMonthsToDate(16, this.data.prevAgmDate)
    }
  }

  /** Whether to disable the editing of AGM Year field. */
  get isFirstAgm (): boolean {
    // Field disabled on first load when value is null
    if (this.data.isFirstAgm == null) {
      return true
    }

    // Field disabled when it is first agm
    return this.data.isFirstAgm
  }

  /** Called when isFirstAgm radio group changes. */
  @Watch('data.isFirstAgm')
  onIsFirstAgmChanged (val: boolean): void {
    if (val) {
      this.data.agmYear = this.data.incorporationDate.getFullYear().toString()
      this.previousAgmDateText = ''
      this.data.prevAgmDate = null
    } else {
      this.data.agmYear = ''
    }
    this.checkEligibility()
  }

  /** Called when isPrevExtension radio group changes. */
  @Watch('data.isPrevExtension')
  onIsPrevExtensionChanged (): void {
    if (!this.data.isPrevExtension) {
      this.extensionExpiryDateText = ''
      this.data.prevExpiryDate = null
    }
    this.checkEligibility()
  }

  /** Called when extension date picker changes. */
  @Watch('extensionExpiryDateText')
  onExtensionDatePickerChanged (val: string): void {
    this.data.prevExpiryDate = val
    this.checkEligibility()
  }

  /** Called when previous AGM date picker changes. */
  @Watch('previousAgmDateText')
  onPreviousAgmDatePickerChanged (val: string): void {
    this.data.prevAgmDate = val
    this.checkEligibility()
  }

  /** Called when intended AGM date picker changes. */
  @Watch('intendedAgmDateText')
  onAgmIntendedDatePickerChanged (val: string): void {
    this.data.intendedAgmDate = val
    this.checkEligibility()
  }

  /** Called when current date changes. */
  @Watch('data.currentDate')
  onCurrentDateChanged (): void {
    this.checkEligibility()
  }

  /** Eligibility for first agm with no extension requested this year */
  /* eslint-disable brace-style */
  handleFirstAgmNotPrevExtension (): void {
    const currentDate = DateUtilities.yyyyMmDdToDate(this.data.currentDate)
    const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
      18, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)

    // IF CurrentDate > (IncorporationDate + 18 Months + 5 days)
    if ((DateUtilities.daysBetweenTwoDates(cutOffDate, currentDate) - 5) > 0) {
      this.data.isEligible = false
      this.data.requestExpired = true
    }
    // ELSE ExtensionDuration = 6 months
    else {
      this.data.isEligible = true
      this.data.extensionDuration = 6
    }
  }

  /** Eligibility for first agm with extension requested this year */
  handleFirstAgmAndPrevExtension (): void {
    const currentDate = DateUtilities.yyyyMmDdToDate(this.data.currentDate)
    const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
      30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)
    const expiryDate = DateUtilities.yyyyMmDdToDate(this.data.prevExpiryDate)

    // IF ExpirationDate >= (IncorporationDate + 18 months + 12 months)
    if ((DateUtilities.daysBetweenTwoDates(cutOffDate, expiryDate)) >= 0) {
      this.data.isEligible = false
      this.data.alreadyExtended = true
    }
    // ELSE IF CurrentDate > (ExpirationDate + 5 days)
    else if ((DateUtilities.daysBetweenTwoDates(expiryDate, currentDate)) > 5) {
      this.data.isEligible = false
      this.data.requestExpired = true
    }
    // ELSE ELIGIBLE, ExtensionDuration = MIN(6, 12 - totalExtensionApproved)
    else {
      this.data.isEligible = true
      // totalExtensionApproved: (ExpirationDate - 18 months - IncorporationDate) in months
      const totalExtensionApproved = DateUtilities.subtractDates(
        DateUtilities.dateToYyyyMmDd(this.data.incorporationDate), this.data.prevExpiryDate) - 18
      this.data.extensionDuration = Math.min(6, (12 - totalExtensionApproved))
    }
  }

  /** Eligibility for subsequent agm with no extension requested this year */
  handleNotFirstAgmNotPrevExtension (): void {
    const currentDate = DateUtilities.yyyyMmDdToDate(this.data.currentDate)
    const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
      15, this.data.prevAgmDate)
    const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)

    // IF CurrentDate > (PrevAgmDate + 15 Months + 5 days)
    if ((DateUtilities.daysBetweenTwoDates(cutOffDate, currentDate) - 5) > 0) {
      this.data.isEligible = false
      this.data.requestExpired = true
    }
    // ELSE ExtensionDuration = 6 months
    else {
      this.data.isEligible = true
      this.data.extensionDuration = 6
    }
  }

  /** Eligibility for subsequent agm with extension requested this year */
  handleNotFirstAgmAndPrevExtension (): void {
    const currentDate = DateUtilities.yyyyMmDdToDate(this.data.currentDate)
    const cutOffDate = DateUtilities.yyyyMmDdToDate(this.data.prevAgmDate)
    const expiryDate = DateUtilities.yyyyMmDdToDate(this.data.prevExpiryDate)

    // IF CurrentDate > (ExpirationDate + 5 days)
    if ((DateUtilities.daysBetweenTwoDates(expiryDate, currentDate)) > 5) {
      this.data.isEligible = false
      this.data.requestExpired = true
    }
    // ELSE IF (ExpirationDate - PrevAgmDate) > 12 months
    else if ((DateUtilities.daysBetweenTwoDates(cutOffDate, expiryDate)) > 365) {
      this.data.isEligible = false
      this.data.alreadyExtended = true
    }
    // ELSE ExtensionDuration = 12 months - ExpiryDate - PrevAgmDate
    else {
      this.data.isEligible = true
      this.data.extensionDuration = 12 - DateUtilities.subtractDates(
        this.data.prevAgmDate,
        this.data.prevExpiryDate
      )
    }
  }

  /** Checks eligibility for agm request */
  checkEligibility (): void {
    this.data.isEligible = false
    this.data.extensionDuration = null
    this.data.alreadyExtended = false
    this.data.requestExpired = false

    // IF first AGM extension
    // AND NOT extension requested this year
    if (
      this.isFirstAgm &&
      this.data.isPrevExtension === false &&
      this.data.incorporationDate
    ) {
      this.handleFirstAgmNotPrevExtension()
    }

    // ELSE IF first AGM extension
    // AND extension requested this year
    else if (
      this.isFirstAgm &&
      this.data.isPrevExtension &&
      this.data.prevExpiryDate &&
      this.data.incorporationDate
    ) {
      this.handleFirstAgmAndPrevExtension()
    }

    // ELSE IF NOT first agm extension
    // AND NOT extension requested this year
    else if (
      this.isFirstAgm === false &&
      this.data.isPrevExtension === false &&
      this.data.prevAgmDate
    ) {
      this.handleNotFirstAgmNotPrevExtension()
    }

    // ELSE IF NOT first agm extension
    // AND extension requested this year
    else if (
      this.isFirstAgm === false &&
      this.data.isPrevExtension &&
      this.data.prevAgmDate &&
      this.data.prevExpiryDate
    ) {
      this.handleNotFirstAgmAndPrevExtension()
    }

    this.emitData()
    this.emitValid()
  }

  @Emit('update:data')
  private emitData (): AgmExtEvalIF {
    return this.data
  }

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  private emitValid (): boolean {
    return this.extensionRequestValid
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.col-12 {
  font-size: $px-16;
}

.agm-year-textfield {
  max-width: 50%;
}
</style>
