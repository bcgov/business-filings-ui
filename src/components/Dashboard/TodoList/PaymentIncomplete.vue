<template>
  <div class="payment-incomplete body-2">
    <h4>Payment Incomplete</h4>

    <p>This filing is pending payment. The payment may still be in progress or may have been
      interrupted for some reason.</p>

    <p>You may continue this filing by selecting "Resume Payment".</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class PaymentIncomplete extends Vue {}
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
</style>
