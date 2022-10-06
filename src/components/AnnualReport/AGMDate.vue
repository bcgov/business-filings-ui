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
              v-model="agmDateState.datePicker"
              :min=arMinDate
              :max=arMaxDate
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
              <template v-slot:label>
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

<script setup lang="ts">
import { reactive } from 'vue'
import { AllowableActionsComposable, DateComposable } from '@/composables'
import { FormIF } from '@/interfaces'
import { state } from '@/store'

const props = defineProps({
  newAgmDate: { type: string, default: null }, // New AGM Date (from a resumed draft)
  newAgmExtension: { type: boolean, default: null }, // New AGM Extension flag (from a resumed draft)
  newNoAgm: { type: boolean, default: null }, // New No AGM flag (from a resumed draft)
  allowCoa: { type: boolean, default: true }, // Whether to allow changing the addresses
  allowCod: { type: boolean, default: true } // Whether to allow changing the directors
})

// Local properties.
const agmDateState = reactive({
  dateText: '', // value in text field
  datePicker: '', // value in date picker
  menu: false, // whether calendar menu is visible
  agmExtension: false, // whether checkbox is checked
  noAgm: false, // whether checkbox is checked
  backupDate: '' // for toggling No AGM
})

const { getCurrentDate, compareYyyyMmDd } = DateComposable()
const { isCoop } = AllowableActionsComposable()

/** Computed state properties */
const ARFilingYear = computed(() => state.ARFilingYear)
const arMinDate = computed(() => state.arMinDate)
const arMaxDate = computed(() => state.arMaxDate)

/** The array of validations rule(s) for the AGM Date text field. */
const agmDateRules = computed({
  get: (): Array<(v) => boolean | string> => [v => noAgm || !!v || 'An Annual General Meeting date is required.']
})

/** The label for the No AGM checkbox. */
const noAgmLabel = computed({
  get: (): string => `We did not hold an Annual General Meeting for our ${ARFilingYear} Financial Year`
})

/** Whether to show the AGM Extension checkbox. */
const showAgmExtensionCheckbox = computed({
  // don't show if No AGM is checked
  // a date must be entered
  // applies only to 2020 ARs
  // show if entered date is past normal max AGM date
  get: (): boolean => (
    !noAgm &&
    !!dateText &&
    (ARFilingYear === 2020) &&
    compareYyyyMmDd(dateText, '2021-04-30', '>')
  )
})

/**
 * Whether to show the No AGM checkbox.
 * @returns False in the AR Filing Year
 * @returns False in the next year up to Apr 30
 * @returns True in the next year after Apr 30
 */
const showNoAgmCheckbox = computed({
  get: (): boolean => {
    if (!ARFilingYear) return false // safety check
    // only show checkbox if 'today' is past Max AGM Date
    // where Max AGM Date is 'today' in the AR Filing Year
    // up to Apr 30 in the next year
    return (compareYyyyMmDd(getCurrentDate, arMaxDate, '>'))
  }
})

onMounted((): void => { agmDateState.datePicker = newAgmDate || arMaxDate })

/** Called when prop changes (ie, due to resuming a draft) */
watch(() => newAgmExtension.value, (val: boolean): void => {
  // update model value
  agmExtension.value = val
  // update parent
  emitAgmExtension()
  emitValid()
})

/** Called when prop changes (ie, due to resuming a draft) */
watch(() => newNoAgm.value, (val: boolean): void => {
  // update model value
  noAgm.value = val
  // update parent
  emitNoAgm()
  emitValid()
})

/** Called when date picker changes. */
const onDatePickerChanged = (val: string): void => {
  // update text field
  dateText.value = val
  // update parent
  emitAgmDate()
  emitValid()
}

/** Called when AGM Extension checkbox changes. */
const onAgmExtensionChanged = (): void => {
  // update parent
  emitAgmExtension()
  emitValid()
}

/** Called when checkbox changes. */
const onNoAgmCheckboxChanged = (val: boolean): void => {
  if (val) {
    // save and clear text field
    backupDate = dateText
    dateText = ''
  } else {
    // restore text field
    dateText = backupDate
  }
  // trigger validation to display any errors
  $refs.form.validate()
  // update parent
  emitAgmDate()
  emitNoAgm()
  emitValid()
}

const emit = defineEmits<{
  (e: 'agmDate', value: string)
  (e: 'agmExtension', value: boolean)
  (e: 'noAgm', value: boolean)
  (e: 'valid', value: boolean)
}>()

const emitAgmDate = computed((): string => agmDateState.dateText)
const emitAgmExtension = computed((): boolean => agmDateState.agmExtension)
const emitNoAgm = computed((): boolean => noAgm)
const emitValid = computed((): boolean => {
  // valid if checkbox is not applicable, or is checked
  const validAgmExtension = (!showAgmExtensionCheckbox || agmExtension)
  // valid if No AGM was checked, or a date was entered and AGM extension is  valid
  return (noAgm || (!!dateText && validAgmExtension))
})
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
:deep(.v-text-field:not(.error--text)) {
  margin-bottom: -30px;
}

:deep(.v-input--checkbox) {
  padding-top: 0;

  .v-label {
    color: rgba(0,0,0,0.87);
  }
}
</style>
