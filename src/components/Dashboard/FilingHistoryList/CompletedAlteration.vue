<template>
  <div v-if="filing" class="completed-alteration-details body-2">
    <h4>Alteration Complete</h4>

    <p v-if="filing.newEntityType !== filing.oldEntityType">
      {{entityName || 'This company'}} was successfully altered
      from a {{filing.oldEntityType}} to a {{filing.newEntityType}}
      on {{filing.effectiveDateTime}} Pacific Time.
    </p>

    <!-- *** TODO: add properties to filing + update unit tests -->

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Part of an arrangement</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: { ...mapState(['entityName']) }
})
export default class CompletedAlteration extends Vue {
  readonly entityName!: string

  /** The subject filing. */
  @Prop({ required: true }) private filing: any
}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 0.5rem !important;
}
</style>
