<template>
  <div v-if="filing" class="pending-filing-details body-2">
    <h4>Filing Pending</h4>

    <p>This {{title}} is paid, but the filing has not been completed by the BC
      Registry yet. Some filings may take longer than expected.</p>

    <p v-if="filing.courtOrderNumber">Court Order Number: {{filing.courtOrderNumber}}</p>

    <p v-if="filing.isArrangement">Pursuant to a Plan of Arrangement</p>

    <p>If this issue persists, please contact us.</p>

    <contact-info class="pt-3" />

    <div class="to-dashboard-container">
      <v-btn color="primary" @click.native.stop="returnToDashboard()">
        <span>Return to Dashboard</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'
import { FilingTypes } from '@/enums'

@Component({
  components: { ContactInfo }
})
export default class PendingFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) private filing: HistoryItemIF

  /** The title of the subject filing. */
  private get title (): string {
    if (this.filing.filingType === FilingTypes.ALTERATION) return 'Alteration'
    if (this.filing.title) return this.filing.title
    return 'Filing'
  }

  /** The Manage Businesses URL string. */
  private get manageBusinessesUrl (): string {
    return sessionStorage.getItem('AUTH_URL') + 'business'
  }

  private returnToDashboard (): void {
    window.location.assign(this.manageBusinessesUrl) // assume URL is always reachable
  }
}
</script>

<style lang="scss" scoped>
.to-dashboard-container {
  text-align: center;
  padding: 1rem;
}

h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

p:first-of-type,
p:last-of-type {
  padding-top: 0.75rem;
}

p {
  margin-bottom: 0.5rem !important;
}
</style>
