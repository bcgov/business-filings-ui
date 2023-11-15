<template>
  <FilingTemplate
    class="agm-extension"
    :filing="filing"
    :index="index"
  >
    <template #body>
      <div v-if="isFilingComplete">
        <p class="mt-4">
          The {{ agmYear }} AGM must be held by <strong>{{ agmDueDate }}</strong>.
        </p>
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import FilingTemplate from '../FilingTemplate.vue'
import { DateUtilities, EnumUtilities } from '@/services'

@Component({
  components: { FilingTemplate }
})
export default class ConsentContinuationOut extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  /** Whether the filing is complete. */
  get isFilingComplete (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
  }

  get agmYear (): string {
    return this.filing.data?.agmExtension?.year || '[unknown]'
  }

  get agmDueDate (): string {
    const yyyyMmDd = this.filing.data?.agmExtension?.expireDateApprovedExt
    const date = DateUtilities.yyyyMmDdToDate(yyyyMmDd)
    const pacificDate = DateUtilities.dateToPacificDate(date, true)
    if (pacificDate) return `${pacificDate} at 11:59 pm Pacific time`
    return '[unknown]'
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
