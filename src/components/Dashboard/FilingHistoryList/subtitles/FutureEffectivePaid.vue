<template>
  <div class="future-effective-paid">
    <span v-if="isTypeIncorporationApplication">FUTURE EFFECTIVE INCORPORATION</span>
    <span v-else-if="isTypeAlteration">FUTURE EFFECTIVE ALTERATION</span>
    <span v-else-if="isTypeDissolutionVoluntary">FUTURE EFFECTIVE DISSOLUTION</span>
    <span v-else>FUTURE EFFECTIVE FILING</span>
    <span class="vert-pipe" />
    <span>PAID <FiledLabel :filing="filing" /></span>

    <v-btn
      class="details-btn"
      outlined
      color="primary"
      :ripple=false
      @click.stop="toggleFilingHistoryItem(index)"
    >
      <v-icon>mdi-information-outline</v-icon>
      <span class="view-details ml-1">View Details</span>
      <span class="hide-details ml-1">Hide Details</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'pinia-class'
import { ActionBindingIF, ApiFilingIF } from '@/interfaces'
import { EnumUtilities } from '@/services'
import FiledLabel from '../FiledLabel.vue'
import { useFilingHistoryListStore } from '@/stores'

@Component({
  components: { FiledLabel }
})
export default class FutureEffectivePaid extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: ActionBindingIF

  /** Whether this is an incorporation application. */
  get isTypeIncorporationApplication (): boolean {
    return EnumUtilities.isTypeIncorporationApplication(this.filing)
  }

  /** Whether this is an alteration. */
  get isTypeAlteration (): boolean {
    return EnumUtilities.isTypeAlteration(this.filing)
  }

  /** Whether this is a voluntary dissolution. */
  get isTypeDissolutionVoluntary (): boolean {
    return EnumUtilities.isTypeDissolutionVoluntary(this.filing)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.future-effective-paid {
  color: $gray7;
}

.details-btn {
  border: none;
}

// when panel is active, hide View button
.v-expansion-panel.v-expansion-panel--active .view-details {
  display: none;
}

// when panel is not active, hide Hide button
.v-expansion-panel:not(.v-expansion-panel--active) .hide-details {
  display: none;
}
</style>
