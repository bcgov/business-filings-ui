<template>
  <v-card flat id="AR-step-5-container">
    <div class="payment-container">
      <label>Payment</label>
      <v-radio-group
        class="value payments"
        :value="paymentOption"
        @change="onPaymentOptionChanged($event)"
      >
        <!-- Payment Received radio button -->
        <v-radio id="payment-received-radio" label="Payment Received" />
        <v-form class="ml-8" ref="form" v-model="formValid">
          <v-text-field
            filled
            persistent-hint
            id="routing-slip-number-textfield"
            label="Enter the Routing Slip Number "
            hint="Fee Accounting System Routing Slip Number (9 digits)"
            :value="routingSlipNumber"
            :rules="rules"
            :maxlength="9"
            :disabled="paymentOption !== PAYMENT_RECEIVED"
            @input="emitRoutingSlipNumber($event)"
          />
          <v-checkbox
            class="mt-2"
            id="priority-checkbox"
            label="Priority (add $100.00)"
            :input-value="isPriority"
            :disabled="paymentOption !== PAYMENT_RECEIVED"
            @change="emitIsPriority(!!$event)"
          />
        </v-form>

        <!-- No Fee radio button -->
        <v-radio id="no-fee-radio" label="No Fee" />
      </v-radio-group>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'

@Component({})
export default class StaffPayment extends Vue {
  // payment options:
  readonly PAYMENT_RECEIVED = 0
  readonly NO_FEE = 1

  /** Routing Slip Number prop. */
  @Prop({ default: '' })
  private routingSlipNumber: string

  /** Is Priority prop. */
  @Prop({ default: false })
  private isPriority: boolean

  /** Is Waive Fees prop. */
  @Prop({ default: false })
  private isWaiveFees: boolean

  /** Form model property. */
  private formValid: boolean = false

  /** Array of validation rules for Routing Slip Number. */
  private readonly rules = [
    v => !!v || 'Routing Slip Number is required',
    v => /^\d{9}$/.test(v) || 'Routing Slip Number must be 9 digits'
  ]

  /** The payment option (radio group index). */
  private get paymentOption (): number {
    return this.isWaiveFees ? this.NO_FEE : this.PAYMENT_RECEIVED
  }

  /** Called when payment option (radio group) has changed. */
  private onPaymentOptionChanged (val: number): void {
    if (val === this.NO_FEE) {
      // clear form and reset validation
      (this.$refs.form as any).reset()
    }
    this.emitIsWaiveFees(val === this.NO_FEE)
    this.$nextTick(() => this.emitValid())
  }

  /**
   * Watches for change to form validity.
   * NB: form always becomes valid when mounted
   */
  @Watch('formValid')
  private onFormValidChanged (): void {
    this.emitValid()
  }

  /**
   * Watches for change to prop.
   * NB: needed to set validity when props are updated
   */
  @Watch('isWaiveFees')
  private onIsWaiveFeesChanged (): void {
    this.emitValid()
  }

  /** Emits an event to update the Routing Slip Number prop. */
  @Emit('update:routingSlipNumber')
  private emitRoutingSlipNumber (val: string): void { }

  /** Emits an event to update the Is Priority prop. */
  @Emit('update:isPriority')
  private emitIsPriority (val: boolean): void { }

  /** Emits an event to update the Is Waive Fees prop. */
  @Emit('update:isWaiveFees')
  private emitIsWaiveFees (val: boolean): void { }

  /** Emit an event indicating whether or not the form is valid. */
  @Emit('valid')
  private emitValid (): boolean {
    return Boolean(this.formValid || this.isWaiveFees)
  }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

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

.value.payments {
  margin-top: 0;
  padding-top: 0;
  width: 100%;
}
</style>
