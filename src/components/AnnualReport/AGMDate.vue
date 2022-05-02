<template>
  <v-card flat id="agm-date-container" v-if="isCoop">
    <div class="meta-container">
      <label>Annual General<br>Meeting Date</label>

      <div>
        <v-form ref="form" class="value date">
          <!-- date picker -->
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            nudge-right="50"
            transition="scale-transition"
            max-width="290"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                data-test-id="agm-date-text"
                class="pt-0"
                v-model="dateText"
                :disabled="noAgm"
                :rules="agmDateRules"
                label="Annual General Meeting Date"
                placeholder="Select your Annual General Meeting Date"
                append-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                filled
              />
            </template>
            <v-date-picker
              data-test-id="agm-date-picker"
              v-model="datePicker"
              :min=localMaxDate
              no-title
              @input="menu=false"
              @change="onDatePickerChanged($event)"
            />
          </v-menu>

          <!-- restriction messages -->
          <!-- date must have been selected first -->
          <div v-if="dateText" class="restriction-messages mt-4">
            <span v-if="!allowCoa && !allowCod">
              You cannot change your Registered Office Addresses or Directors in this Annual Report
              because your AGM predates another filing that may have conflicting changes.
            </span>
            <span v-else-if="!allowCoa">
              You cannot change your Registered Office Addresses in this Annual Report because your AGM
              predates another filing that may have conflicting changes.
            </span>
            <span v-else-if="!allowCod">
              You cannot change your Directors in this Annual Report because your AGM predates another
              filing that may have conflicting changes.
            </span>
          </div>
        </v-form>

        <!-- special AGM Extension message and checkbox -->
        <v-expand-transition>
          <div v-if="showAgmExtensionCheckbox" class="agm-extension-container mt-4">
            <p>The selected Annual General Meeting date is beyond April 30, 2021 and would have required
              an extension of the Annual General Meeting date.</p>
            <p>The Registrar granted an extension for all Cooperatives that wished to extend their Annual
              General Meeting (AGM) up to and including October 31, 2021. You did not need to make an
              application to the Registrar to request an extension of your AGM; however, you must have
              informed your members that the AGM date was extended.</p>

            <v-checkbox
              id="agm-extension-checkbox"
              v-model="agmExtension"
              hide-details
              @change="onAgmExtensionChanged($event)"
            >
              <template slot="label">
                <span class="font-weight-bold">The Cooperative Association extended its Annual General Meeting
                  date and notified its members of this extension (required for this date selection)</span>
              </template>
            </v-checkbox>
          </div>
        </v-expand-transition>

        <!-- No AGM checkbox -->
        <v-checkbox v-if="showNoAgmCheckbox"
          id="no-agm-checkbox"
          v-model="noAgm"
          hide-details
          :label=noAgmLabel
          @change="onNoAgmCheckboxChanged($event)"
        />

        <!-- No AGM message -->
        <v-expand-transition>
          <div v-if="noAgm" class="no-agm-container d-flex align-start mt-4">
            <v-icon color="primary">mdi-information-outline</v-icon>

            <div class="ml-3">
              <p>A general meeting of every association must be held at least once in every calendar year
                within 4 months after the end of its financial year, to be in compliance with the Cooperative
                Association Act (Section 143).</p>
              <p>You can continue your filing, and there is no fee enforced by BC Registries and Online
                Services for being out of compliance with legislation. However, it is important to hold a valid
                AGM in the next calendar year to be in compliance with the Cooperative Association Act.</p>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch, Emit } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { FormIF } from '@/interfaces'

@Component({})
export default class AgmDate extends Mixins(DateMixin) {
  // To fix "property X does not exist on type Y" errors, annotate types for referenced components.
  // ref: https://github.com/vuejs/vetur/issues/1414
  // ref: https://github.com/vuejs/vue-class-component/issues/94
  $refs!: Vue['$refs'] & {
    form: FormIF
  }

  /** New AGM Date (from a resumed draft). */
  @Prop({ default: null })
  readonly newAgmDate: string

  /** New AGM Extension flag (from a resumed draft). */
  @Prop({ default: null })
  readonly newAgmExtension: boolean

  /** New No AGM flag (from a resumed draft). */
  @Prop({ default: null })
  readonly newNoAgm: boolean

  /** Whether to allow changing the addresses. */
  @Prop({ default: true })
  readonly allowCoa: boolean

  /** Whether to allow changing the directors. */
  @Prop({ default: true })
  readonly allowCod: boolean

  /** last address change date */
  @Prop({ default: '' })
  readonly lastACD: string

  /** last director change date */
  @Prop({ default: '' })
  readonly lastDCD: string

  @State ARFilingYear!: number
  @State arMaxDate!: string
  @Getter isCoop!: boolean
  @Getter getCurrentDate!: string

  // Local properties.
  private dateText = '' // value in text field
  private datePicker = '' // value in date picker
  private menu = false // whether calendar menu is visible
  private agmExtension = false // whether checkbox is checked
  private noAgm = false // whether checkbox is checked
  private backupDate = '' // for toggling No AGM
  private localMaxDate = '' // last date of coa, cod and arMaxDate

  /** The array of validations rule(s) for the AGM Date text field. */
  private get agmDateRules (): Array<Function> {
    return [
      v => this.noAgm || !!v || 'An Annual General Meeting date is required.'
    ]
  }

