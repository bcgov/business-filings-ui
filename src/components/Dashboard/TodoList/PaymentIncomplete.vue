<template>
  <div class="payment-incomplete-details text-body-2 pa-4">
    <h4>Payment Incomplete - {{ title }}</h4>

    <p
      class="pt-3 mb-2"
      v-html="detail"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class PaymentIncomplete extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: any

  /** The title of the subject filing. */
  get title (): string {
    return this.filing?.payErrorObj?.title || ''
  }

  /** The detail of the subject filing. */
  get detail (): string {
    return this.filing?.payErrorObj?.detail || ''
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.payment-incomplete-details {
  background-color: $app-bg-gray !important;
}
</style>
