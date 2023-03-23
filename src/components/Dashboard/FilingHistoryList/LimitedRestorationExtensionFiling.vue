<template>
  <div v-if="filing" class="limited-restoration-extension-filing body-2">
    <h4>Extension of Limited Restoration</h4>

    <p>
      The period of restoration was successfuly extended and is active
      <strong>until {{ expiryDateFriendly }}</strong>. At the end of the extended limited
      restoration period, the company will be automatically dissolved. If you require assistance
      to extend a limited restoration/reinstatement or wish to convert your restoration from a
      limited period to a full restoration, please contact BC Registries staff:
    </p>

    <ContactInfo class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { HistoryItemIF } from '@/interfaces'
import { DateUtilities } from '@/services'

@Component({
  components: { ContactInfo }
})
export default class LimitedRestorationExtensionFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  /** The expiry date of the limited restoration extension filing. */
  get expiryDateFriendly (): string {
    const date = DateUtilities.yyyyMmDdToDate(this.filing.expiry)
    return (DateUtilities.dateToPacificDate(date, true) || 'Unknown')
  }
}

</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

p {
  color: $gray7;
  font-size: $px-15;
}
</style>
