<template>
  <div v-if="filing" class="completed-alteration-details body-2">
    <h4>Alteration Complete</h4>

    <p v-if="filing.newLegalType !== filing.oldLegalType">
      {{entityName || 'This company'}} was successfully altered
      from a {{filing.oldLegalType}} to a {{filing.newLegalType}}
      on {{filing.effectiveDateTime}} Pacific Time.
    </p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { HistoryItemIF } from '@/interfaces'

@Component({
  computed: { ...mapState(['entityName']) }
})
export default class CompletedAlteration extends Vue {
  readonly entityName!: string

  /** The subject filing. */
  @Prop({ required: true }) private filing: HistoryItemIF
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 0.5rem !important;
}
</style>
