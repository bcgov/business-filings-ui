<template>
  <div v-if="filing" class="completed-dissolution-details body-2">
    <h4>Dissolution Complete</h4>

    <p>
      The {{entityTitle}} {{getEntityName || ''}} was successfully
      <strong>dissolved on {{dissolutionDateTime}}</strong>.
      The {{entityTitle}} has been struck from the register and dissolved,
      and ceased to be an incorporated {{entityTitle.toLowerCase()}}
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
import { HistoryItemIF } from '@/interfaces'

@Component({})
export default class CompletedDissolution extends Mixins(DateMixin) {
  /** The subject filing. */
  @Prop({ required: true })
  readonly filing: HistoryItemIF

  @Getter isCoop!: boolean
  @Getter getEntityName!: string

  /** The entity title to display. */
  get entityTitle (): string {
    return this.isCoop ? 'Cooperative Association' : 'Company'
  }

  /** The dissolution date-time to display. */
  get dissolutionDateTime (): string {
    return (this.dateToPacificDateTime(this.filing?.effectiveDate) || 'Unknown')
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
