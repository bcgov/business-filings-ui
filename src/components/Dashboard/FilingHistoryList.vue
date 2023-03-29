<template>
  <div id="filing-history-list">
    <AddCommentDialog
      :dialog="isAddCommentDialog"
      :filing="getCurrentFiling"
      @close="hideCommentDialog($event)"
      attach="#filing-history-list"
    />

    <DownloadErrorDialog
      :dialog="isDownloadErrorDialog"
      @close="mutateDownloadErrorDialog(false)"
      attach="#filing-history-list"
    />

    <LoadCorrectionDialog
      :dialog="isLoadCorrectionDialog"
      @exit="mutateLoadCorrectionDialog(false)"
      attach="#filing-history-list"
    />

    <FileCorrectionDialog
      :dialog="isFileCorrectionDialog"
      @exit="mutateFileCorrectionDialog(false)"
      @redirect="redirectFiling($event)"
      attach="#filing-history-list"
    />

    <!-- Court order notification -->
    <v-card v-if="hasCourtOrders" class="my-6 pa-6" elevation="0">
      <v-icon>mdi-gavel</v-icon>
      <span class="ml-1">Court order(s) have been filed on this company. Review the filing history for impacts
        to business information.</span>
    </v-card>

    <div class="scrollable-container" v-if="showHistoryPanel">
      <v-expansion-panels :value="getPanel">
        <component
          v-for="(filing, index) in getFilings"
          :is="is(filing)"
          :filing="filing"
          :index="index"
          :key="index"
        />
      </v-expansion-panels>
    </div>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="!showHistoryPanel">
      <v-card-text>
        <template v-if="isTemporaryRegistration">
          <div class="no-results__subtitle">Complete your filing to display</div>
        </template>

        <template v-if="isBusiness">
          <div class="no-results__title">You have no filing history</div>
          <div class="no-results__subtitle">Your completed filings and transactions will appear here</div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter, Mutation } from 'vuex-class'
import { AddCommentDialog, DownloadErrorDialog, FileCorrectionDialog, LoadCorrectionDialog }
  from '@/components/dialogs'
import { CorrectionTypes } from '@/enums'
import { ActionBindingIF, ApiFilingIF, CorrectionFilingIF } from '@/interfaces'
import { FilingMixin } from '@/mixins'
import { EnumUtilities, LegalServices } from '@/services/'
import { navigate } from '@/utils'
import * as Filings from './FilingHistoryList/filings'

@Component({
  components: {
    ...Filings,
    AddCommentDialog,
    DownloadErrorDialog,
    FileCorrectionDialog,
    LoadCorrectionDialog
  },
  mixins: [FilingMixin]
})
export default class FilingHistoryList extends Vue {
  @Prop({ default: null }) readonly highlightId!: number

  @Getter getCurrentFiling!: ApiFilingIF
  @Getter getEditUrl!: string
  @Getter getFilings!: Array<ApiFilingIF>
  @Getter getIdentifier!: string
  @Getter getPanel!: number
  @Getter isBenBcCccUlc!: boolean
  @Getter isFirm!: boolean
  @Getter isRoleStaff!: boolean
  @Getter hasCourtOrders!: boolean
  @Getter isAddCommentDialog!: boolean
  @Getter isDownloadErrorDialog!: boolean
  @Getter isLoadCorrectionDialog!: boolean
  @Getter isFileCorrectionDialog!: boolean

  @Action hideCommentDialog!: ActionBindingIF
  @Action toggleFilingHistoryItem!: ActionBindingIF

  @Mutation mutateDownloadErrorDialog!: (x: boolean) => void
  @Mutation mutateFetchingDataSpinner!: (x: boolean) => void
  @Mutation mutateFileCorrectionDialog!: (x: boolean) => void
  @Mutation mutateLoadCorrectionDialog!: (x: boolean) => void