  /** The label for the No AGM checkbox. */
  private get noAgmLabel (): string {
    return `We did not hold an Annual General Meeting for our ${this.ARFilingYear} Financial Year`
  }

  /** Whether to show the AGM Extension checkbox. */
  private get showAgmExtensionCheckbox (): boolean {
    // don't show if No AGM is checked
    // a date must be entered
    // applies only to 2020 ARs
    // show if entered date is past normal max AGM date
    return (
      !this.noAgm &&
      !!this.dateText &&
      (this.ARFilingYear === 2020) &&
      this.compareYyyyMmDd(this.dateText, '2021-04-30', '>')
    )
  }

  /**
   * Whether to show the No AGM checkbox.
   * @returns False in the AR Filing Year
   * @returns False in the next year up to Apr 30
   * @returns True in the next year after Apr 30
   */
  private get showNoAgmCheckbox (): boolean {
    if (!this.ARFilingYear) return false // safety check
    // only show checkbox if 'today' is past Max AGM Date
    // where Max AGM Date is 'today' in the AR Filing Year
    // up to Apr 30 in the next year
    return (this.compareYyyyMmDd(this.getCurrentDate, this.arMaxDate, '>'))
  }

  /** Called when component is mounted. */
  private mounted (): void {
    // set date picker but not text field
    let lastEffectiveDate = this.latestYyyyMmDd(this.lastACD, this.lastDCD)
    this.localMaxDate = this.latestYyyyMmDd(this.arMaxDate, lastEffectiveDate)
    this.datePicker = this.newAgmDate || this.arMaxDate
  }

  /** Called when prop changes (ie, due to resuming a draft). */
  @Watch('newAgmDate')
  private onNewAgmDateChanged (val: string): void {
    // always update text field
    this.dateText = val
    // only update date picker if we have a valid date
    if (val) this.datePicker = val
    // update parent
    this.emitAgmDate()
    this.emitValid()
  }

  /** Called when prop changes (ie, due to resuming a draft) */
  @Watch('newAgmExtension')
  private onNewAgmExtension (val: boolean): void {
    // update model value
    this.agmExtension = val
    // update parent
    this.emitAgmExtension()
    this.emitValid()
  }

  /** Called when prop changes (ie, due to resuming a draft) */
  @Watch('newNoAgm')
  private onNewNoAgmChanged (val: boolean): void {
    // update model value
    this.noAgm = val
    // update parent
    this.emitNoAgm()
    this.emitValid()
  }

  /** Called when date picker changes. */
  private onDatePickerChanged (val: string): void {
    // update text field
    this.dateText = val
    // update parent
    this.emitAgmDate()
    this.emitValid()
  }

  /** Called when AGM Extension checkbox changes. */
  private onAgmExtensionChanged (val: boolean): void {
    // update parent
    this.emitAgmExtension()
    this.emitValid()
  }

  /** Called when checkbox changes. */
  private onNoAgmCheckboxChanged (val: boolean): void {
    if (val) {
      // save and clear text field
      this.backupDate = this.dateText
      this.dateText = ''
    } else {
      // restore text field
      this.dateText = this.backupDate
    }
    // trigger validation to display any errors
    this.$refs.form.validate()
    // update parent
    this.emitAgmDate()
    this.emitNoAgm()
    this.emitValid()
  }

  /** Emits an event with the new value of AGM Date (from text field, which may be empty). */
  @Emit('agmDate')
  private emitAgmDate (): string {
    return this.dateText
  }

  /** Emits an event with the new value of No AGM. */
  @Emit('agmExtension')
  private emitAgmExtension (): boolean {
    return this.agmExtension
  }

  /** Emits an event with the new value of No AGM. */
  @Emit('noAgm')
  private emitNoAgm (): boolean {
    return this.noAgm
  }

  /**
   * Emits an event indicating whether or not this component is valid.
   * This needs to be called after all changes.
   */
  @Emit('valid')
  private emitValid (): boolean {
    // valid if checkbox is not applicable, or is checked
    const validAgmExtension = (!this.showAgmExtensionCheckbox || this.agmExtension)
    // valid if No AGM was checked, or a date was entered and AGM extension is valid
    return (this.noAgm || (!!this.dateText && validAgmExtension))
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

#agm-date-container {
  padding: 1.25rem;
}

.restriction-messages {
  color: red;
}

.meta-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  > label {
    font-weight: 700;
    margin-bottom: 2rem;
  }

  > div {
    width: 100%;
  }
}

.v-form {
  max-width: 27rem;
}

@media (min-width: 768px) {
  .meta-container {
    flex-flow: row nowrap;

    > label {
      flex: 0 0 auto;
      width: 12rem;
    }

    > div {
      margin-left: 2rem;
    }
  }
}

@media (min-width: 960px) {
  .v-form {
    max-width: 25rem;
  }
}

.agm-extension-container {
  padding: 1.125rem;
  font-size: $px-16;
  line-height: normal;
  background-color: $app-bg-gray;
}

// reduce date input height when there are no error messages
::v-deep .v-text-field:not(.error--text) {
  margin-bottom: -30px;
}

::v-deep .v-input--checkbox {
  padding-top: 0;

  .v-label {
    color: rgba(0,0,0,0.87);
  }
}
</style>
