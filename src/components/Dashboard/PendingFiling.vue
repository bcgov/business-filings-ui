<template>
  <div class="pending-filing-body body-2">
    <h4>Filing Pending</h4>

    <p>This {{title}} is paid, but the filing has not been completed by the BC
      Registry yet. Some filings may take longer than expected.</p>
    <p>If this issue persists, please contact us.</p>

    <contact-info class="pt-3" />

    <div class="to-dashboard-container">
      <v-btn
        color="primary"
        @click.native.stop="returnToDashboard()"
        >
        <span>Return to Dashboard</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class PendingFiling extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The tite of the subject filing. */
  private get title (): string {
    return this.filing?.title || 'filing'
  }

  private returnToDashboard (): void {
    const businessesUrl = sessionStorage.getItem('BUSINESSES_URL') + 'business'
    window.location.assign(businessesUrl)
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

p:first-of-type {
  padding-top: 0.75rem;
}

p {
  margin-bottom: 0.5rem !important;
}
</style>
