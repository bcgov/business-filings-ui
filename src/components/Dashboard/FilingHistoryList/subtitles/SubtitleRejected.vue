<template>
  <div class="subtitle-rejected">
    <span class="orange--text text--darken-2">REJECTED</span>
    <span class="vert-pipe" />
    <span>PAID (filed by {{ filing.submitter }} on <DateTooltip :date="submittedDate" />)</span>

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
import { ApiFilingIF } from '@/interfaces'
import { useFilingHistoryListStore } from '@/stores'
import { DateTooltip } from '@/components/common'
import FiledLabel from '../FiledLabel.vue'

@Component({
  components: {
    DateTooltip,
    FiledLabel
  }
})
export default class SubtitleRejected extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: (x: number) => Promise<void>

  get submittedDate (): Date {
    return new Date(this.filing.submittedDate)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.subtitle-rejected {
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

// when panel is active and this is a bootstrap filing, hide button
.v-expansion-panel.v-expansion-panel--active .bootstrap-filing {
  display: none;
}
</style>
