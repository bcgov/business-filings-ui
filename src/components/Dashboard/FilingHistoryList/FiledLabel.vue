<template>
  <div class="filed-label d-inline">
    <template v-if="isTypeStaff">
      <template v-if="putBackOnOrAdminDissolution">
        <span> (filed by {{ filing.submitter }} on <DateTooltip :date="submittedDate" />)</span>
        <span class="vert-pipe" />
        <span>EFFECTIVE as of <DateTooltip :date="effectiveDate" /></span>
      </template>
      <span v-else>Filed by {{ filing.submitter }} on <DateTooltip :date="submittedDate" /></span>
    </template>

    <template v-else>
      <span> (filed by {{ filing.submitter }} on <DateTooltip :date="submittedDate" />)</span>
      <span class="vert-pipe" />
      <span>EFFECTIVE as of <DateTooltip :date="effectiveDate" /></span>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateTooltip } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { EnumUtilities } from '@/services'

@Component({
  components: { DateTooltip }
})
export default class FiledLabel extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF

  get isTypeStaff (): boolean {
    return EnumUtilities.isTypeStaff(this.filing)
  }

  get putBackOnOrAdminDissolution (): boolean {
    return (
      EnumUtilities.isTypePutBackOn(this.filing) ||
      EnumUtilities.isTypeDissolutionAdministrative(this.filing)
    )
  }

  get submittedDate (): Date {
    return new Date(this.filing.submittedDate)
  }

  get effectiveDate (): Date {
    return new Date(this.filing.effectiveDate)
  }
}
</script>
