<template>
  <div class="payment-incomplete-bcol body-2 pa-4 mb-2">
    <h4>Payment Incomplete - {{title}}</h4>

    <p class="pt-3 mb-0" v-html="detail" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class PaymentIncompleteBcol extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The title of the subject filing. */
  private get title (): string {
    return this.filing?.bcolErrObj?.title || ''
  }

  /** The detail of the subject filing. */
  private get detail (): string {
    return this.filing?.bcolErrObj?.detail || ''
  }
}
</script>

<style lang="scss" scoped>
.payment-incomplete-bcol {
  background-color: #f1f1f1 !important;
}

h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
