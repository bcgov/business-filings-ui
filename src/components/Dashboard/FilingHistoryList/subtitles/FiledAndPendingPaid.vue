<template>
  <div class="filed-and-pending-paid">
    <span class="orange--text text--darken-2">FILED AND PENDING</span>
    <span class="vert-pipe" />
    <span>PAID <FiledLabel :filing="filing" /></span>

    <v-btn
      class="details-btn"
      outlined
      color="orange darken-2"
      :ripple="false"
      @click.stop="toggleFilingHistoryItem(index)"
    >
      <v-icon>mdi-alert</v-icon>
      <span class="view-details ml-1">View Details</span>
      <span class="hide-details ml-1">Hide Details</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'pinia-class'
import { ActionBindingIF, ApiFilingIF } from '@/interfaces'
import FiledLabel from '../FiledLabel.vue'
import { useFilingHistoryListStore } from '@/stores'

@Component({
  components: { FiledLabel }
})
export default class FiledAndPendingPaid extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: ActionBindingIF
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.filed-and-pending-paid {
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
