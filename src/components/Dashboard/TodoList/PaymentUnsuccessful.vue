<template>
  <div class="payment-unsuccessful-details body-2 pa-4">
    <h4>Payment Unsuccessful</h4>

    <p class="pt-3 mb-2">
      This filing is pending payment. The payment appears to have been unsuccessful for some
      reason.
    </p>

    <p class="mb-2">
      You may continue this filing by selecting "Retry Payment".
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class PaymentUnsuccessful extends Vue {}
</script>
