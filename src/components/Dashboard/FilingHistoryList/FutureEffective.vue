<template>
  <div v-if="filing" class="future-effective-details body-2">
    <h4>{{_.subtitle}}</h4>

    <p>
      The {{_.filingLabel}} date and time for {{this.getEntityName || 'this company'}}
      will be <strong>{{effectiveDateTime}}</strong>.
    </p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>

    <p>
      If you wish to change the information in this {{_.filingLabel}}, you must contact
      Registry Staff to file a withdrawal. Withdrawing this {{_.filingTitle}} will remove
      this {{_.filingLabel}} and all associated information, and will incur a $20.00 fee.
    </p>

    <h4 class="font-14">Registries Contact Information:</h4>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'

@Component({
  components: { ContactInfo }
})
export default class FutureEffective extends Mixins(DateMixin) {
  @Getter getEntityName!: string

  /** The subject filing. */
  @Prop({ required: true })
  readonly filing: HistoryItemIF

  /** Data for the subject filing. */
  get _ (): any {
    if (this.filing.isFutureEffectiveIa) {
      return {
        subtitle: 'Future Effective Incorporation Date',
        filingLabel: 'incorporation',
        filingTitle: 'Incorporation Application'
      }
    }
    if (this.filing.isFutureEffectiveAlteration) {
      return {
        subtitle: 'Future Effective Alteration Date',
        filingLabel: 'alteration',
        filingTitle: 'Alteration Notice'
      }
    }
    return {
      subtitle: 'Future Effective Filing Date',
      filingLabel: 'filing',
      filingTitle: 'filing'
    }
  }

  /** The future effective datetime of the subject filing. */
  get effectiveDateTime (): string {
    return (this.dateToPacificDateTime(this.filing.effectiveDate) || 'Unknown')
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
