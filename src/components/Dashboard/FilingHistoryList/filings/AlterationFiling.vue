<template>
  <FilingTemplate class="alteration-filing" :filing="filing" :index="index">
    <template #subtitle>
      <FiledAndPendingPaid
        v-if="isFutureEffectivePending"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />

      <FutureEffectivePaid
        v-else-if="isFutureEffective"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />
    </template>

    <template #body>
      <FutureEffectivePending
        v-if="isFutureEffectivePending"
        :filing=filing
      />

      <FutureEffective
        v-else-if="isFutureEffective"
        :filing=filing
      />

      <div
        v-else-if="isStatusCompleted"
        class="completed-alteration-details"
      >
        <h4>Alteration Complete</h4>

        <p v-if="fromLegalType !== toLegalType">
          {{ getLegalName || 'This company' }} was successfully altered
          from a {{ GetCorpFullDescription(fromLegalType) }}
          to a {{ GetCorpFullDescription(toLegalType) }}
          on <DateTooltip :date="effectiveDate" />.
        </p>

        <p v-if="courtOrderNumber" class="mb-0">
          Court Order Number: {{ courtOrderNumber }}
        </p>

        <p v-if="isArrangement" class="mt-0">
          Pursuant to a Plan of Arrangement
        </p>
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import { DateTooltip } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import FiledAndPendingPaid from '../subtitles/FiledAndPendingPaid.vue'
import FilingTemplate from '../FilingTemplate.vue'
import FutureEffective from '../bodies/FutureEffective.vue'
import FutureEffectivePaid from '../subtitles/FutureEffectivePaid.vue'
import FutureEffectivePending from '../bodies/FutureEffectivePending.vue'
import { useBusinessStore } from '@/stores'

@Component({
  components: {
    DateTooltip,
    FiledAndPendingPaid,
    FilingTemplate,
    FutureEffective,
    FutureEffectivePaid,
    FutureEffectivePending
  }
})
export default class AlterationFiling extends Vue {
  readonly GetCorpFullDescription = GetCorpFullDescription

  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) getLegalName!: string

  /** Whether this filing is in Complete status. */
  get isStatusCompleted (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
  }

  /** Whether this filing is Future Effective Pending (overdue). */
  get isFutureEffectivePending (): boolean {
    return (
      EnumUtilities.isStatusPaid(this.filing) &&
      this.filing.isFutureEffective &&
      DateUtilities.isDatePast(this.filing.effectiveDate)
    )
  }

  /** Whether this filing is Future Effective (not yet completed). */
  get isFutureEffective (): boolean {
    return (
      EnumUtilities.isStatusPaid(this.filing) &&
      this.filing.isFutureEffective &&
      DateUtilities.isDateFuture(this.filing.effectiveDate)
    )
  }

  /** The completed alteration court order number. */
  get courtOrderNumber (): string {
    return this.isStatusCompleted
      ? this.filing.data?.order?.fileNumber
      : null
  }

  /** Whether completed alteration is pursuant to a plan of arrangement. */
  get isArrangement (): boolean {
    return this.isStatusCompleted
      ? EnumUtilities.isEffectOfOrderPlanOfArrangement(this.filing.data?.order?.effectOfOrder)
      : null
  }

  /** The completed alteration "from" legal type. */
  get fromLegalType (): CorpTypeCd {
    return this.filing.data?.alteration?.fromLegalType
  }

  /** The completed alteration "to" legal type. */
  get toLegalType (): CorpTypeCd {
    return this.filing.data?.alteration?.toLegalType
  }

  get effectiveDate (): Date {
    return new Date(this.filing.effectiveDate)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header-subtitle {
  color: $gray6;
  margin-top: 0.5rem;
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
