<template>
  <v-card flat id="AR-step-5-container">
    <div class="payment-container">
      <label>Payment</label>
      <v-radio-group class="payment-group" v-model="paymentOption">
        <!-- Cash or Cheque radio button and form -->
        <v-radio id="fas-radio" label="Cash or Cheque" :value="StaffPaymentOptions.FAS" />
        <v-form class="ml-8" ref="fasForm" v-model="fasFormValid">
          <v-text-field
            filled
            id="routing-slip-number-textfield"
            label="Routing Slip Number"
            :value="staffPaymentData.routingSlipNumber"
            :rules="routingSlipNumberRules"
            :disabled="paymentOption === StaffPaymentOptions.BCOL || paymentOption === StaffPaymentOptions.NO_FEE"
            @focus="paymentOption = StaffPaymentOptions.FAS"
            @input="emitStaffPaymentData({ option: StaffPaymentOptions.FAS, routingSlipNumber: $event })"
          />
        </v-form>

        <!-- BC Online radio button and form -->
        <v-radio id="bcol-radio" label="BC Online" :value="StaffPaymentOptions.BCOL" />
        <v-form class="ml-8" ref="bcolForm" v-model="bcolFormValid">
          <v-text-field
            filled
            id="bcol-account-number-textfield"
            label="BC Online Account Number"
            :value="staffPaymentData.bcolAccountNumber"
            :rules="bcolAccountNumberRules"
            :disabled="paymentOption === StaffPaymentOptions.FAS || paymentOption === StaffPaymentOptions.NO_FEE"
            @focus="paymentOption = StaffPaymentOptions.BCOL"
            @input="emitStaffPaymentData({ option: StaffPaymentOptions.BCOL, bcolAccountNumber: $event })"
          />
          <v-text-field
            filled
            id="dat-number-textfield"
            label="DAT Number"
            :value="staffPaymentData.datNumber"
            :rules="datNumberRules"
            :disabled="paymentOption === StaffPaymentOptions.FAS || paymentOption === StaffPaymentOptions.NO_FEE"
            @focus="paymentOption = StaffPaymentOptions.BCOL"
            @input="emitStaffPaymentData({ option: StaffPaymentOptions.BCOL, datNumber: $event })"
          />
          <v-text-field
            filled
            id="folio-number-textfield"
            label="Folio Number"
            :value="staffPaymentData.folioNumber"
            :rules="folioNumberRules"
            :disabled="paymentOption === StaffPaymentOptions.FAS || paymentOption === StaffPaymentOptions.NO_FEE"
            @focus="paymentOption = StaffPaymentOptions.BCOL"
            @input="emitStaffPaymentData({ option: StaffPaymentOptions.BCOL, folioNumber: $event })"
          />
        </v-form>

        <!-- No Fee radio button -->
        <v-radio id="no-fee-radio" label="No Fee" :value="StaffPaymentOptions.NO_FEE" />

        <!-- Priority checkbox -->
        <v-checkbox
          class="mt-2"
          id="priority-checkbox"
          label="Priority (add $100.00)"
          :input-value="staffPaymentData.isPriority"
          :disabled="paymentOption === StaffPaymentOptions.NO_FEE"
          @change="emitStaffPaymentData({ isPriority: !!$event })"
        />
      </v-radio-group>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { StaffPaymentOptions } from '@/enums'
import { FormIF, StaffPaymentIF } from '@/interfaces'

@Component({})
export default class StaffPayment extends Vue {
  // To fix "property X does not exist on type Y" errors, annotate types for referenced components.
  // ref: https://github.com/vuejs/vetur/issues/1414
  // ref: https://github.com/vuejs/vue-class-component/issues/94
  $refs!: Vue['$refs'] & {
    fasForm: FormIF,
    bcolForm: FormIF
  }

  /** Enum for template. */
  readonly StaffPaymentOptions = StaffPaymentOptions

  /** Staff Payment Data prop. */
  @Prop({ default: () => {
    return {
      option: StaffPaymentOptions.NONE,
      routingSlipNumber: null,
      bcolAccountNumber: null,
      datNumber: null,
      folioNumber: null,
      isPriority: false
    }
  } })
  private staffPaymentData: StaffPaymentIF

  /** Radio group model property. */
  private paymentOption = StaffPaymentOptions.NONE

  /** FAS form model property. */
  private fasFormValid = false

