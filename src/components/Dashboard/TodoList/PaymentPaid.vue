<template>
  <div class="payment-paid body-2 pa-4">
    <h4>Paid</h4>

    <p>This filing is paid but the filing is not yet complete. Please check again later.</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class PaymentPaid extends Vue {}
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
