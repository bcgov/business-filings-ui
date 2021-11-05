<template>
  <v-card flat id="summary-payment-container">
    <div class="payment-container">
      <label>Payment</label>

      <template v-if="staffPaymentData.option === StaffPaymentOptions.FAS">
        <div class="value fas">
          <p><strong>Cash or Cheque</strong></p>
          <v-divider />
          <p><strong>Routing Slip Number:</strong> {{staffPaymentData.routingSlipNumber}}</p>
          <v-divider />
          <p><strong>Priority:</strong> {{staffPaymentData.isPriority ? "Yes": "No"}}</p>
        </div>
      </template>

      <template v-else-if="staffPaymentData.option === StaffPaymentOptions.BCOL">
        <div class="value bcol">
          <p><strong>BC Online</strong></p>
          <v-divider />
          <p><strong>BC Online Account Number:</strong> {{staffPaymentData.bcolAccountNumber}}</p>
          <p><strong>DAT Number:</strong> {{staffPaymentData.datNumber}}</p>
          <p><strong>Folio Number:</strong> {{staffPaymentData.folioNumber || "Not Provided"}}</p>
          <v-divider />
          <p><strong>Priority:</strong> {{staffPaymentData.isPriority ? "Yes": "No"}}</p>
        </div>
      </template>

      <template v-else-if="staffPaymentData.option === StaffPaymentOptions.NO_FEE">
        <div class="value no-fee">
          <p><strong>No Fee</strong></p>
          <v-divider />
          <p><strong>Priority:</strong> Not Available</p>
        </div>
      </template>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { StaffPaymentOptions } from '@/enums'
import { EmptyStaffPayment, StaffPaymentIF } from '@/interfaces'

@Component({})
export default class SummaryStaffPayment extends Vue {
  // Enum for template
  readonly StaffPaymentOptions = StaffPaymentOptions

  /** Staff Payment Data prop. */
  @Prop({ default: () => ({ ...EmptyStaffPayment }) })
  readonly staffPaymentData: StaffPaymentIF
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

#summary-payment-container {
  margin-top: 1rem;
  padding: 1.25rem;
}

.payment-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  font-size: $px-16;

  > label:first-child {
    font-weight: 700;
  }
}

@media (min-width: 768px) {
  .payment-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      padding-right: 2rem;
      width: 14rem;
    }
  }
}

.value.fas,
.value.bcol,
.value.no-fee {
  width: 100%;
  line-height: 1.5rem;

  p {
    margin: 0.5rem 0;
  }

  p:first-child {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  hr {
    margin: 1rem 0;
  }
}
</style>
