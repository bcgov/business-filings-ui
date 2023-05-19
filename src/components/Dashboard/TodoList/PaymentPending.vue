<template>
  <div class="payment-pending-details body-2 pa-4">
    <h4>Payment Incomplete</h4>

    <p class="pt-3 mb-2">
      This filing is pending payment. The payment may still be in progress or may have been
      interrupted for some reason.
    </p>

    <p class="mb-2">
      You may continue this filing by selecting "Resume Payment".
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class PaymentPending extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.payment-pending-details {
  background-color: $app-bg-gray !important;
}
</style>
