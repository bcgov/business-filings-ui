<template>
  <div class="payment-incomplete body-2 pa-4 mb-4">
    <h4>Payment Incomplete - {{title}}</h4>

    <p v-html="detail" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class PaymentIncomplete extends Vue {
  /** The subject filing. */
  @Prop() readonly filing: any

  /** The title of the subject filing. */
  private get title (): string {
    return this.filing?.payErrorObj?.title || ''
  }

  /** The detail of the subject filing. */
  private get detail (): string {
    return this.filing?.payErrorObj?.detail || ''
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

div {
  background-color: $app-bg-gray !important;
}

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
