<template>
  <FilingTemplate
    class="agm-extension"
    :filing="filing"
    :index="index"
  >
    <template #body>
      <div>
        <p
          v-if="isFilingComplete && !isConsentExpired"
          class="mt-4"
        >
          This consent to continue out to XXX is valid <strong>until {{ expiry }}</strong>.
        </p>
        <p
          v-if="isConsentExpired"
          class="mt-4"
        >
          <v-icon
            class="warn-icon"
            left
            color="orange darken-2"
          >
            mdi-alert
          </v-icon>
          This consent is expired. Please resubmit the continue out application for authorization to become a foreign
          corporation.
        </p>
        <p
          v-if="orderDetails"
          class="mt-4"
          v-html="orderDetails"
        />
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import FilingTemplate from '../FilingTemplate.vue'
import { DateUtilities, EnumUtilities } from '@/services'
import { CountriesProvincesMixin } from '@/mixins'

@Component({
  components: { FilingTemplate }
})
export default class ConsentContinuationOut extends Mixins(CountriesProvincesMixin) {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  get expiry (): string {
    const expiry = this.filing.data?.consentContinuationOut?.expiry
    if (expiry) {
      return DateUtilities.apiToPacificDateTime(expiry, true)
    }
    return '[unknown]'
  }

  /** Check if Consent is Expired. */
  get isConsentExpired (): boolean {
    const date = DateUtilities.apiToDate(this.filing.data?.consentContinuationOut?.expiry)
    const daysToExpire = DateUtilities.daysBetweenTwoDates(new Date(), date)
    if (isNaN(daysToExpire) || daysToExpire < 0) {
      return true
    }
    return false
  }

  get orderDetails (): string {
    return this.filing.data?.order?.orderDetails?.replaceAll('\n', '<br/>')
  }

  /** Whether the filing is complete. */
  get isFilingComplete (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
  }

  private getRegionNameFromCode (short: string): string {
    if (short === 'FEDERAL') {
      return 'Federal'
    }

    const region = this.canadaUsaRegions?.find(region => region.short === short)
    return region?.name
  }

  /** Get the respective regions of the country selected as an array of objects. */
  get canadaUsaRegions (): Array<any> {
    const foreignJusrisdictionCountry = this.filing.data?.consentContinuationOut?.country
    if (foreignJusrisdictionCountry === 'CA') {
      return this.getCountryRegions('CA')
    } else if (foreignJusrisdictionCountry === 'US') {
      return this.getCountryRegions('US')
    }
    return []
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

.warn-icon {
    margin-bottom: 6px;
}

</style>
