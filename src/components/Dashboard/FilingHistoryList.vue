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
      @close="setDownloadErrorDialog(false)"
      attach="#filing-history-list"
    />

    <LoadCorrectionDialog
      :dialog="isLoadCorrectionDialog"
      @exit="setLoadCorrectionDialog(false)"
      attach="#filing-history-list"
    />

    <FileCorrectionDialog
      :dialog="isFileCorrectionDialog"
      @exit="setFileCorrectionDialog(false)"
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
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { AddCommentDialog, DownloadErrorDialog, FileCorrectionDialog, LoadCorrectionDialog }
  from '@/components/dialogs'
import { CorrectionTypes } from '@/enums'
import { ActionBindingIF, ApiFilingIF, CorrectionFilingIF } from '@/interfaces'
import { FilingMixin } from '@/mixins'
import { EnumUtilities, LegalServices } from '@/services/'
import { navigate } from '@/utils'
import * as Filings from './FilingHistoryList/filings'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({
  components: {
    ...Filings,
    AddCommentDialog,
    DownloadErrorDialog,
    FileCorrectionDialog,
    LoadCorrectionDialog
  }
})
export default class FilingHistoryList extends Mixins(FilingMixin) {
  @Prop({ default: null }) readonly highlightId!: number

  @Getter(useFilingHistoryListStore) getCurrentFiling!: ApiFilingIF
  @Getter(useConfigurationStore) getEditUrl!: string
  @Getter(useFilingHistoryListStore) getFilings!: Array<ApiFilingIF>
  @Getter(useFilingHistoryListStore) getPanel!: number
  @Getter(useBusinessStore) isBenBcCccUlc!: boolean
  @Getter(useBusinessStore) isFirm!: boolean
  @Getter(useRootStore) isRoleStaff!: boolean
  @Getter(useBusinessStore) hasCourtOrders!: boolean
  @Getter(useFilingHistoryListStore) isAddCommentDialog!: boolean
  @Getter(useFilingHistoryListStore) isDownloadErrorDialog!: boolean
  @Getter(useFilingHistoryListStore) isLoadCorrectionDialog!: boolean
  @Getter(useFilingHistoryListStore) isFileCorrectionDialog!: boolean

  @Action(useFilingHistoryListStore) hideCommentDialog!: ActionBindingIF
  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: ActionBindingIF
  @Action(useFilingHistoryListStore) setDownloadErrorDialog!: (x: boolean) => void
  @Action(useRootStore) setFetchingDataSpinner!: (x: boolean) => void
  @Action(useFilingHistoryListStore) setFileCorrectionDialog!: (x: boolean) => void
  @Action(useFilingHistoryListStore) setLoadCorrectionDialog!: (x: boolean) => void

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
  is (filing: ApiFilingIF): string {
    switch (true) {
      case filing.availableOnPaperOnly: return 'paper-filing' // must come first
      case EnumUtilities.isTypeAlteration(filing): return 'alteration-filing'
      case EnumUtilities.isTypeChangeOfAddress(filing): return 'change-of-address'
      case EnumUtilities.isTypeConsentContinuationOut(filing): return 'consent-continuation-out'
      case EnumUtilities.isTypeDissolutionVoluntary(filing): return 'dissolution-voluntary'
      case EnumUtilities.isTypeIncorporationApplication(filing): return 'incorporation-application'
      case EnumUtilities.isTypeRestorationLimited(filing): return 'limited-restoration'
      case EnumUtilities.isTypeRestorationLimitedExtension(filing): return 'limited-restoration-extension'
      case EnumUtilities.isTypeRestorationLimitedToFull(filing): return 'limited-restoration-conversion'
      case EnumUtilities.isTypeRegistration(filing): return 'registration-filing'
      case EnumUtilities.isTypeStaff(filing): return 'staff-filing' // includes several filing types
      default: return 'default-filing'
    }
  }

  /**
   * Creates a draft correction and redirects to Edit UI.
   * Called by File Correction Dialog
   **/
  async redirectFiling (correctionType: CorrectionTypes): Promise<void> {
    try {
      // show spinner since the network calls below can take a few seconds
      this.setFetchingDataSpinner(true)

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
      this.setFetchingDataSpinner(false)

      // eslint-disable-next-line no-console
      console.log('Error creating correction =', error)
      this.setLoadCorrectionDialog(true)
    }
  }

  /**
   * This is called when filings are initially fetched.
   * If there is a filing ID to highlight then it finds it and expands its panel.
   */
  @Watch('getFilings', { immediate: true })
  onFilingsChange (): void {
    // if needed, highlight a specific filing
    if (this.highlightId) {
      const index = this.getFilings.findIndex(f => (f.filingId === this.highlightId))
      if (index >= 0) { // safety check
        this.toggleFilingHistoryItem(index)
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
