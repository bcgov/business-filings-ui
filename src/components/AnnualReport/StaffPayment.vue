<template>
  <v-card flat id="AR-step-5-container">
    <v-form class="staff-payment-container" v-model="formValid">
      <div class="routingslipnumber-container">
        <label>Routing Slip Number</label>
        <div class="value routingslipnumber">
          <v-text-field
            filled
            persistent-hint
            id="routing-slip-number-textfield"
            label="Enter the Routing Slip Number "
            hint="Fee Accounting System Routing Slip Number (9 digits)"
            v-model="myRoutingSlipNumber"
            :rules="rules"
          />
        </div>
      </div>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'

@Component({})
export default class StaffPayment extends Vue {
  /** Routing Slip Number prop. */
  @Prop({ default: null })
  private routingSlipNumber: string

  /** Priority prop. */
  @Prop({ default: null })
  private priority: boolean

  /** No Fee prop. */
  @Prop({ default: null })
  private noFee: boolean

  private formValid : boolean = false

  // Model properties, initialized to initial prop values.
  private myRoutingSlipNumber: string = this.routingSlipNumber
  private myPriority: boolean = this.priority
  private myNoFee: boolean= this.noFee

  /** Vuetify rules, used for error messages and styling. */
  private readonly rules = [
    v => !!v || 'Routing Slip Number is required',
    v => /^\d{9}$/.test(v) || 'Routing Slip Number must be 9 digits'
  ]

  /** Called when component is created. */
  private created (): void {
    // notify parent of initial state
    this.emitUpdateRoutingSlipNumber(this.myRoutingSlipNumber)
    this.emitValid(this.formValid)
  }

  /** Watches for change to prop and updates local copy. */
  @Watch('routingSlipNumber')
  private onRoutingSlipNumberChanged (val: string): void {
    this.myRoutingSlipNumber = val
  }

  /** Watches for change to prop and updates local copy. */
  @Watch('priority')
  private onPriorityChanged (val: boolean): void {
    this.myPriority = val
  }

  /** Watches for change to prop and updates local copy. */
  @Watch('noFee')
  private onNoFeeChanged (val: boolean): void {
    this.myNoFee = val
  }

  /** Watches for change to Routing Slip Number and notifies parent. */
  @Watch('myRoutingSlipNumber')
  private onMyRoutingSlipNumberChanged (val: string): void {
    this.emitUpdateRoutingSlipNumber(this.myRoutingSlipNumber)
  }

  /** Watches for change to form validity and notifies parent. */
  @Watch('formValid')
  private onValidChanged (val: boolean): void {
    this.emitValid(this.formValid)
  }

  /** Emits an event to inform parent of new Routing Slip Number. */
  @Emit('update:routingSlipNumber')
  private emitUpdateRoutingSlipNumber (val: string): void { }

  /** Emits an event to inform parent of new validity. */
  @Emit('valid')
  private emitValid (val: boolean): void { }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

#AR-step-5-container {
  margin-top: 1rem;
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  line-height: 1.2rem;
  font-size: 0.875rem;
}

.staff-payment-container {
  padding: 1.25rem;
}

.routingslipnumber-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  > label:first-child {
    font-weight: 700;
  }
}

@media (min-width: 768px) {
  .routingslipnumber-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      padding-right: 2rem;
      width: 12rem;
    }
  }
}

.value.routingslipnumber {
  min-width: 35rem;
}
</style>
