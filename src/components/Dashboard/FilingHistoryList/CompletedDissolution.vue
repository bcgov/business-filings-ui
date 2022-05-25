<template>
  <div v-if="filing" class="completed-dissolution-details body-2">
    <h4>Dissolution Complete</h4>

    <p>
      The statement of dissolution for {{entityTitle}} {{getEntityName || ''}} was successfully
      submitted on <strong>{{dissolutionDateSubmitted}}</strong>
      with dissolution date of <strong>{{dissolutionDateTime}}</strong>.
      The {{entityTitle}} has been struck from the register and dissolved,
      and ceased to be a registered {{ entityTitle }}
      under the {{actTitle}}.
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
  @Prop({ required: true })
  readonly filing: HistoryItemIF

  @Getter isCoop!: boolean
  @Getter getEntityName!: string
  @Getter getDissolutionConfirmationResource!: DissolutionConfirmationResourceIF

  /** The entity title to display. */
  get entityTitle (): string {
    return this.getDissolutionConfirmationResource?.entityTitle
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
    return this.isCoop ? 'Cooperative Association Act' : 'Business Corporations Act'
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
