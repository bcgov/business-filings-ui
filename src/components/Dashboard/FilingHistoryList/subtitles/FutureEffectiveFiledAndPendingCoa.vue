<template>
  <div class="future-effective-filed-and-pending-coa">
    <span>FILED AND PENDING <FiledLabel :filing="filing" /></span>

    <v-tooltip top content-class="pending-tooltip">
      <template v-slot:activator="{ on }">
        <div class="pending-alert" v-on="on">
          <v-icon color="orange darken-2">mdi-alert</v-icon>
        </div>
      </template>
      The updated office addresses will be legally effective on
      {{ effectiveDateTime }}. No other filings are allowed until then.
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities } from '@/services'
import FiledLabel from '../FiledLabel.vue'

@Component({
  components: { FiledLabel }
})
export default class FutureEffectiveFiledAndPendingCoa extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  /** The effective date-time of this filing. */
  get effectiveDateTime (): string {
    return this.filing.effectiveDate
      ? DateUtilities.dateToPacificDateTime(new Date(this.filing.effectiveDate))
      : '[unknown]'
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.pending-tooltip {
  max-width: 16.5rem;
}

.pending-alert .v-icon {
  font-size: 18px; // same as other v-icons
  padding-left: 0.875rem;
}

.future-effective-filed-and-pending-coa {
  color: $gray7;
}
</style>
