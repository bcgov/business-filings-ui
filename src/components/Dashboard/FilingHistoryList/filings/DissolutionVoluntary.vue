<template>
  <FilingTemplate
    class="dissolution-voluntary"
    :filing="filing"
    :index="index"
  >
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
        :filing="filing"
      />

      <FutureEffective
        v-else-if="isFutureEffective"
        :filing="filing"
      />

      <div
        v-else-if="isStatusCompleted"
        class="completed-dissolution-details"
      >
        <h4>Dissolution Complete</h4>

        <p v-if="isFirm">
          The statement of dissolution for {{ entityTitle }} {{ getLegalName || '' }}
          was successfully submitted on <strong>{{ dissolutionDateSubmitted }}</strong>
          with dissolution date of <strong>{{ dissolutionDate }}</strong>.
          The {{ entityTitle }} has been struck from the register and dissolved,
          and ceased to be a registered {{ entityTitle }}
          under the {{ actTitle }} Act.
        </p>

        <p v-if="!isFirm">
          The {{ entityTitle }} {{ getLegalName || '' }} was successfully
          <strong>dissolved on {{ dissolutionDateTime }}</strong>.
          The {{ entityTitle }} has been struck from the register and dissolved,
          and ceased to be an incorporated {{ entityTitle.toLowerCase() }}
          under the {{ actTitle }} Act.
        </p>

        <p class="font-weight-bold">
          You are required to retain a copy of all the dissolution documents in your
          records book.
        </p>
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ApiFilingIF, DissolutionConfirmationResourceIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import FiledAndPendingPaid from '../subtitles/FiledAndPendingPaid.vue'
import FilingTemplate from '../FilingTemplate.vue'
import FutureEffective from '../bodies/FutureEffective.vue'
import FutureEffectivePaid from '../subtitles/FutureEffectivePaid.vue'
import FutureEffectivePending from '../bodies/FutureEffectivePending.vue'
import { useBusinessStore, useRootStore } from '@/stores'

@Component({
  components: {
    FiledAndPendingPaid,
    FilingTemplate,
    FutureEffective,
    FutureEffectivePaid,
    FutureEffectivePending
  }
})
export default class DissolutionVoluntary extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useRootStore) getDissolutionConfirmationResource!: DissolutionConfirmationResourceIF
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useBusinessStore) isFirm!: boolean

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

  /** The entity title to display. */
  get entityTitle (): string {
    return this.getDissolutionConfirmationResource?.entityTitle || '[unknown]'
  }

  /** The dissolution date to display. */
  get dissolutionDate (): string {
    const dissolutionDate = this.filing.data?.dissolution?.dissolutionDate
    const date = DateUtilities.yyyyMmDdToDate(dissolutionDate)
    return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
  }

  /** The dissolution date-time to display. */
  get dissolutionDateTime (): string {
    return this.filing.effectiveDate
      ? DateUtilities.dateToPacificDateTime(new Date(this.filing.effectiveDate))
      : '[unknown]'
  }

  /** The dissolution date-time submitted to display. */
  get dissolutionDateSubmitted (): string {
    return this.filing.submittedDate
      ? DateUtilities.dateToPacificDateTime(new Date(this.filing.submittedDate))
      : '[unknown]'
  }

  /** The act title to display. */
  get actTitle (): string {
    return this.getDissolutionConfirmationResource?.act || '[unknown]'
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header-subtitle {
  color: $gray7;
  margin-top: 0.5rem;
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
