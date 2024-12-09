<template>
  <div
    id="staff-payment-container"
    :class="{'invalid-section': invalidStaffPayment}"
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
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { StaffPayment as StaffPaymentShared } from '@bcrs-shared-components/staff-payment'
import { StaffPaymentIF } from '@/interfaces'
import { StaffPaymentOptions } from '@bcrs-shared-components/enums'

  /** This is a shim between the view and the atomic component. */
  @Component({
    components: {
      StaffPaymentShared
    }
  })
export default class StaffPayment extends Vue {
    // Refs
  $refs!: {
    dialog: any
  }

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop to provide staff payment data.
  @Prop({ required: true }) readonly staffPaymentData!: StaffPaymentIF

  // Prop to display loading indicators and to disable buttons.
  @Prop({ default: false }) readonly loading!: boolean

  validate = false
  staffPaymentFormValid = false

  /** Called when user clicks Submit button. */
  async submit (): Promise<void> {
    // enable validation
    this.validate = true

    // wait for validation
    await this.$nextTick()

    // emit submit event only if form is valid
    // otherwise user stays on this dialog
    if (this.staffPaymentFormValid) {
      this.$emit('submit')
    } else if (this.staffPaymentData.option === StaffPaymentOptions.NONE) {
      // "bounce" the dialog to indicate error: user needs to select
      // an option (when an option is selected, other errors display)
      this.$refs.dialog.animateClick()
    }
  }

  /** Called when user clicks Exit button. */
  exit (): void {
    // reset validation (for next time)
    this.validate = false

    // emit exit event
    this.$emit('exit')
  }

  // Pass updated staff payment data to parent.
  @Emit('update:staffPaymentData')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitStaffPaymentData (staffPaymentData: StaffPaymentIF): void {}
}
</script>
