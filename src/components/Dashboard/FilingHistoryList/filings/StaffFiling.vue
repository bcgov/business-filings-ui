<template>
  <FilingTemplate class="staff-filing" :filing="filing" :index="index">
    <template #title>
      <v-icon v-if="isTypeCourtOrder" class="pr-1">mdi-gavel</v-icon>
      <span>{{filing.displayName}}</span>
    </template>

    <template #subtitle>
      <div class="item-header-subtitle filed-staff">
        <span v-if="putBackOnOrAdminDissolution">FILED<FiledLabel :filing="filing"/></span>
        <span v-else><FiledLabel :filing="filing"/></span>
      </div>
    </template>

    <template #body>
      <div v-if="false" class="staff-filing-details body-2 mt-4">
        <p v-if="orderDetails" class="mt-4">{{ orderDetails }}</p>

        <!-- if we have documents, show them -->
        <!-- NB: only court orders have documents - see also FilingTemplate.vue -->
        <DocumentsList
          v-if="isTypeCourtOrder && filing.documents && filing.documents.length > 0"
          :filing=filing
        />

        <p v-if="fileNumber" class="xmt-4 xmb-0">Court Order Number: {{ fileNumber }}</p>

        <p v-if="isPlanOfArrangement || true" class="xmt-0">Pursuant to a Plan of Arrangement</p>
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { DocumentIF, ApiFilingIF } from '@/interfaces'
import { EnumUtilities } from '@/services'
import DocumentsList from '../DocumentsList.vue'
import FiledLabel from '../FiledLabel.vue'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: {
    DocumentsList,
    FiledLabel,
    FilingTemplate
  }
})
export default class StaffFiling extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  get isTypeCourtOrder (): boolean {
    return EnumUtilities.isTypeCourtOrder(this.filing)
  }

  get putBackOnOrAdminDissolution (): boolean {
    return (
      EnumUtilities.isTypePutBackOn(this.filing) ||
      EnumUtilities.isTypeDissolutionAdministrative(this.filing)
    )
  }

  get orderDetails (): string {
    return this.filing.data?.order?.orderDetails
  }

  /** The court order file number. */
  get fileNumber (): string {
    return this.filing.data?.order?.fileNumber
  }

  /** Whether the court order has an effect of order. */
  get isPlanOfArrangement (): boolean {
    return Boolean(this.filing.data?.order?.effectOfOrder)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header-subtitle {
  color: $gray6;
  margin-top: 0.5rem;
}

p {
  color: $gray7;
  font-size: $px-15;
}
</style>
