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

  /** The extension expiry date text. */
  extensionExpiryDateText = ''

  /** The intended date this AGM will be held date text. */
  intendedAgmDateText = ''

  /** The previous AGM date (reference date) date text. */
  previousAgmDateText = ''

  isEligible = false // whether the extension can be granted.

  @Emit('update:data')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitData (data: AgmExtEvalIF): void {}

  get extensionRequestValid (): boolean {
    return false // *** TODO: implement this
  }

  /** The array of validations rule(s) for the AGM Date text field. */
  get dateRules (): Array<(v) => boolean | string> {
    return [
      v => !!v || 'A date is required.'
    ]
  }

  get agmYear (): string {
    return this.data.agmYear
  }

  set agmYear (value: string) {
    this.data.agmYear = value
    const data = { ...this.data, agmYear: value }
    this.emitData(data)
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

.col-12 {
  font-size: $px-16;
}

.agm-year-textfield {
  max-width: 50%;
}
</style>
