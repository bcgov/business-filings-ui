<template>
  <div class="online-banking-payment-pending body-2">
    <h4>Online Banking Payment Pending</h4>

    <p>This {{draftTitle}} is pending payment and/or processing at your bank.</p>

    <ul>
      <li>If you have not done so, <strong>log in to your online bank account</strong> to pay the
        outstanding balance on your BC Registries and Online Services account.</li>
      <li>Once submitted through your bank, Online Banking payments can take <strong>2 to 5 days to
        be processed</strong>.</li>
      <li><strong>Changes based on this {{draftTitle}} will not appear</strong> and <strong>other
        products and services</strong> for this business <strong>will not be available</strong> until
        the payment for this {{draftTitle}} is received by BC Registries and Online Services.</li>
      <li>You can <strong>use a credit card to pay</strong> for this {{draftTitle}} immediately by
        selecting "Change Payment Type".</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class PaymentPendingOnlineBanking extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The draft title of the subject filing. */
  private get draftTitle (): string {
    return this.filing?.draftTitle || 'filing'
  }
}
</script>

<style lang="scss" scoped>
h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

p:first-of-type {
  padding-top: 0.75rem;
}

p {
  margin-bottom: 0.5rem !important;
}

li {
  font-size: 0.75rem;
}
</style>
