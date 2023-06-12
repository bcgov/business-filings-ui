<template>
  <FilingTemplate class="continuation-out" :filing="filing" :index="index">
    <template #body>
      <div v-if="isFilingComplete">
        <p class="mt-4">
          The Company {{ legalName }} was successfully
          <strong>Continued Out on
            {{ continuationOutDate }}, to {{ foreignJurisdiction }} under the name
            {{ legalName }}.
          </strong>
          The Company has been struck from the register and ceased to be an
          incorporated company under the Business Corporations Act.
          You are required to retain a copy of all the Continuation Out documents in your records books.
        </p>
        <p v-if="fileNumber" class="mt-4 mb-0">Court Order Number: {{ fileNumber }}</p>
        <p v-if="hasEffectOfOrder" class="mt-0">Pursuant to a Plan of Arrangement</p>
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
export default class ContinuationOut extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  get legalName (): string {
    return this.filing.data?.continuationOut?.legalName
  }

  get continuationOutDate (): string {
    const continuationOutDate = this.filing.data?.continuationOut?.continuationOutDate
    if (continuationOutDate) {
      return DateUtilities.apiToPacificDate(continuationOutDate, true)
    }
    return '[unknown]'
  }

  get foreignJurisdiction (): string {
    const foreignJurisdiction = this.filing.data?.continuationOut?.foreignJurisdiction
    if (foreignJurisdiction.region) {
      return foreignJurisdiction.region + ', ' + foreignJurisdiction.country
    } else {
      return foreignJurisdiction.country
    }
  }

  /** The court order file number. */
  get fileNumber (): string {
    return this.filing.data?.order?.fileNumber
  }

  /** Whether the court order has an effect of order. */
  get hasEffectOfOrder (): boolean {
    return Boolean(this.filing.data?.order?.effectOfOrder)
  }

  /** Whether the filing is complete. */
  get isFilingComplete (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
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
