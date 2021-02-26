<template>
  <div v-if="filing" class="future-effective-pending-details body-2">
    <h4>{{_.subtitle}}</h4>

    <p>The {{_.filingLabel}} date and time for {{_.companyLabel}}
      has been recorded as {{effectiveDateTime}} Pacific Time.</p>

    <p>It may take up to one hour to process this filing.</p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>

    <p>If this issue persists, please contact us.</p>

    <contact-info class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'

@Component({
  computed: { ...mapState(['entityName']) },
  components: { ContactInfo }
})
export default class FutureEffectivePending extends Vue {
  readonly entityName!: string

  /** The subject filing. */
  @Prop({ required: true }) private filing: HistoryItemIF

  /** Data for the subject filing. */
  private get _ (): any {
    if (this.filing.isFutureEffectiveIaPending) {
      return {
        subtitle: 'Incorporation Pending',
        filingLabel: 'incorporation',
        companyLabel: (this.entityName || 'this Numbered Benefit Company')
      }
    }
    if (this.filing.isFutureEffectiveAlterationPending) {
      return {
        subtitle: 'Alteration Pending',
        filingLabel: 'alteration',
        companyLabel: (this.entityName || 'this company')
      }
    }
    return {
      subtitle: 'Filing Pending',
      filingLabel: 'filing',
      companyLabel: (this.entityName || 'this company')
    }
  }

  /** The future effective datetime of the subject filing. */
  private get effectiveDateTime (): string {
    return this.filing.effectiveDateTime || 'unknown'
  }
}
</script>

<style lang="scss" scoped>
h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

p:first-of-type,
p:last-of-type {
  padding-top: 0.75rem;
}

p {
  margin-bottom: 0.5rem !important;
}
</style>
