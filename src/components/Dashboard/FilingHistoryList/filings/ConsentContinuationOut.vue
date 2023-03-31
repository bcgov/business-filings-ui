<template>
  <FilingTemplate class="consent-continuation-out" :filing="filing" :index="index">
    <template #body>
      <p class="mt-4">
        This consent is valid <strong>until {{ expiry }} at 12:01 am Pacific time</strong>.
      </p>
      <p v-if="orderDetails" class="mt-4">{{ orderDetails }}</p>
      <p v-if="fileNumber" class="mt-4 mb-0">Court Order Number: {{ fileNumber }}</p>
      <p v-if="planOfArrangement" class="mt-0">{{ planOfArrangement }}</p>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: { FilingTemplate }
})
export default class ConsentContinuationOut extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  get expiry (): string {
    // FUTURE: expiry date may come from business object
    return this.filing.data?.consentContinuationOut?.expiry || '[unknown]'
  }

  get orderDetails (): string {
    return this.filing.data?.consentContinuationOut?.orderDetails
  }

  /** The court order file number. */
  get fileNumber (): string {
    return this.filing.data?.order?.fileNumber
  }

  /** The court order plan of arrangement. */
  get planOfArrangement (): string {
    return this.filing.data?.order?.effectOfOrder ? 'Pursuant to a Plan of Arrangement' : null
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
