<template>
  <div v-if="filing" class="completed-dissolution-details body-2">
    <h4>Dissolution Complete</h4>

    <p v-if="isFirm">
      The statement of dissolution for {{entityTitle}} {{getEntityName || ''}} was successfully
      submitted on <strong>{{dissolutionDateSubmitted}}</strong>
      with dissolution date of <strong>{{dissolutionDate}}</strong>.
      The {{entityTitle}} has been struck from the register and dissolved,
      and ceased to be a registered {{ entityTitle }}
      under the {{actTitle}} Act.
    </p>

    <p v-if="!isFirm">
      The {{entityTitle}} {{getEntityName || ''}} was successfully
      <strong>dissolved on {{dissolutionDateTime}}</strong>.
      The {{entityTitle}} has been struck from the register and dissolved,
      and ceased to be an incorporated {{entityTitle.toLowerCase()}}
      under the {{actTitle}} Act.
    </p>

    <p>
      <strong>You are required to retain a copy of all the dissolution documents
      in your records book.</strong>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { HistoryItemIF, DissolutionConfirmationResourceIF } from '@/interfaces'

@Component({})
export default class CompletedDissolution extends Mixins(DateMixin) {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  @Getter isCoop!: boolean
  @Getter isFirm!: boolean
  @Getter getEntityName!: string
  @Getter getDissolutionConfirmationResource!: DissolutionConfirmationResourceIF

  /** The entity title to display. */
  get entityTitle (): string {
    return this.getDissolutionConfirmationResource?.entityTitle || 'Unknown Entity'
  }

  /** The dissolution date to display. */
  get dissolutionDate (): string {
    return (this.dateToPacificDate(this.filing?.effectiveDate, true) || 'Unknown')
  }

  /** The dissolution date-time to display. */
  get dissolutionDateTime (): string {
    return (this.dateToPacificDateTime(this.filing?.effectiveDate) || 'Unknown')
  }

  /** The dissolution date-time submitted to display. */
  get dissolutionDateSubmitted (): string {
    return (this.dateToPacificDateTime(this.filing?.submittedDate) || 'Unknown')
  }

  /** The act title to display. */
  get actTitle (): string {
    return this.getDissolutionConfirmationResource?.act || 'Unknown'
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
