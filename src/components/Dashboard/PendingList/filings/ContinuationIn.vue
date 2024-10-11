<template>
  <PendingTemplate
    class="continuation-in"
    :item="item"
    :index="index"
    @toggle-panel="$emit('toggle-panel')"
  >
    <template #body>
      <div class="body-2">
        <h4 v-if="isFutureEffectivePast || isFutureEffective">
          Future Effective Incorporation
        </h4>

        <p
          class="mb-0"
          :class="{ 'mt-4': isFutureEffectivePast || isFutureEffective }"
        >
          BC Registries will review your
          Continuation Authorization documents and contact you with the results within 2 business days.
        </p>

        <p
          v-if="isFutureEffectivePast"
          class="mt-4 mb-0"
        >
          If approved, the incorporation date and time for {{ getLegalName || 'this company' }} will be
          recorded as <strong>{{ effectiveDateTime || '[unknown]' }}</strong>.
        </p>

        <p
          v-if="isFutureEffective"
          class="mt-4 mb-0"
        >
          If approved, the incorporation date and time for {{ getLegalName || 'this company' }} will be
          <strong>{{ effectiveDateTime || '[unknown]' }}</strong>.
        </p>
      </div>
    </template>
  </PendingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useBusinessStore } from '@/stores'
import { DateUtilities } from '@/services'
import PendingTemplate from '../PendingTemplate.vue'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: {
    PendingTemplate
  }
})
export default class ContinuationIn extends Vue {
  @Prop({ required: true }) readonly item!: any
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) getLegalName!: string

  get entityType (): string {
    return GetCorpFullDescription(this.item.business.legalType)
  }

  get isFutureEffectivePast (): boolean {
    return (
      this.item.header.isFutureEffective &&
      DateUtilities.isDatePast(this.item.header.effectiveDate)
    )
  }

  get isFutureEffective (): boolean {
    return (
      this.item.header.isFutureEffective &&
      DateUtilities.isDateFuture(this.item.header.effectiveDate)
    )
  }

  get effectiveDateTime (): string {
    const effectiveDate = this.item.header.effectiveDate
    return effectiveDate ? DateUtilities.dateToPacificDateTime(new Date(effectiveDate)) : '[unknown]'
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
}
</style>
