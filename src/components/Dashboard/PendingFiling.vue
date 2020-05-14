<template>
  <div class="pending-filing body-2">
    <h4>Filing Pending</h4>

    <p>This {{title}} is paid, but the filing has not been completed by the BC
      Registry yet. Some filings may take longer than expected.</p>
    <p>If this issue persists, please contact us.</p>

    <ErrorContact />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ErrorContact } from '@/components/common'

@Component({
  components: { ErrorContact }
})
export default class PendingFiling extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The tite of the subject filing. */
  private get title (): string {
    return this.filing?.title || 'filing'
  }
}
</script>

<style lang="scss" scoped>
// @import "@/assets/styles/theme.scss";

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

.error-contact {
  padding-top: 0.75rem;
}
</style>
