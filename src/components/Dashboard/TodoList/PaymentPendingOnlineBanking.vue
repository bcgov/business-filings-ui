<template>
  <div class="payment-pending-online-banking-details body-2 pa-4">
    <h4>Online Banking Payment Pending</h4>

    <p class="pt-3 mb-2">
      This {{ draftTitle }} is pending payment and/or processing at your bank.
    </p>

    <ul>
      <li>
        If you have not done so, <strong>log in to your online bank account</strong> to pay the
        outstanding balance on your BC Registries and Online Services account.
      </li>
      <li>
        Enter <strong>"BC Registries and Online Services"</strong> as payee.
      </li>
      <li>
        Enter the following account number: <strong>{{ cfsAccountId }}</strong>
      </li>
      <li>
        Once submitted through your bank, Online Banking payments can take <strong>2 to 5 days to
          be processed</strong>.
      </li>
      <li>
        <strong>Changes based on this {{ draftTitle }} will not appear</strong> and <strong>other
          products and services</strong> for this business <strong>will not be available</strong> until
        the payment for this {{ draftTitle }} is received by BC Registries and Online Services.
      </li>
      <li>
        You can <strong>use a credit card to pay</strong> for this {{ draftTitle }} immediately by
        selecting "Change Payment Type".
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PayServices } from '@/services/'

@Component({})
export default class PaymentPendingOnlineBanking extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: any
  @Prop({ required: true }) readonly payApiUrl!: string
  @Prop({ required: true }) readonly accountId!: string

  cfsAccountId: string = null;

  /** The draft title of the subject filing. */
  get draftTitle (): string {
    return this.filing?.draftTitle || 'filing'
  }

  async mounted () {
    this.cfsAccountId = await PayServices.fetchCfsAccountId(this.payApiUrl, +this.accountId)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

li {
  font-size: $px-12;
}
</style>
