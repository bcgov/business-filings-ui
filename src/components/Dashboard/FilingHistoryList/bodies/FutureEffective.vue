<template>
  <div class="future-effective body-2">
    <h4>{{_.subtitle}}</h4>

    <p>
      The {{_.filingLabel}} date and time for {{getLegalName || 'this company'}}
      will be <strong>{{effectiveDateTime}}</strong>.
    </p>

    <p v-if="filing.courtOrderNumber">
      Court Order Number: {{filing.courtOrderNumber}}
    </p>

    <p v-if="filing.isArrangement">
      Pursuant to a Plan of Arrangement
    </p>

    <p>
      If you wish to change the information in this {{_.filingLabel}}, you must contact BC
      Registries staff to file a withdrawal. Withdrawing this {{_.filingTitle}} will remove
      this {{_.filingLabel}} and all associated information, and will incur a $20.00 fee.
    </p>

    <h4 class="font-14">BC Registries Contact Information:</h4>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'

@Component({
  components: { ContactInfo }
})
export default class FutureEffective extends Vue {
  @Getter getLegalName!: string

  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: ApiFilingIF

  /** Data for the subject filing. */
  get _ (): any {
    if (EnumUtilities.isTypeIncorporationApplication(this.filing)) {
      return {
        subtitle: 'Future Effective Incorporation Date',
        filingLabel: 'incorporation',
        filingTitle: 'Incorporation Application'
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
        filingTitle: 'Voluntary Dissolution'
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
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  font-size: $px-15;
  margin-top: 1rem;
}
</style>
