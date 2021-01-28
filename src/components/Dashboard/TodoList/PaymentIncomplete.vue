<template>
  <div class="payment-incomplete body-2 pa-4 mb-2">
    <h4>Payment Incomplete - {{title}}</h4>

    <p class="pt-3 mb-0" v-html="detail" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class PaymentIncomplete extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

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
</style>
