<template>
  <VcardTemplate id="record-to-be-withdrawn">
    <template #icon>
      mdi-file-document-outline
    </template>

    <template #title>
      Record to be Withdrawn
    </template>

    <template #content>
      <v-row
        no-gutters
        class="px-6 py-7"
      >
        <v-col
          cols="12"
          sm="3"
          class="pr-4"
        >
          <strong>Filing Type</strong>
        </v-col>
        <v-col
          id="withdrawal-filing-type"
          cols="12"
          sm="9"
        >
          {{ getFilingToBeWithdrawn().displayName }}
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 py-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Filing Number</strong>
        </v-col>
        <v-col
          id="withdrawal-filing-number"
          cols="12"
          sm="9"
        >
          {{ filingToBeWithdrawn }}
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 py-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Effective Date and Time</strong>
        </v-col>
        <v-col
          id="withdrawal-filing-date"
          cols="12"
          sm="9"
        >
          {{ getFormattedFilingDate() }}
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { DateMixin } from '@/mixins'
import { Getter } from 'pinia-class'
import { VcardTemplate } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { useFilingHistoryListStore } from '@/stores/filingHistoryListStore'

@Component({
  components: {
    VcardTemplate
  }
})
export default class RecordToBeWithdrawn extends Mixins(DateMixin) {
  @Prop({ required: true }) readonly filingToBeWithdrawn!: string

  @Getter(useFilingHistoryListStore) getFilings!: Array<ApiFilingIF>

  getFilingToBeWithdrawn (): ApiFilingIF | null {
    const filingId = Number(this.filingToBeWithdrawn)
    const filings = this.getFilings as ApiFilingIF[]
    return filings.find(filing => filing.filingId === filingId) || null
  }

  getFormattedFilingDate (): string {
    const effectiveDate = this.getFilingToBeWithdrawn()?.effectiveDate
    if (effectiveDate) {
      const date = new Date(effectiveDate)
      return `${this.dateToPacificDateTime(date)}`
    }
    return 'Invalid date'
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.col-12 {
  font-size: $px-16;
}
</style>
