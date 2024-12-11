<template>
  <div
    id="staff-payment-container"
  >
    <StaffPaymentShared
      :staffPaymentData="staffPaymentData"
      :validate="validate"
      :displaySideLabel="true"
      :displayPriorityCheckbox="true"
      @update:staffPaymentData="emitStaffPaymentData($event)"
      @valid="staffPaymentFormValid=$event"
    />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { StaffPayment as StaffPaymentShared } from '@bcrs-shared-components/staff-payment'
import { StaffPaymentIF } from '@/interfaces'

  /** This is a shim between the view and the atomic component. */
  @Component({
    components: {
      StaffPaymentShared
    }
  })
export default class StaffPayment extends Vue {
  // Prop to provide staff payment data.
  @Prop({ required: true }) readonly staffPaymentData!: StaffPaymentIF

  // Local state for form validity
  private validate = false
  private staffPaymentFormValid = false

  @Watch('staffPaymentData', { deep: true })
  onStaffPaymentDataChanged (): void {
    this.validate = true
  }

  @Watch('staffPaymentFormValid')
  @Watch('validate')
  onStaffPaymentFormValidChange (newValue: boolean): void {
    if (this.validate) {
      this.emitStaffPaymentFormValid(newValue) // Emit the updated validity state
    }
  }

  /** Emit payment data to the parent */
  @Emit('update:staffPaymentData')
  emitStaffPaymentData (): void {}

  /** Emit form validity state to the parent */
  @Emit('staffPaymentFormValid')
  emitStaffPaymentFormValid (isValid: boolean): boolean {
    return isValid
  }
}
</script>
