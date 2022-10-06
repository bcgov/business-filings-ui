<template>
  <div v-if="filing" class="pending-filing-details body-2">
    <h4>Filing Pending</h4>

    <p>This {{title}} is paid, but the filing has not been completed by the Business Registry yet.
      Some filings may take longer than expected.</p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>

    <p>Refresh this screen in a few minutes or you can come back later to check on the progress.
      If this issue persists, please contact us.</p>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'
import { FilingNames } from '@/enums'
import { EnumMixin } from '@/mixins'

@Component({
  components: { ContactInfo },
  mixins: [EnumMixin]
})
export default class PendingFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  /** The title of the subject filing. */
  get title (): string {
    if (this.isTypeAlteration(this.filing)) return FilingNames.ALTERATION
    if (this.filing.displayName) return this.filing.displayName
    return 'Filing'
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
