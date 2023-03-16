<template>
  <v-dialog ref="dialog" v-model="dialog" width="45rem" persistent :attach="attach"
    content-class="staff-payment-dialog"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Staff Payment</div>
        <v-btn icon large class="dialog-close float-right" @click="exit()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <StaffPayment
          :staffPaymentData="staffPaymentData"
          :validate="validate"
          :displaySideLabel="false"
          :displayPriorityCheckbox="true"
          @update:staffPaymentData="emitStaffPaymentData($event)"
          @valid="staffPaymentFormValid=$event"
        />
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          id="dialog-close-button"
          class="button-blue py-5 px-5"
          :loading="loading"
          :disabled="loading"
          @click="exit()"
        >
          Exit Payment
        </v-btn>
        <v-btn
          id="dialog-submit-button"
          class="primary py-5 px-10"
          :loading="loading"
          :disabled="loading"
          @click="submit()"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { StaffPayment } from '@bcrs-shared-components/staff-payment'
import { StaffPaymentIF } from '@/interfaces'
import { StaffPaymentOptions } from '@/enums'

@Component({
  components: { StaffPayment }
})
export default class StaffPaymentDialog extends Vue {
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

  protected validate = false
  protected staffPaymentFormValid = false

  /** Called when user clicks Submit button. */
  protected async submit (): Promise<void> {
    // enable validation
    this.validate = true

    // wait for validation
    await Vue.nextTick()

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
  protected exit (): void {
    // reset validation (for next time)
    this.validate = false

    // emit exit event
    this.$emit('exit')
  }

  // Pass updated staff payment data to parent.
  @Emit('update:staffPaymentData')
  protected emitStaffPaymentData (staffPaymentData: StaffPaymentIF): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-dialog {
  .v-card {
    .v-card__title {
      padding: 1.25rem 2.5rem;
      font-weight: bold;

      .dialog-close {
        color: white !important;
        margin-right: -0.5rem;
      }
    }

    .v-card__text {
      padding: 2.5rem 2.5rem 0 !important;
      width: auto;
    }

    .v-card__actions {
      padding: 2.5rem !important;
    }
  }
}

.v-btn.primary {
  color: white !important;
  background-color: $app-blue !important;
}

.v-btn.button-blue {
  color: $app-blue !important;
  background-color: transparent !important;
  border: thin solid $app-blue !important;
}
</style>
