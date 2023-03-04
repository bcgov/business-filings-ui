<template>
  <div v-if="filing" class="future-effective-pending-details body-2">
    <h4>{{_.subtitle}}</h4>

    <p>
      The {{_.filingLabel}} date and time for {{this.getLegalName || 'this company'}}
      has been recorded as <strong>{{effectiveDateTime}}</strong>.
    </p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>

    <p>
      It may take up to one hour to process this filing. If this issue persists,
      please contact us.
    </p>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'

@Component({
  components: { ContactInfo },
  mixins: [DateMixin]
})
export default class FutureEffectivePending extends Vue {
  @Getter getLegalName!: string

  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  /** Data for the subject filing. */
  get _ (): any {
    if (this.filing.isFutureEffectiveIaPending) {
      return {
        subtitle: 'Incorporation Pending',
        filingLabel: 'incorporation'
      }
    }
    if (this.filing.isFutureEffectiveAlterationPending) {
      return {
        subtitle: 'Alteration Pending',
        filingLabel: 'alteration'
      }
    }
    return {
      subtitle: 'Filing Pending',
      filingLabel: 'filing'
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
