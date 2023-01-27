<template>
  <div v-if="filing">
    <h4>Limited Restoration Period</h4>

    <p class="limited-restoration-period .font-15">
      The Company <strong>{{ filing.legalName }}</strong> was successfully
      restored and is active <strong>until {{ expiryDateFriendly }}</strong>.
      At the end of the limited restoration period, the company will be automatically dissolved.
      If you require assistance to extend a limited restoration/reinstatement or wish to convert
      your restoration from a limited period to a full restoration, please contact BC Registries staff:
    </p>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { HistoryItemIF } from '@/interfaces'
import { ContactInfo } from '@/components/common'
import { DateMixin } from '@/mixins'

@Component({
  components: { ContactInfo },
  mixins: [DateMixin]
})
export default class LimitedRestorationFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  /** The expiry datetime of the limited restoration filing. */
  get expiryDateFriendly (): string {
    return (this.formatYyyyMmDd(this.filing.expiry) || 'Unknown')
  }
}

</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.limited-restoration-period {
  color: $gray7
}
</style>
