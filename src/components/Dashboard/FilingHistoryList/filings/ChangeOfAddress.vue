<template>
  <FilingTemplate
    class="change-of-address"
    :filing="filing"
    :index="index"
  >
    <template #subtitle>
      <FutureEffectiveFiledAndPendingCoa
        v-if="isFutureEffective"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />
    </template>

    <template #body>
      <div v-if="isFutureEffective">
        <!-- no body in this case -->
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import FutureEffectiveFiledAndPendingCoa from '../subtitles/FutureEffectiveFiledAndPendingCoa.vue'
import FilingTemplate from '../FilingTemplate.vue'
import { useBusinessStore } from '@/stores'

@Component({
  components: {
    FutureEffectiveFiledAndPendingCoa,
    FilingTemplate
  }
})
export default class ChangeOfAddress extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) isBaseCompany!: boolean

  get isFutureEffective (): boolean {
    return (
      this.isBaseCompany &&
      this.filing.isFutureEffective &&
      EnumUtilities.isStatusPaid(this.filing) &&
      DateUtilities.isDateFuture(this.filing.effectiveDate)
    )
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header-subtitle {
  color: $gray7;
  margin-top: 0.5rem;
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
