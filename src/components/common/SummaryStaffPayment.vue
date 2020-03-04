<template>
  <v-card flat id="summary-payment-container">
    <div class="payment-container">
      <label>Payment</label>
      <div class="value payment-received" v-if="routingSlipNumber">
        <p class="mb-0"><strong>Routing Slip Number:</strong> {{routingSlipNumber}}</p>
        <p class="mb-0" v-if="isPriority"><strong>Priority</strong></p>
      </div>
      <div class="value no-fee" v-if="isWaiveFees">
        <p class="mb-0">No Fee</p>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class SummaryStaffPayment extends Vue {
  /** Routing Slip Number prop. */
  @Prop({ default: '' })
  private routingSlipNumber: string

  /** Is Priority prop. */
  @Prop({ default: false })
  private isPriority: boolean

  /** Is Waive Fees prop. */
  @Prop({ default: false })
  private isWaiveFees: boolean
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

#summary-payment-container {
  margin-top: 1rem;
  padding: 1.25rem;
}

.payment-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  font-size: 1rem;

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

.value.payment-received,
.value.no-fee {
  min-width: 100%;
  line-height: 1.5rem;
}
</style>
