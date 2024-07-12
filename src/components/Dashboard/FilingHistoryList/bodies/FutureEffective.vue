<template>
  <div class="future-effective body-2">
    <h4>{{ _.subtitle }}</h4>

    <p>
      The {{ _.filingLabel }} date and time for {{ getLegalName || 'this company' }}
      will be <strong>{{ effectiveDateTime }}</strong>.
    </p>

    <p v-if="courtOrderNumber">
      Court Order Number: {{ courtOrderNumber }}
    </p>

    <p v-if="hasEffectOfOrder">
      Pursuant to a Plan of Arrangement
    </p>

    <p>
      If you wish to change the information in this {{ _.filingLabel }}, you must contact BC
      Registries staff to file a withdrawal. Withdrawing this {{ _.filingTitle }} will remove
      this {{ _.filingLabel }} and all associated information, and will incur a $20.00 fee.
    </p>

    <h4 class="mt-4">
      BC Registries Contact Information:
    </h4>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import { FilingNames } from '@bcrs-shared-components/enums'
import { useBusinessStore } from '@/stores'

@Component({
  components: { ContactInfo }
})
export default class FutureEffective extends Vue {
  @Getter(useBusinessStore) getLegalName!: string

  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: ApiFilingIF

  /** Data for the subject filing. */
  get _ (): any {
    if (EnumUtilities.isTypeIncorporationApplication(this.filing)) {
      return {
        subtitle: 'Future Effective Incorporation Date',
        filingLabel: 'incorporation',
        filingTitle: FilingNames.INCORPORATION_APPLICATION
      }
    }
    if (EnumUtilities.isTypeAlteration(this.filing)) {
      return {
        subtitle: 'Future Effective Alteration Date',
        filingLabel: 'alteration',
        filingTitle: 'Alteration Notice'
      }
    }
    if (EnumUtilities.isTypeDissolutionVoluntary(this.filing)) {
      return {
        subtitle: 'Future Effective Voluntary Dissolution Date',
        filingLabel: 'dissolution',
        filingTitle: FilingNames.VOLUNTARY_DISSOLUTION
      }
    }
    if (EnumUtilities.isTypeContinuationIn(this.filing)) {
      return {
        subtitle: 'Future Effective Incorporation Date',
        filingLabel: 'incorporation',
        filingTitle: FilingNames.CONTINUATION_IN_APPLICATION
      }
    }
    return {
      subtitle: 'Future Effective Filing Date',
      filingLabel: 'filing',
      filingTitle: 'filing'
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
