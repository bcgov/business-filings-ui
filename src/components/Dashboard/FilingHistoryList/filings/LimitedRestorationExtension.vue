<template>
  <FilingTemplate
    class="limited-restoration-extension"
    :filing="filing"
    :index="index"
  >
    <template #body>
      <h4>Extension of Limited Restoration</h4>

      <p>
        The period of restoration was successfuly extended and is active <strong>until
          {{ expiryDate }}</strong>. At the end of the extended limited restoration period, the
        company will be automatically dissolved. If you require assistance to extend a limited
        restoration/reinstatement or wish to convert your restoration from a limited period to
        a full restoration, please contact BC Registries staff:
      </p>

      <ContactInfo class="mt-4" />

      <p
        v-if="fileNumber"
        class="mt-4 mb-0"
      >
        Court Order Number: {{ fileNumber }}
      </p>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities } from '@/services'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: {
    ContactInfo,
    FilingTemplate
  }
})
export default class LimitedRestorationExtension extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  /** The expiry date of the limited restoration extension filing as a Pacific date. */
  get expiryDate (): string {
    const expiry = this.filing.data?.restoration?.expiry
    const date = DateUtilities.yyyyMmDdToDate(expiry)
    return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
  }

  /** The court order file number. */
  get fileNumber (): string {
    return this.filing.data?.order?.fileNumber
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem;
}
</style>
