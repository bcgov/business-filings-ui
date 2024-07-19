<template>
  <div id="pending-list">
    <v-expansion-panels :value="panel">
      <component
        :is="is(item)"
        v-for="(item, index) in getPendingsList"
        :key="index"
        :item="item"
        :index="index"
        @toggle-panel="togglePanel(index)"
      />
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { EnumUtilities } from '@/services/'
import { useRootStore } from '@/stores'
import * as Filings from './PendingList/filings'

@Component({
  components: {
    ...Filings
  }
})
export default class PendingList extends Vue {
  // local properties
  panel: number = null // currently expanded panel

  @Prop({ default: null }) readonly highlightId!: number

  @Getter(useRootStore) getPendingsList!: Array<any>

  /** Returns the name of the sub-component to use for the specified item. */
  is (item: any): string {
    switch (true) {
      case EnumUtilities.isTypeContinuationIn(item.header): return 'continuation-in'
      default: return 'default-filing'
    }
  }

  /**
   * This is called when the pendings list is initially populated.
   * If there is a filing ID to highlight then it finds it and expands its panel.
   */
  @Watch('getPendingsList', { immediate: true })
  async onPendingsChanged (): Promise<void> {
    // if needed, highlight a specific item
    if (this.highlightId) {
      const index = this.getPendingsList.findIndex(p => (p.header.filingId === this.highlightId))
      if (index >= 0) { // safety check
        this.togglePanel(index)
      }
    } else {
      // otherwise, open up the first item
      this.panel = 0
    }
  }

  togglePanel (item: number): void {
    // if panel is open, close it, else open it
    this.panel = (this.panel === item) ? null : item
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

:deep(.v-expansion-panel-header) {
  min-height: auto !important;
  padding: 0;
  margin-top: 0.25rem;
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 0;
}

:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}
</style>
