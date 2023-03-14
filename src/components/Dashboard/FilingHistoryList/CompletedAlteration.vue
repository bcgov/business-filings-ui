<template>
  <div v-if="filing" class="completed-alteration-details body-2">
    <h4>Alteration Complete</h4>

    <p v-if="filing.toLegalType !== filing.fromLegalType">
      {{getLegalName || 'This company'}} was successfully altered
      from a {{fromLegalType}} to a {{toLegalType}}
      on <DateTooltip :date="filing.effectiveDate" />.
    </p>

    <p v-if="filing.courtOrderNumber" class="mb-0">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement" class="mt-0">Pursuant to a Plan of Arrangement</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateTooltip } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: { DateTooltip }
})
export default class CompletedAlteration extends Vue {
  @Getter getLegalName!: string

  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  get fromLegalType (): string {
    return GetCorpFullDescription(this.filing?.fromLegalType)
  }

  get toLegalType (): string {
    return GetCorpFullDescription(this.filing?.toLegalType)
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
