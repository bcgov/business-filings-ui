<template>
  <FilingTemplate class="limited-restoration" :filing="filing" :index="index">
    <template #body>
      <h4>Limited Restoration Period</h4>

      <p class="mt-4">
        The Company <strong>{{ legalName }}</strong> was successfully restored and is active
        <strong>until {{ expiryDate }}</strong>. At the end of the limited restoration period,
        the company will be automatically dissolved. If you require assistance to extend a
        limited restoration/reinstatement or wish to convert your restoration from a limited
        period to a full restoration, please contact BC Registries staff:
      </p>

      <ContactInfo class="mt-4" />
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities } from '@/services'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: {
    ContactInfo,
    FilingTemplate
  }
})
export default class LimitedRestoration extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  /** The legal name from the restoration filing. */
  get legalName (): string {
    return this.filing.data?.restoration?.toLegalName || '[unknown]'
  }

  /** The expiry date of the limited restoration filing as a Pacific date. */
  get expiryDate (): string {
    const expiry = this.filing.data?.restoration?.expiry
    const date = DateUtilities.yyyyMmDdToDate(expiry)
    return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
}
</style>