  /** BCOL form model property. */
  private bcolFormValid = false

  /** Whether this component has been mounted. */
  private isMounted = false

  /** Validation rules for Routing Slip Number. */
  private readonly routingSlipNumberRules: Array<Function> = [
    v => !!v || 'Routing Slip Number is required',
    v => /^\d{9}$/.test(v) || 'Routing Slip Number must be 9 digits'
  ]

  /** Validation rules for BCOL Account Number. */
  private readonly bcolAccountNumberRules: Array<Function> = [
    v => !!v || 'BC Online Account Number is required',
    v => /^\d{6}$/.test(v) || 'BC Online Account Number must be 6 digits'
  ]

  /** Validation rules for DAT Number. */
  private readonly datNumberRules: Array<Function> = [
    v => !!v || 'DAT Number is required',
    v => /^[A-Z]{1}[0-9]{7,9}$/.test(v) || 'DAT Number must be in standard format (eg, C1234567)'
  ]

  /** Validation rules for Folio Number. */
  private readonly folioNumberRules: Array<Function> = [
    v => /^[0-9A-Za-z]*$/.test(v) || 'Invalid character', // numbers and letters only
    v => (!v || v.length <= 50) || 'Cannot exceed 50 characters' // maximum character count
  ]

  /** Called when this component is mounted. */
  private mounted (): void {
    this.$nextTick(() => { this.isMounted = true })
  }

  /** Called when payment option (radio group item) has changed. */
  @Watch('paymentOption')
  private onPaymentOptionChanged (val: number): void {
    switch (val) {
      case StaffPaymentOptions.FAS:
        // reset other form and update data
        this.$refs.bcolForm.reset()
        this.emitStaffPaymentData({ option: StaffPaymentOptions.FAS })
        break
      case StaffPaymentOptions.BCOL:
        // reset other form and update data
        this.$refs.fasForm.reset()
        this.emitStaffPaymentData({ option: StaffPaymentOptions.BCOL })
        break
      case StaffPaymentOptions.NO_FEE:
        // reset forms and update data
        this.$refs.fasForm.reset()
        this.$refs.bcolForm.reset()
        this.emitStaffPaymentData({ option: StaffPaymentOptions.NO_FEE, isPriority: false })
        break
    }
  }

  /** Watched for change to FAS form validity. */
  @Watch('fasFormValid')
  private onFasFormValid (val: boolean) {
    // ignore initial valid condition
    if (!this.isMounted) return
    this.emitValid()
  }

  /** Watches for change to BCOL form validity. */
  @Watch('bcolFormValid')
  private onBcolFormValid (val: boolean) {
    // ignore initial valid condition
    if (!this.isMounted) return
    this.emitValid()
  }

  /** Watches for changes to Staff Payment Data prop. */
  @Watch('staffPaymentData', { deep: true, immediate: true })
  private onStaffPaymentDataChanged (val: StaffPaymentIF): void {
    this.paymentOption = val.option
    this.$nextTick(() => this.emitValid())
  }

  /** Emits an event to update the Staff Payment Data prop. */
  @Emit('update:staffPaymentData')
  private emitStaffPaymentData ({
    option = this.staffPaymentData.option,
    routingSlipNumber = this.staffPaymentData.routingSlipNumber,
    bcolAccountNumber = this.staffPaymentData.bcolAccountNumber,
    datNumber = this.staffPaymentData.datNumber,
    folioNumber = this.staffPaymentData.folioNumber,
    isPriority = this.staffPaymentData.isPriority
  }): StaffPaymentIF {
    return { option, routingSlipNumber, bcolAccountNumber, datNumber, folioNumber, isPriority }
  }

  /** Emits an event indicating whether or not this component is valid. */
  @Emit('valid')
  private emitValid (): boolean {
    return (this.fasFormValid || this.bcolFormValid ||
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }
}
</script>

<style lang="scss" scoped>
#AR-step-5-container {
  margin-top: 1rem;
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  line-height: 1.2rem;
  font-size: 1rem;
}

.payment-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  padding: 1.25rem;

  > label:first-child {
    font-weight: 700;
    margin-bottom: 2rem;
  }
}

@media (min-width: 768px) {
  .payment-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      padding-right: 2rem;
      width: 12rem;
    }
  }
}

.payment-group {
  margin-top: 0;
  padding-top: 0;
  width: 100%;
}
</style>
