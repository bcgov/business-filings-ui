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
        class="px-6 py-4"
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
          class="grey-text"
        >
          {{ getFilingToBeWithdrawn().displayName }}
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 py-4"
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
          class="grey-text"
        >
          {{ filingToBeWithdrawn }}
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 py-4"
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
          class="grey-text"
        >
          {{ getFormattedFilingDate() }}
        </v-col>
      </v-row>
      <v-divider class="mt-2 mx-4" />
      <v-row
        no-gutters
        class="px-6 pt-6"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Plan of Arrangement</strong>
        </v-col>
        <v-col
          cols="12"
          sm="9"
        >
          <p class="grey-text">
            If you want to withdraw a record that is part of a plan of arrangement,
            you must withdraw all records related to the arrangement.
            This must be done before any of the terms of the arrangement take effect.
          </p>
          <v-checkbox
            id="plan-of-arrangement-checkbox"
            v-model="planOfArrangement"
            class="mt-0 pt-0"
            hide-details
            label="The record to be withdrawn is part of a Plan of Arrangement."
          >
            <template #label>
              <span class="checkbox-label grey-text">The record to be withdrawn is part of a Plan of Arrangement.</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-6 py-4"
      >
        <v-col
          cols="12"
          sm="3"
        />
        <v-col
          cols="12"
          sm="9"
          class="pt-0"
        >
          <v-checkbox
            id="come-into-effect-checkbox"
            v-model="comeIntoEffect"
            class="mt-0 pt-0"
            hide-details
            :disabled="!planOfArrangement"
          >
            <template #label>
              <span class="checkbox-label grey-text">
                At least one of the terms of the arrangement have taken effect.
              </span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Emit, Watch } from 'vue-property-decorator'
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

  /** Draft plan of arrangement. */
  @Prop({ default: false }) readonly hasDraftPlanOfArrangement!: boolean

  /** Draft come into effect. */
  @Prop({ default: false }) readonly hasDraftComeIntoEffect!: boolean

  @Getter(useFilingHistoryListStore) getFilings!: Array<ApiFilingIF>

  // Local properties
  private planOfArrangement = false
  private comeIntoEffect = false

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

  @Watch('planOfArrangement')
  private onPlanOfArrangementChange (newVal: boolean): void {
    // If planOfArrangement is false, reset comeIntoEffect to false
    if (!newVal) {
      this.comeIntoEffect = false
    }
  }

  /** Emit plan of arrangement. */
  @Watch('planOfArrangement')
  @Emit('planOfArrangement')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitPoa (planOfArrangement: boolean): void {}

  /** Emit come into effect. */
  @Watch('comeIntoEffect')
  @Emit('comeIntoEffect')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitEffect (planOfArrangement: boolean): void {}
}
</script>

<style scoped>
.checkbox-label {
  font-size: 14px;
}
</style>