  /** Whether this entity is a business (and not a temporary registration). */
  get isBusiness (): boolean {
    return !!sessionStorage.getItem('BUSINESS_ID')
  }

  /** Whether this entity is a temporary registration (and not a business). */
  get isTemporaryRegistration (): boolean {
    return !!sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Whether to show the history panel. */
  get showHistoryPanel () {
    return (this.getFilings.length > 0)
  }

  /** Returns the name of the sub-component to use for the specified filing. */
  protected is (filing: ApiFilingIF): string {
    switch (true) {
      case filing.availableOnPaperOnly: return 'paper-filing' // must come first
      case EnumUtilities.isTypeAlteration(filing): return 'alteration-filing'
      case EnumUtilities.isTypeChangeOfAddress(filing): return 'change-of-address'
      case EnumUtilities.isTypeConsentContinuationOut(filing): return 'consent-continuation-out'
      case EnumUtilities.isTypeDissolutionVoluntary(filing): return 'dissolution-voluntary'
      case EnumUtilities.isTypeIncorporationApplication(filing): return 'incorporation-application'
      case EnumUtilities.isTypeRestorationLimited(filing): return 'limited-restoration'
      case EnumUtilities.isTypeRestorationConversion(filing): return 'limited-restoration-conversion'
      case EnumUtilities.isTypeRestorationExtension(filing): return 'limited-restoration-extension'
      case EnumUtilities.isTypeRegistration(filing): return 'registration-filing'
      case EnumUtilities.isTypeStaff(filing): return 'staff-filing' // includes several filing types
      default: return 'default-filing'
    }
  }

  /**
   * Creates a draft correction and redirects to Edit UI.
   * Called by File Correction Dialog
   **/
  protected async redirectFiling (correctionType: CorrectionTypes): Promise<void> {
    try {
      // show spinner since the network calls below can take a few seconds
      this.mutateFetchingDataSpinner(true)

      // build correction filing
      let correctionFiling: CorrectionFilingIF
      if (this.isFirm || this.isBenBcCccUlc) {
        correctionFiling = this.buildCorrectionFiling(this.getCurrentFiling, correctionType)
      }

      if (!correctionFiling) throw new Error('Invalid filing type')

      // save draft filing
      const draftCorrection = await LegalServices.createFiling(this.getIdentifier, correctionFiling, true)
      const draftCorrectionId = +draftCorrection?.header?.filingId
      if (isNaN(draftCorrectionId)) {
        throw new Error('Invalid API response')
      }

      // navigate to Edit UI to complete this correction
      // NB: no need to clear spinner
      const correctionUrl =
        `${this.getEditUrl}${this.getIdentifier}/correction/?correction-id=${draftCorrectionId}`
      navigate(correctionUrl)
    } catch (error) {
      // clear spinner on error
      this.mutateFetchingDataSpinner(false)

      // eslint-disable-next-line no-console
      console.log('Error creating correction =', error)
      this.mutateLoadCorrectionDialog(true)
    }
  }

  @Watch('getFilings', { immediate: true })
  private onFilingsChange (): void {
    // if needed, highlight a specific filing
    if (this.highlightId) {
      const index = this.getFilings.findIndex(f => (f.filingId === this.highlightId))
      if (index >= 0) { // safety check
        this.toggleFilingHistoryItem(index, this.getFilings[index])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-icon.mdi-gavel {
  color: $gray9;
}

.scrollable-container {
  max-height: 60rem;
}

.filing-history-item {
  padding: 1.25rem 1.5rem;
  pointer-events: none; // disable expansion generally
}

:deep(.v-expansion-panel-header) {
  padding: 0;

  .v-expansion-panel-header__icon {
    display: none;
  }
}

// specifically enable anchors, buttons, the pending alert icon and tooltips
// for this page and sub-components
:deep() {
  a,
  .v-btn,
  .pending-alert .v-icon,
  .v-tooltip + div {
    pointer-events: auto;
  }
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 0;
}

:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}
</style>
