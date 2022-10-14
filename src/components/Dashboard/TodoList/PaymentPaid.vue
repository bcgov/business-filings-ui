<template>
  <div class="payment-paid-details body-2 pa-4">
    <h4>Paid</h4>

    <p class="pt-3 mb-2">
      This filing is paid but the filing is not yet complete. Please check again later.
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({})
export default class PaymentPaid extends Vue {}
</script>
