<template>
  <div class="future-effective-pending body-2">
    <h4>{{ _.subtitle }}</h4>

    <p>
      The {{ _.filingLabel }} date and time for {{ getLegalName || 'this company' }}
      has been recorded as <strong>{{ effectiveDateTime }}</strong>.
    </p>

    <p v-if="courtOrderNumber">
      Court Order Number: {{ courtOrderNumber }}
    </p>

    <p v-if="hasEffectOfOrder">
      Pursuant to a Plan of Arrangement
    </p>

    <p>
      It may take up to one hour to process this filing. If this issue persists,
      please contact us.
    </p>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import { useBusinessStore } from '@/stores'

@Component({
  components: { ContactInfo }
})
export default class FutureEffectivePending extends Vue {
  @Getter(useBusinessStore) getLegalName!: string

  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: ApiFilingIF

  /** Data for the subject filing. */
  get _ (): any {
    if (EnumUtilities.isTypeIncorporationApplication(this.filing)) {
      return {
        subtitle: 'Incorporation Pending',
        filingLabel: 'incorporation'
      }
    }
    if (EnumUtilities.isTypeAlteration(this.filing)) {
      return {
        subtitle: 'Alteration Pending',
        filingLabel: 'alteration'
      }
    }
    if (EnumUtilities.isTypeDissolutionVoluntary(this.filing)) {
      return {
        subtitle: 'Voluntary Dissolution Pending',
        filingLabel: 'dissolution'
      }
    }
    if (EnumUtilities.isTypeContinuationIn(this.filing)) {
      return {
        subtitle: 'Incorporation Pending',
        filingLabel: 'continuatin in'
      }
    }
    return {
      subtitle: 'Filing Pending',
      filingLabel: 'filing'
    }
  }

  /** The effective date-time of this filing. */
  get effectiveDateTime (): string {
    return this.filing.effectiveDate
      ? DateUtilities.dateToPacificDateTime(new Date(this.filing.effectiveDate))
      : '[unknown]'
  }

  /** The court order file number. */
  get courtOrderNumber (): string {
    return this.filing.data?.order?.fileNumber
  }

  /** Whether the court order has an effect of order. */
  get hasEffectOfOrder (): boolean {
    return Boolean(this.filing.data?.order?.effectOfOrder)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
  margin-bottom: 0 !important;
}
</style>
