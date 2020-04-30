<template>
  <div class="pending-filing body-2 pb-6">
    <h4>Filing Pending</h4>
    <p class="pt-3">This {{title}} is paid, but the filing has not been completed by the BC
      Registry yet. Some filings may take longer than expected.</p>
    <p>If this issue persists, please contact us.</p>
    <ErrorContact class="pb-6" />
    <v-divider></v-divider>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ErrorContact } from '@/components/common'

@Component({
  components: { ErrorContact }
})
export default class PendingFiling extends Vue {
  /** The tite of the subject filing. */
  @Prop({ default: 'filing' })
  private title: object
}
</script>

<style lang="scss" scoped>
// @import "@/assets/styles/theme.scss";

h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
