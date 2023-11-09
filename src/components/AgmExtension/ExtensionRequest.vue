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
            <v-menu
              v-model="previousAgmDateMenu"
              :close-on-content-click="false"
              min-width="0"
              nudge-right="50"
              transition="scale-transition"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="previousAgmDateText"
                  class="pt-2 pl-4"
                  :rules="dateRules"
                  label="Previous AGM date or a reference date"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  filled
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="datePickerPreviousAgm"
                no-title
                @input="previousAgmDateMenu=false"
                @change="onPreviousAgmDatePickerChanged($event)"
              />
            </v-menu>
          </v-col>
        </v-row>

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
              <v-menu
                v-model="extensionDateMenu"
                :close-on-content-click="false"
                min-width="0"
                nudge-right="50"
                transition="scale-transition"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="extensionExpiryDateText"
                    class="pt-2 pl-8"
                    :disabled="!data.isPrevExtension"
                    :rules="dateRules"
                    label="Date of extension expiry"
                    append-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    filled
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="datePickerExtensionExpiry"
                  no-title
                  :min="extensionExpiryMin"
                  :max="extensionExpiryMax"
                  @input="extensionDateMenu=false"
                  @change="onExtensionDatePickerChanged($event)"
                />
              </v-menu>
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
            <v-menu
              v-model="intendedAgmDateMenu"
              :close-on-content-click="false"
              min-width="0"
              nudge-right="50"
              transition="scale-transition"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="intendedAgmDateText"
                  class="pt-2 pl-4"
                  :rules="dateRules"
                  label="Intended date this AGM will be held"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  filled
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="datePickerIntendedAgm"
                no-title
                @input="intendedAgmDateMenu=false"
                @change="onAgmIntendedDatePickerChanged($event)"
              />
            </v-menu>
          </v-col>
        </v-row>
      </div>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { VcardTemplate } from '@/components/common'
import { AgmExtEvalIF } from '@/interfaces'
import { useRootStore } from '@/stores'
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

  @Getter(useRootStore) getCurrentDate!: string

  // Has extension been requested variables
  datePickerExtensionExpiry = '' // value in date of extension expiry date picker
  extensionDateMenu = false // whether extension date calendar menu is visible
  extensionExpiryDateText = '' // value in the text field

  // Intended date this AGM will be held variables
  datePickerIntendedAgm = '' // value in date of intended AGM date picker
  intendedAgmDateMenu = false // whether intended AGM calendar menu is visible
  intendedAgmDateText = '' // value in the text field

  // Previous AGM date (reference date) variables
  datePickerPreviousAgm = '' // value in date of intended AGM date picker
  previousAgmDateMenu = false // whether intended AGM calendar menu is visible
  previousAgmDateText = '' // value in the text field

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
    const data = { ...this.data, agmYear: value }
    this.emitData(data)
  }

  get extensionExpiryMax (): string {
    if (this.isFirstAgm) {
      return DateUtilities.addMonthsToDate(30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      return 'placeholder for future work'
    }
  }

  get extensionExpiryMin (): string {
    if (this.isFirstAgm) {
      return DateUtilities.addMonthsToDate(19, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
    } else {
      return 'placeholder for future work'
    }
  }

  /**
   * Whether to disable the editing of AGM Year field.
   * Editable (false) when Is this first AGM is set to No.
   * Non-Editable (true) when we first load (null) or Is first AGM is Yes.
   * Set the agmYear as incorporation date if not null and true.
   */
  get isFirstAgm (): boolean {
    if (this.data.isFirstAgm !== null) {
      if (this.data.isFirstAgm) {
        this.data.agmYear = this.data.incorporationDate.getFullYear().toString()
        return true
      } else {
        this.data.agmYear = ''
        return false
      }
    } else {
      return true
    }
  }

  /** Called when extension date picker changes. */
  onExtensionDatePickerChanged (val: string): void {
    // update text field
    this.extensionExpiryDateText = val
    this.data.prevExpiryDate = val
    // update parent
    // this.emitAgmDate()
    // this.emitValid()
  }

  /** Called when intended AGM date picker changes. */
  onAgmIntendedDatePickerChanged (val: string): void {
    // update text field
    this.intendedAgmDateText = val
    this.data.intendedAgmDate = val
  }

  /** Called when previous AGM date picker changes. */
  onPreviousAgmDatePickerChanged (val: string): void {
    // update text field
    this.previousAgmDateText = val
    this.data.prevAgmDate = val
  }

  @Watch('data.isPrevExtension')
  @Watch('extensionExpiryDateText')
  onIsPrevExtensionChanged (val: boolean): void {
    this.data.isEligible = null
    if (!val && this.isFirstAgm && this.isFirstAgm !== null) { // This is the first extension request for this AGM
      const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
        18, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
      const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)
      const currentDate = DateUtilities.yyyyMmDdToDate(this.getCurrentDate)
      if ((DateUtilities.daysBetweenTwoDates(cutOffDate, currentDate) - 5) > 0) {
        this.data.isEligible = false
      } else {
        this.data.isEligible = true
        this.data.extensionDuration = 6
      }
    } else if (val && this.isFirstAgm && this.isFirstAgm !== null && this.extensionExpiryDateText) {
      // Yes - Specify the date the extension expires
      const cutOffYyyyMmDd = DateUtilities.addMonthsToDate(
        30, DateUtilities.dateToYyyyMmDd(this.data.incorporationDate))
      const cutOffDate = DateUtilities.yyyyMmDdToDate(cutOffYyyyMmDd)
      const expiryDate = DateUtilities.yyyyMmDdToDate(this.extensionExpiryDateText)
      if ((DateUtilities.daysBetweenTwoDates(cutOffDate, expiryDate)) >= 0) {
        this.data.isEligible = false
      } else {
        const currentDate = DateUtilities.yyyyMmDdToDate(this.getCurrentDate)
        if ((DateUtilities.daysBetweenTwoDates(expiryDate, currentDate)) > 5) {
          this.data.isEligible = false
        } else {
          this.data.isEligible = true
          const totalExtensionApproved = DateUtilities.subtractDates(
            DateUtilities.dateToYyyyMmDd(this.data.incorporationDate), this.extensionExpiryDateText) - 18
          this.data.extensionDuration = Math.min(6, (12 - totalExtensionApproved))
        }
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
