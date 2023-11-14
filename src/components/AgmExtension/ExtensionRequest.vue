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
        :class="{ 'invalid-section': !firstSectionValid && showErrors }"
      >
        <v-row
          v-if="!is30MonthsAfterIncorp"
          no-gutters
        >
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
                class="pt-2"
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
              v-model="data.agmYear"
              label="AGM year"
              :rules="agmYearRules"
              :disableEdit="isFirstAgm"
              @valid="agmYearValid=$event"
            />
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div
        class="px-6 py-7"
        :class="{ 'invalid-section': !secondSectionValid && showErrors }"
      >
        <v-expand-transition>
          <v-row
            v-if="!isFirstAgm"
            no-gutters
          >
            <v-col
              cols="12"
              sm="3"
              class="pr-4"
            >
              <strong>Most recent annual reference date or AGM date</strong>
            </v-col>
            <v-col
              cols="12"
              sm="9"
            >
              <DatePicker
                class="pt-2"
                title="Previous AGM date or a reference date"
                nudge-right="40"
                :minDate="incorporationDateText"
                :maxDate="data.currentDate"
                :inputRules="dateRules"
                @emitDate="data.prevAgmDate = $event"
                @emitCancel="data.prevAgmDate = ''"
              />
            </v-col>
          </v-row>
        </v-expand-transition>
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
            class="pr-4"
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
              class="mt-0 pt-0"
            >
              <v-radio
                label="Yes - Specify the date the extension expires"
                :value="true"
              />
              <v-expand-transition>
                <DatePicker
                  v-if="data.isPrevExtension"
                  class="pt-2 pl-8"
                  title="Date of extension expiry"
                  nudge-right="40"
                  :disablePicker="!data.isPrevExtension"
                  :showCurrent="prevExpiryDateMin"
                  :minDate="prevExpiryDateMin"
                  :maxDate="prevExpiryDateMax"
                  :inputRules="dateRules"
                  @emitDate="data.prevExpiryDate = $event"
                  @emitCancel="data.prevExpiryDate = ''"
                />
              </v-expand-transition>
              <v-radio
                label="No - this is the first extension request for this AGM"
                class="pt-2"
                :value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div
        class="px-6 py-7"
        :class="{ 'invalid-section': !thirdSectionValid && showErrors }"
      >
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
            class="pr-4"
          >
            <strong>Intended date this AGM will be held</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <DatePicker
              class="pt-2"
              title="Intended date this AGM will be held"
              nudge-right="40"
              :minDate="data.currentDate"
              :inputRules="dateRules"
              @emitDate="data.intendedAgmDate = $event"
              @emitCancel="data.intendedAgmDate = ''"
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

  /** Variables for validation rules. */
  isValid = false
  agmYearValid = false

  get firstSectionValid (): boolean {
    return this.data.isFirstAgm != null && this.agmYearValid
  }

  get secondSectionValid (): boolean {
    const isPrevExtensionValid = (
      (this.data.isPrevExtension && !!this.data.prevExpiryDate) ||
      (this.data.isPrevExtension === false)
    )

    if (this.isFirstAgm) {
      return isPrevExtensionValid
    } else {
      return this.data.prevAgmDate && isPrevExtensionValid
    }
  }

  get thirdSectionValid (): boolean {
    return !!this.data.intendedAgmDate
  }

  /** The array of validations rule(s) for the AGM Year text field. */
  get agmYearRules (): Array<(v) => boolean | string> {
    return [
      v => !!v || 'A year is required.',
      v => (!!v && v.length === 4) || 'Please enter a valid year.',
      v => parseInt(v) >= this.data.incorporationDate?.getFullYear() ||
        'Year cannot be before incorporation date.',
      v => !DateUtilities.isDateFuture(v) || 'Year cannot be in the future.'
    ]
  }

  /** The array of validations rule(s) for the  date fields. */
  get dateRules (): Array<(v) => boolean | string> {
    return [
      v => !!v || 'A date is required.'
    ]
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

  /** Hide isFirstAgm question if IncorporationDate >= 30 months ago */
  get is30MonthsAfterIncorp (): boolean {
    if (
      DateUtilities.subtractDates(
        DateUtilities.dateToYyyyMmDd(this.data.incorporationDate),
        this.data.currentDate
      ) >= 30
    ) {
      this.data.isFirstAgm = false
      return true
    } else {
      return false
    }
  }

  /** Extension expiry maximum date allowed */
  get prevExpiryDateMax (): string {
    if (this.isFirstAgm) {
      // For first AGM, max shouldn't be later than Incorporation date + 18 months + 12 months
      return DateUtilities.addMonthsToDate(30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      // For subsequent AGMs, max shouldn't be later than reference date + 15 months + 12 months
      return DateUtilities.addMonthsToDate(27, this.data.prevAgmDate)
    }
  }

  /** Extension expiry minimum date allowed */
  get prevExpiryDateMin (): string {
    if (this.isFirstAgm) {
      // For first AGM, min shouldn't be later than Incorporation date + 18 months
      return DateUtilities.addMonthsToDate(18, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      // For subsequent AGMs, min shouldn't be later than reference date + 15 months
      return DateUtilities.addMonthsToDate(15, this.data.prevAgmDate)
    }
  }

  /** Incorporation date as text. */
  get incorporationDateText (): string {
    return DateUtilities.dateToYyyyMmDd(
      this.data?.incorporationDate
    )
  }

  /** Called when isFirstAgm radio group changes. */
  @Watch('data.isFirstAgm')
  onIsFirstAgmChanged (val: boolean): void {
    if (val) {
      this.data.agmYear = this.data.incorporationDate.getFullYear().toString()
      this.data.prevAgmDate = null
    } else {
      this.data.agmYear = ''
    }
  }

  /** Called when isPrevExtension radio group changes. */
  @Watch('data.isPrevExtension')
  onIsPrevExtensionChanged (val: boolean): void {
    if (!val) {
      this.data.prevExpiryDate = null
    }
  }

  /** Watches all data properties to keep track of changes. */
  @Watch('data.isFirstAgm')
  @Watch('data.prevAgmDate')
  @Watch('data.isPrevExtension')
  @Watch('data.prevExpiryDate')
  @Watch('data.intendedAgmDate')
  @Watch('data.currentDate')
  @Watch('agmYearValid')
  private onHaveChanges (): void {
    this.checkEligibility()
    this.checkValidity()
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
      this.data.agmDueDate = DateUtilities.addMonthsToDate(
        this.data.extensionDuration,
        cutOffYyyyMmDd
      )
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
      // Shouldn't get here
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
      this.data.agmDueDate = DateUtilities.addMonthsToDate(
        this.data.extensionDuration,
        this.data.prevExpiryDate
      )
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
      this.data.agmDueDate = DateUtilities.addMonthsToDate(
        this.data.extensionDuration,
        cutOffYyyyMmDd
      )
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
      this.data.agmDueDate = DateUtilities.addMonthsToDate(
        this.data.extensionDuration,
        this.data.prevExpiryDate
      )
    }
  }

  /** Checks eligibility for agm request */
  checkEligibility (): void {
    this.data.isEligible = false
    this.data.extensionDuration = null
    this.data.agmDueDate = null
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
  }
  /* eslint-enable brace-style */

  /** Whether the extension request is valid or not */
  checkValidity (): void {
    this.isValid = (
      this.firstSectionValid &&
      this.secondSectionValid &&
      this.thirdSectionValid
    )

    this.emitValid()
  }

  /** Emits an event of the updated data object. */
  @Emit('update:data')
  private emitData (): AgmExtEvalIF {
    return this.data
  }

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  private emitValid (): boolean {
    return this.isValid
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
    } else {
      this.data.agmYear = ''
    }
  }

  /** Called when extension date picker changes. */
  @Watch('extensionExpiryDateText')
  onExtensionDatePickerChanged (val: string): void {
    this.data.prevExpiryDate = val
  }

  /** Called when intended AGM date picker changes. */
  @Watch('intendedAgmDateText')
  onAgmIntendedDatePickerChanged (val: string): void {
    this.data.intendedAgmDate = val
  }

  /** Called when previous AGM date picker changes. */
  @Watch('previousAgmDateText')
  onPreviousAgmDatePickerChanged (val: string): void {
    this.data.prevAgmDate = val
  }

  @Watch('data.currentDate')
  @Watch('data.isPrevExtension')
  @Watch('previousAgmDateText')
  @Watch('extensionExpiryDateText')
  onIsPrevExtensionChanged (): void {
    /* eslint-disable brace-style */
    const currentDate = DateUtilities.yyyyMmDdToDate(this.data.currentDate)
    this.data.isEligible = null
    this.data.extensionDuration = null

    // IF first AGM extension
    // AND NOT extension requested this year
    if (
      this.isFirstAgm &&
      !this.data.isPrevExtension &&
      this.data.incorporationDate
    ) {
      // cutOffDate: the date where eligibility will be false if passed in a particular rule.
      const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
        18, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
      const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)

      // IF CurrentDate > (IncorporationDate + 18 Months + 5 days)
      // THEN NOT ELIGIBLE
      if ((DateUtilities.daysBetweenTwoDates(cutOffDate, currentDate) - 5) > 0) {
        this.data.isEligible = false
      }
      // ELSE ELIGIBLE, ExtensionDuration = 6 months
      else {
        this.data.isEligible = true
        this.data.extensionDuration = 6
      }
    }

    // ELSE IF first AGM extension
    // AND extension requested this year
    else if (
      this.isFirstAgm &&
      this.data.isPrevExtension &&
      this.extensionExpiryDateText &&
      this.data.incorporationDate
    ) {
      const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
        30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
      const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)
      const expiryDate = DateUtilities.yyyyMmDdToDate(this.extensionExpiryDateText)

      // IF ExpirationDate >= (IncorporationDate + 18 months + 12 months)
      // THEN NOT ELIGIBLE
      if ((DateUtilities.daysBetweenTwoDates(cutOffDate, expiryDate)) >= 0) {
        this.data.isEligible = false
      }
      // ELSE IF CurrentDate > (ExpirationDate + 5 days)
      // THEN NOT ELIGIBLE
      else if ((DateUtilities.daysBetweenTwoDates(expiryDate, currentDate)) > 5) {
        this.data.isEligible = false
      }
      // ELSE ELIGIBLE, ExtensionDuration = MIN(6, 12 - totalExtensionApproved)
      else {
        this.data.isEligible = true
        // totalExtensionApproved: (ExpirationDate - 18 months - IncorporationDate) in months
        const totalExtensionApproved = DateUtilities.subtractDates(
          DateUtilities.dateToYyyyMmDd(this.data.incorporationDate), this.extensionExpiryDateText) - 18
        this.data.extensionDuration = Math.min(6, (12 - totalExtensionApproved))
      }
    }

    // ELSE IF NOT first agm extension
    // AND NOT extension requested this year
    else if (
      !this.isFirstAgm &&
      !this.data.isPrevExtension &&
      this.previousAgmDateText
    ) {
      const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
        15, this.previousAgmDateText)
      const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)

      // IF CurrentDate > (PrevAgmDate + 15 Months + 5 days)
      // THEN NOT ELIGIBLE
      if ((DateUtilities.daysBetweenTwoDates(cutOffDate, currentDate) - 5) > 0) {
        this.data.isEligible = false
      }
      // ELSE ELIGIBLE, ExtensionDuration = 6 months
      else {
        this.data.isEligible = true
        this.data.extensionDuration = 6
      }
    }

    // ELSE IF NOT first agm extension
    // AND extension requested this year
    else if (
      !this.isFirstAgm &&
      this.data.isPrevExtension &&
      this.previousAgmDateText &&
      this.extensionExpiryDateText
    ) {
      const cutOffDate = DateUtilities.yyyyMmDdToDate(this.previousAgmDateText)
      const expiryDate = DateUtilities.yyyyMmDdToDate(this.extensionExpiryDateText)

      // IF CurrentDate > (ExpirationDate + 5 days)
      // THEN NOT ELIGIBLE
      if ((DateUtilities.daysBetweenTwoDates(expiryDate, currentDate)) > 5) {
        this.data.isEligible = false
      }
      // ELSE IF (ExpirationDate - PrevAgmDate) > 12 months
      // THEN NOT ELIGIBLE
      else if ((DateUtilities.daysBetweenTwoDates(cutOffDate, expiryDate)) > 365) {
        this.data.isEligible = false
      }
      // ELSE ELIGIBLE, ExtensionDuration = 12 months - ExpiryDate - PrevAgmDate
      else {
        this.data.isEligible = true
        this.data.extensionDuration = 12 - DateUtilities.subtractDates(
          this.previousAgmDateText,
          this.extensionExpiryDateText
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.agm-year-textfield {
  max-width: 50%;
}
</style>
