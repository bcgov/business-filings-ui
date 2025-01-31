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
        class="px-5 py-4"
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
        class="px-5 py-4"
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
        class="px-5 py-4"
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
        class="px-5 pt-6"
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
          <v-checkbox
            id="plan-of-arrangement-checkbox"
            v-model="partOfPoa"
            class="mt-0 pt-0"
            hide-details
          >
            <template #label>
              <span class="font-16 grey-text">The record to be withdrawn is part of a Plan of Arrangement.</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-5 pt-4 pb-8"
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
            id="has-taken-effect-checkbox"
            v-model="hasTakenEffect"
            class="mt-0 pt-0"
            hide-details
            :disabled="!partOfPoa"
          >
            <template #label>
              <span class="font-16 grey-text">
                At least one of the terms of the arrangement have taken effect.
              </span>
            </template>
          </v-checkbox>
          <MessageBox
            v-if="hasTakenEffect"
            id="poa-error"
            class="mt-6"
            color="red"
          >
            <header>
              <v-icon
                color="red"
                class="error-icon"
              >
                mdi-alert
              </v-icon>
              <strong class="pl-2 gray9--text text-small-text">Warning</strong>
            </header>
            <article class="pl-8 pt-1 small-text">
              If you want to withdraw a record that is part of a Plan of Arrangement,
              you must withdraw all records related to the arrangement.
              This must be done before any of the provisions of the arrangement take effect.
            </article>
          </MessageBox>
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Emit, Watch } from 'vue-property-decorator'
import { DateMixin } from '@/mixins'
import { Getter } from 'pinia-class'
import { MessageBox, VcardTemplate } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import { useFilingHistoryListStore } from '@/stores/filingHistoryListStore'

@Component({
  components: {
    MessageBox,
    VcardTemplate
  }
})
export default class RecordToBeWithdrawn extends Mixins(DateMixin) {
  @Prop({ required: true }) readonly filingToBeWithdrawn!: string

  @Getter(useFilingHistoryListStore) getFilings!: Array<ApiFilingIF>

  // Local properties
  private partOfPoa = false
  private hasTakenEffect = false

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

  @Watch('partOfPoa')
  private onpartOfPoaChange (newVal: boolean): void {
    // If partOfPoa is false, reset hasTakenEffect to false
    if (!newVal) {
      this.hasTakenEffect = false
    }
  }

  /** Emit plan of arrangement. */
  @Watch('partOfPoa')
  @Emit('partOfPoa')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitPoa (partOfPoa: boolean): void {}

  /** Emit come into effect. */
  @Watch('hasTakenEffect')
  @Emit('hasTakenEffect')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitEffect (hasTakenEffect: boolean): void {}
}
</script>
