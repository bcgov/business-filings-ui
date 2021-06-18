<template>
  <div id="filing-history-list">
    <AddCommentDialog
      :dialog="addCommentDialog"
      :filingId="currentFilingId"
      @close="hideCommentDialog($event)"
      attach="#filing-history-list"
    />

    <DownloadErrorDialog
      :dialog="downloadErrorDialog"
      @close="downloadErrorDialog=false"
      attach="#filing-history-list"
    />

    <LoadCorrectionDialog
      :dialog="loadCorrectionDialog"
      @exit="loadCorrectionDialog=false"
      attach="#filing-history-list"
    />

    <!-- Alternate Loading Spinner -->
    <v-fade-transition>
      <div class="loading-container grayed-out" v-show="isBusy">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg white--text">Fetching data</div>
        </div>
      </div>
    </v-fade-transition>

    <div class="scrollable-container">
      <v-expansion-panels v-if="historyItems.length > 0" v-model="panel">
        <v-expansion-panel
          class="align-items-top filing-history-item"
          v-for="(filing, index) in historyItems"
          :key="index"
        >
          <!-- NB: bottom padding for when panel is collapsed -->
          <v-expansion-panel-header class="no-dropdown-icon">
            <div class="item-header d-flex">
              <!-- the filing label (left side) -->
              <div class="item-header__label">
                <h3 class="item-header__title">{{filing.displayName}}</h3>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- is this a Staff Only filing? -->
                <div v-if="filing.isTypeStaff" class="item-header__subtitle">
                  <FiledLabel :filing="filing" />
                </div>

                <!-- is this a FE BCOMP COA pending completion? -->
                <div v-else-if="filing.isFutureEffectiveBcompCoaPending" class="item-header__subtitle">
                  <span>FILED AND PENDING <FiledLabel :filing="filing" /></span>
                  <v-tooltip top content-class="pending-tooltip">
                    <template v-slot:activator="{ on }">
                      <div class="pending-alert" v-on="on">
                        <v-icon color="orange darken-2">mdi-alert</v-icon>
                      </div>
                    </template>
                    <span>The updated office addresses will be legally effective on
                      {{dateToPacificDateTime(filing.effectiveDate)}}.
                      No other filings are allowed until then.</span>
                  </v-tooltip>
                </div>

                <!-- is this a completed IA? -->
                <div v-else-if="filing.isCompletedIa" class="item-header__subtitle">
                  <span>FILED AND PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="blue darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- is this a FE IA pending completion? -->
                <div v-else-if="filing.isFutureEffectiveIaPending" class="item-header__subtitle">
                  <span class="orange--text text--darken-2">FILED AND PENDING</span>
                  <span class="vert-pipe" />
                  <span> PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="orange darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-alert</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- is this a FE IA still waiting for effective date/time? -->
                <div v-else-if="filing.isFutureEffectiveIa" class="item-header__subtitle">
                  <span>FUTURE EFFECTIVE INCORPORATION</span>
                  <span class="vert-pipe" />
                  <span>PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="blue darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- is this a FE Alteration pending completion? -->
                <div v-else-if="filing.isFutureEffectiveAlterationPending" class="item-header__subtitle">
                  <span class="orange--text text--darken-2">FILED AND PENDING</span>
                  <span class="vert-pipe" />
                  <span>PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="orange darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-alert</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- is this a FE Alteration still waiting for effective date/time? -->
                <div v-else-if="filing.isFutureEffectiveAlteration" class="item-header__subtitle">
                  <span>FUTURE EFFECTIVE ALTERATION</span>
                  <span class="vert-pipe" />
                  <span>PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="blue darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- is this a paid filing? -->
                <div v-else-if="isStatusPaid(filing)" class="item-header__subtitle">
                  <span class="orange--text text--darken-2">FILED AND PENDING</span>
                  <span class="vert-pipe" />
                  <span>PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="orange darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-alert</v-icon>
                    {{(panel === index) ? "Hide Details" : "View Details"}}
                  </v-btn>
                </div>

                <!-- else this must be a completed filing -->
                <!-- NB: no details button -->
                <div v-else class="item-header__subtitle">
                  <span>FILED AND PAID <FiledLabel :filing="filing" /></span>
                </div>

                <!-- details (comments) button -->
                <div v-if="filing.comments && filing.comments.length > 0" class="item-header__subtitle">
                  <v-btn
                    class="comments-btn"
                    outlined
                    color="primary"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})
                  </v-btn>
                </div>
              </div>

              <!-- the action button/menu (right side) -->
              <div class="item-header__actions">
                <v-btn
                  class="expand-btn"
                  outlined
                  :ripple=false
                  @click.stop="togglePanel(index, filing)"
                >
                  <span v-if="filing.availableOnPaperOnly" class="app-action">
                    {{(panel === index) ? "Close" : "Request a Copy"}}</span>
                  <span v-else class="app-action">
                    {{(panel === index) ? hideLabel(filing) : viewLabel(filing)}}
                  </span>
                </v-btn>

                <!-- the drop-down menu -->
                <v-menu offset-y left transition="slide-y-transition" v-if="isRoleStaff">
                  <template v-slot:activator="{ on }">
                    <v-btn text v-on="on" class="menu-btn pa-1" click.stop>
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item-group color="primary">
                      <v-list-item v-if="!filing.isTypeStaff" :disabled="disableCorrection(filing)">
                        <v-list-item-icon>
                          <v-icon class="app-action">mdi-file-document-edit-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title
                          class="file-correction-item"
                          @click.stop="correctThisFiling(filing)"
                        >
                          <span class="app-action">File a Correction</span>
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon class="app-action">mdi-comment-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title
                          class="add-detail-comment-item"
                          @click.stop="showCommentDialog(filing.filingId)"
                        >
                          <span class="app-action">Add Detail</span>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <!-- NB: blocks below are mutually exclusive, and order is important -->

            <!-- is this a Staff Only filing? -->
            <template v-if="filing.isTypeStaff">
              <StaffFiling :filing="filing" />
            </template>

            <!-- is this a FE BCOMP COA pending completion? -->
            <template v-else-if="filing.isFutureEffectiveBcompCoaPending">
              <!-- no details -->
            </template>

            <!-- is this a completed IA? -->
            <template v-else-if="filing.isCompletedIa">
              <CompletedIa />
            </template>

            <!-- is this a FE IA pending completion? -->
            <template v-else-if="filing.isFutureEffectiveIaPending">
              <FutureEffectivePending :filing=filing />
            </template>

            <!-- is this a FE IA still waiting for effective date/time? -->
            <template v-else-if="filing.isFutureEffectiveIa">
              <FutureEffective :filing=filing />
            </template>

            <!-- is this a FE Alteration pending completion? -->
            <template v-else-if="filing.isFutureEffectiveAlterationPending">
              <FutureEffectivePending :filing=filing />
            </template>

            <!-- is this a FE Alteration still waiting for effective date/time?  -->
            <template v-else-if="filing.isFutureEffectiveAlteration">
              <FutureEffective :filing=filing />
            </template>

            <!-- is this a paid filing? -->
            <template v-else-if="isStatusPaid(filing)">
              <PendingFiling :filing=filing />
            </template>

            <!-- is this a completed alteration? -->
            <template v-else-if="isTypeAlteration(filing)">
              <CompletedAlteration :filing=filing />
            </template>

            <!-- is this a paper filing? -->
            <template v-else-if="filing.availableOnPaperOnly">
              <PaperFiling />
            </template>

            <!-- else this must be a completed filing -->
            <template v-else>
              <!-- no details -->
            </template>

            <!-- the list of documents -->
            <v-list dense class="document-list py-0" v-if="filing.documents && filing.documents.length > 0">
              <!-- TODO: test this whitespace - can we just use "mt-6" same as details? -->
              <v-divider class="mt-7 mb-5" />

              <v-list-item
                v-for="(document, index) in filing.documents"
                :key="index"
              >
                <v-btn v-if="document.type === DocumentTypes.REPORT"
                  text color="primary"
                  class="download-document-btn"
                  @click="downloadOneDocument(document, index)"
                  :disabled="loadingDocument || loadingReceipt || loadingAll"
                  :loading="loadingDocument && index===downloadingDocIndex"
                >
                  <v-icon>mdi-file-pdf-outline</v-icon>
                  <span>{{document.title}}</span>
                </v-btn>

                <v-btn v-if="document.type === DocumentTypes.RECEIPT"
                  text color="primary"
                  class="download-receipt-btn"
                  @click="downloadOneReceipt(document)"
                  :disabled="loadingReceipt || loadingDocument || loadingAll"
                  :loading="loadingReceipt"
                >
                  <v-icon>mdi-file-pdf-outline</v-icon>
                  <span>{{document.title}}</span>
                </v-btn>
              </v-list-item>

              <v-list-item v-if="filing.documents.length > 1">
                <v-btn text color="primary"
                  class="download-all-btn"
                  @click="downloadAll(filing)"
                  :disabled="loadingAll || loadingDocument || loadingReceipt"
                  :loading="loadingAll"
                >
                  <v-icon>mdi-download</v-icon>
                  <span>Download All</span>
                </v-btn>
              </v-list-item>
            </v-list>

            <!-- the details (comments) section -->
            <template v-if="filing.comments && filing.comments.length > 0">
              <v-divider class="mt-6" />
              <DetailsList
                :filing=filing
                :isTask="false"
                @showCommentDialog="showCommentDialog($event)"
              />
            </template>

          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="!historyItems.length">
      <v-card-text>
        <template v-if="tempRegNumber">
          <div class="no-results__subtitle">Complete your filing to display</div>
        </template>

        <template v-else>
          <div class="no-results__title">You have no filing history</div>
          <div class="no-results__subtitle">Your completed filings and transactions will appear here</div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

// Components and Dialogs
import CompletedAlteration from './FilingHistoryList/CompletedAlteration.vue'
import CompletedIa from './FilingHistoryList/CompletedIa.vue'
import FiledLabel from './FilingHistoryList/FiledLabel.vue'
import FutureEffective from './FilingHistoryList/FutureEffective.vue'
import FutureEffectivePending from './FilingHistoryList/FutureEffectivePending.vue'
import PaperFiling from './FilingHistoryList/PaperFiling.vue'
import PendingFiling from './FilingHistoryList/PendingFiling.vue'
import StaffFiling from './FilingHistoryList/StaffFiling.vue'
import { DetailsList } from '@/components/common'
import { AddCommentDialog, DownloadErrorDialog, LoadCorrectionDialog } from '@/components/dialogs'

// Enums and Interfaces
import { DocumentTypes, FilingTypes, Routes } from '@/enums'
import { HistoryItemIF, LedgerIF } from '@/interfaces'

// Mixins
import { DateMixin, EnumMixin, FilingMixin, LegalApiMixin, PayApiMixin } from '@/mixins'

@Component({
  components: {
    // sub-components
    CompletedAlteration,
    CompletedIa,
    FiledLabel,
    FutureEffective,
    FutureEffectivePending,
    PaperFiling,
    PendingFiling,
    StaffFiling,
    // common
    DetailsList,
    // dialogs
    AddCommentDialog,
    DownloadErrorDialog,
    LoadCorrectionDialog
  }
})
export default class FilingHistoryList extends Mixins(
  DateMixin, EnumMixin, FilingMixin, LegalApiMixin, PayApiMixin
) {
  @Prop({ default: false })
  readonly disableChanges: boolean

  // enums for template
  readonly DocumentTypes = DocumentTypes
  readonly FilingTypes = FilingTypes

  @Getter isBComp!: boolean
  @Getter isRoleStaff!: boolean
  @Getter nrNumber!: string
  @State filings!: Array<LedgerIF>
  @State entityName!: string
  @State entityIncNo!: string

  // local properties
  private addCommentDialog = false
  private downloadErrorDialog = false
  private loadCorrectionDialog = false
  private panel: number = null // currently expanded panel
  private historyItems: Array<HistoryItemIF> = []
  private loadingDocument = false
  private loadingReceipt = false
  private loadingAll = false
  private currentFilingId: number = null
  private downloadingDocIndex = -1
  private isBusy = false

  /** The Edit URL string. */
  private get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

  /** The IA's Temporary Registration Number string. */
  private get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  private created (): void {
    // load data into this page
    this.loadData()
  }

  private loadData (): void {
    this.historyItems = []

    // create history items from 'filings' array from API
    for (let i = 0; i < this.filings.length; i++) {
      const filing = this.filings[i] as LedgerIF

      // safety check for required fields
      // TODO: add check for displayName when API handles unknown filings
      if (!filing.name || !filing.effectiveDate || !filing.submittedDate || !filing.status) {
        // eslint-disable-next-line no-console
        console.log('Invalid filing =', filing)
        continue
      }

      if (filing.availableOnPaperOnly) {
        this.loadOtherFiling(filing)
      } else if (this.isTypeAnnualReport(filing)) {
        this.loadAnnualReport(filing)
      } else if (this.isTypeIncorporationApplication(filing)) {
        this.loadIncorporationApplication(filing)
      } else {
        this.loadOtherFiling(filing)
      }
    }

    this.$emit('history-count', this.historyItems.length)
    this.$emit('history-items', this.historyItems)

    // if needed, highlight a specific filing
    // NB: use unary plus operator to cast string to number
    const highlightId = +this.$route.query.filing_id // may be NaN (which is falsy)
    if (highlightId) { this.highlightFiling(highlightId) }
  }

  /** Loads an annual report filing into the historyItems list. */
  private loadAnnualReport (filing: LedgerIF): void {
    try {
      const effectiveDate = new Date(filing.effectiveDate)
      const submittedDate = new Date(filing.submittedDate)

      // TODO: get and append AGM Year if not already part of display name
      let displayName = filing.displayName
      if (this.isStatusCorrected(filing)) {
        displayName += ' - Corrected'
      } else if (filing.correctionFilingId) {
        displayName += ' - Correction Pending'
      }

      // build filing item
      const item: HistoryItemIF = {
        displayName,
        effectiveDate,
        filingId: filing.filingId,
        isFutureEffective: filing.isFutureEffective,
        name: FilingTypes.ANNUAL_REPORT,
        status: filing.status,
        submittedDate,
        submitter: filing.submitter,
        commentsLink: filing.commentsLink,
        correctionLink: filing.correctionLink,
        documentsLink: filing.documentsLink,
        filingLink: filing.filingLink

      }

      // TODO: remove this when API provides it!
      // add receipt meta
      if (filing.paymentToken) {
        item.receipt = {
          type: DocumentTypes.RECEIPT,
          corpName: this.entityName || this.getCorpTypeNumberedDescription(this.entityType),
          filingDateTime: filing.submittedDate,
          paymentToken: filing.paymentToken,
          title: 'Receipt',
          filename: `${this.entityIncNo} - Receipt - ${this.dateToPacificDate(submittedDate)}.pdf`
        }
      }

      this.historyItems.push(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading AR filing =', error)
    }
  }

  /** Loads an incorporation application filing into the historyItems list. */
  private loadIncorporationApplication (filing: LedgerIF): void {
    try {
      const effectiveDate = new Date(filing.effectiveDate)
      const submittedDate = new Date(filing.submittedDate)

      // is this a completed IA? (incorp app mode only)
      const isCompletedIa = (this.tempRegNumber && this.isStatusCompleted(filing))

      // is this a Future Effective IA? (incorp app mode only)
      const isFutureEffectiveIa = (this.tempRegNumber && !!filing.isFutureEffective)

      // is this a Future Effective IA pending completion? (incorp app mode only)
      const isFutureEffectiveIaPending = (isFutureEffectiveIa && this.isStatusPending(filing))

      let displayName = filing.displayName
      if (this.isStatusCorrected(filing)) {
        displayName += ' - Corrected'
      } else if (filing.correctionFilingId) {
        displayName += ' - Correction Pending'
      }

      // build filing item
      const item: HistoryItemIF = {
        displayName,
        effectiveDate,
        filingId: filing.filingId,
        isCompletedIa,
        isFutureEffective: filing.isFutureEffective,
        isFutureEffectiveIa,
        isFutureEffectiveIaPending,
        name: FilingTypes.INCORPORATION_APPLICATION,
        status: filing.status,
        submittedDate,
        submitter: filing.submitter,
        commentsLink: filing.commentsLink,
        correctionLink: filing.correctionLink,
        documentsLink: filing.documentsLink,
        filingLink: filing.filingLink
      }

      // TODO: remove this when API provides it!
      // add receipt meta
      if (filing.paymentToken) {
        let receiptFilename: string
        if (isFutureEffectiveIa) {
          receiptFilename =
            `${this.entityIncNo} - Receipt (Future Effective) - ${this.dateToPacificDate(submittedDate)}.pdf`
        } else {
          receiptFilename =
            `${this.entityIncNo} - Receipt - ${this.dateToPacificDate(submittedDate)}.pdf`
        }

        item.receipt = {
          type: DocumentTypes.RECEIPT,
          corpName: this.entityName || this.getCorpTypeNumberedDescription(this.entityType),
          filingDateTime: filing.submittedDate,
          paymentToken: filing.paymentToken,
          title: `Receipt${isFutureEffectiveIa ? ' - Future Effective Incorporation' : ''}`,
          filename: receiptFilename
        }
      }

      this.historyItems.push(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading IA filing =', error)
    }
  }

  /** Loads a general filing into the historyItems list. */
  private loadOtherFiling (filing: LedgerIF): void {
    try {
      const effectiveDate = new Date(filing.effectiveDate)
      const submittedDate = new Date(filing.submittedDate)

      // TODO: remove when API already has this in display name
      let displayName = filing.displayName ||
        this.filingTypeToName(filing.name) // TODO: delete when API handles unknown filings
      if (this.isStatusCorrected(filing)) {
        displayName += ' - Corrected'
      } else if (filing.correctionFilingId) {
        displayName += ' - Correction Pending'
      }

      // build filing item
      const item: HistoryItemIF = {
        availableOnPaperOnly: filing.availableOnPaperOnly || false,
        displayName,
        effectiveDate,
        filingId: filing.filingId,
        isFutureEffective: filing.isFutureEffective,
        name: filing.name || FilingTypes.UNKNOWN,
        status: filing.status,
        submittedDate,
        submitter: filing.submitter,
        commentsLink: filing.commentsLink,
        correctionLink: filing.correctionLink,
        documentsLink: filing.documentsLink,
        filingLink: filing.filingLink,
        comments: filing.availableOnPaperOnly ? [] : undefined
      }

      // add additional properties for BCOMP COA filings
      if (this.isBComp && this.isTypeChangeOfAddress(filing)) {
        // is this a Future Effective BCOMP COA pending completion?
        item.isFutureEffectiveBcompCoaPending = (!!filing.isFutureEffective && this.isStatusPending(filing))
      }

      // add additional properties for Alteration filings
      if (this.isTypeAlteration(filing)) {
        // is this a Future Effective alteration?
        const isFutureEffectiveAlteration = !!filing.isFutureEffective

        // is this a Future Effective alteration pending completion?
        const isFutureEffectiveAlterationPending = (isFutureEffectiveAlteration && this.isStatusPending(filing))

        item.courtOrderNumber = filing.data?.courtOrder?.fileNumber || ''
        item.isArrangement = this.isEffectOfOrderPlanOfArrangement(filing.data?.courtOrder?.effectOfOrder)
        item.isFutureEffectiveAlteration = isFutureEffectiveAlteration
        item.isFutureEffectiveAlterationPending = isFutureEffectiveAlterationPending
        item.newLegalType = filing.data?.newLegalType
        item.oldLegalType = filing.data?.oldLegalType
      }

      // add additional properties for Staff Only filings
      if (this.isTypeStaff(filing)) {
        item.documents = [] // no documents
        item.fileNumber = filing.data?.fileNumber // may be falsy
        item.isTypeStaff = true
        item.notationOrOrder = filing.data?.orderDetails // should not be falsy
        item.planOfArrangement = filing.data?.effectOfOrder ? 'Pursuant to a Plan of Arrangement' : ''
      }

      // TODO: remove this when API provides it!
      // add receipt meta
      if (filing.paymentToken) {
        item.receipt = {
          type: DocumentTypes.RECEIPT,
          corpName: this.entityName || this.getCorpTypeNumberedDescription(this.entityType),
          filingDateTime: filing.submittedDate,
          paymentToken: filing.paymentToken,
          title: 'Receipt',
          filename: `${this.entityIncNo} - Receipt - ${this.dateToPacificDate(submittedDate)}.pdf`
        }
      }

      this.historyItems.push(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading other filing =', error)
    }
  }

  /** Expands the panel of the specified filing ID. */
  private highlightFiling (filingId: number): void {
    for (let i = 0; i < this.historyItems.length; i++) {
      if (this.historyItems[i].filingId === filingId) {
        this.panel = i
        break
      }
    }
  }

  private async correctThisFiling (item: HistoryItemIF): Promise<void> {
    const correctedFilingId = item.filingId?.toString()

    switch (item?.name) {
      case FilingTypes.ANNUAL_REPORT:
        // FUTURE:
        // this.$router.push({ name: Routes.ANNUAL_REPORT,
        //   params: { filingId: filing.filingId, isCorrection: true } })
        // FOR NOW:
        this.$router.push({
          name: Routes.CORRECTION,
          params: { correctedFilingId }
        })
        break

      case FilingTypes.CHANGE_OF_DIRECTORS:
        // FUTURE:
        // this.$router.push({ name: Routes.STANDALONE_DIRECTORS,
        //   params: { filingId: filing.filingId, isCorrection: true } })
        // FOR NOW:
        this.$router.push({
          name: Routes.CORRECTION,
          params: { correctedFilingId }
        })
        break

      case FilingTypes.CHANGE_OF_ADDRESS:
        // FUTURE:
        // this.$router.push({ name: Routes.STANDALONE_ADDRESSES,
        //   params: { filingId: filing.filingId, isCorrection: true } })
        // FOR NOW:
        this.$router.push({
          name: Routes.CORRECTION,
          params: { correctedFilingId }
        })
        break

      case FilingTypes.INCORPORATION_APPLICATION:
        try {
          // show spinner since the network calls below can take a few seconds
          this.$root.$emit('showSpinner', true)

          // fetch original IA
          const iaFiling = await this.fetchFiling(this.entityIncNo, item.filingId)

          if (!iaFiling) {
            throw new Error('Invalid API response')
          }

          // create draft IA Correction filing
          const correctionIaFiling = this.buildIaCorrectionFiling(iaFiling)
          const draftCorrection = await this.createFiling(this.entityIncNo, correctionIaFiling, true)
          const draftCorrectionId = +draftCorrection?.header?.filingId

          if (!draftCorrection || isNaN(draftCorrectionId) || !draftCorrectionId) {
            throw new Error('Invalid API response')
          }

          // redirect to Edit web app to correct this IA
          // NB: no need to clear spinner on redirect
          const correctionUrl = `${this.editUrl}${this.entityIncNo}/correction?correction-id=${draftCorrectionId}`
          window.location.assign(correctionUrl) // assume URL is always reachable
        } catch (error) {
          // clear spinner on error
          this.$root.$emit('showSpinner', false)

          // eslint-disable-next-line no-console
          console.log('Error creating correction =', error)
          this.loadCorrectionDialog = true
        }
        break

      case FilingTypes.CORRECTION:
        // FUTURE: allow a correction to a correction?
        // this.$router.push({ name: Routes.CORRECTION,
        //   params: { correctedFilingId } })
        alert('At this time, you cannot correct a correction. Please contact Ops if needed.')
        break

      case FilingTypes.ALTERATION:
        // FUTURE: allow a correction to an alteration?
        // this.$router.push({ name: Routes.CORRECTION,
        //   params: { correctedFilingId } })
        alert('At this time, you cannot correct an alteration. Please contact Ops if needed.')
        break

      default:
        // fallback for all other filings
        this.$router.push({
          name: Routes.CORRECTION,
          params: { correctedFilingId }
        })
        break
    }
  }

  private async downloadOneDocument (document: any, index: number): Promise<void> {
    this.loadingDocument = true
    this.downloadingDocIndex = index
    await this.fetchOneDocument(this.entityIncNo, document).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchOneDocument() error =', error)
      this.downloadErrorDialog = true
    })
    this.loadingDocument = false
    this.downloadingDocIndex = -1
  }

  private async downloadOneReceipt (document: any): Promise<void> {
    this.loadingReceipt = true
    await this.fetchOneReceipt(document).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchOneReceipt() error =', error)
      this.downloadErrorDialog = true
    })
    this.loadingReceipt = false
  }

  private async downloadAll (item: HistoryItemIF): Promise<void> {
    this.loadingAll = true
    if (item?.documents) {
      for (let i = 0; i < item.documents.length; i++) {
        const type = item.documents[i].type
        if (type === DocumentTypes.REPORT) {
          await this.fetchOneDocument(this.entityIncNo, item.documents[i]).catch(error => {
            // eslint-disable-next-line no-console
            console.log('fetchOneDocument() error =', error)
            this.downloadErrorDialog = true
          })
        }
        if (type === DocumentTypes.RECEIPT) {
          await this.fetchOneReceipt(item.documents[i]).catch(error => {
            // eslint-disable-next-line no-console
            console.log('fetchOneReceipt() error =', error)
            this.downloadErrorDialog = true
          })
        }
      }
    }
    this.loadingAll = false
  }

  private showCommentDialog (filingId: number): void {
    this.currentFilingId = filingId
    this.addCommentDialog = true
  }

  private async hideCommentDialog (needReload: boolean): Promise<void> {
    this.addCommentDialog = false
    // if needed, reload comments for this filing
    // NB: no spinner or state change, just do it quietly // TODO: remove comment if keeping spinner
    if (needReload) {
      // find the filing in the list
      const item = this.historyItems.find(item => (item.filingId === this.currentFilingId))

      // TODO: test "isBusy" spinner when we have commentsLink
      if (item && item.commentsLink) {
        this.isBusy = true // TODO: test this
        await this.reloadComments(item)
        this.isBusy = false
      }
    }
  }

  /** Reloads the comments for this history item. */
  private async reloadComments (item: HistoryItemIF): Promise<void> {
    // fetch comments from API
    const filing = await this.fetchComments(item.commentsLink).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchComments() error =', error)
      // FUTURE: enable some error dialog?
    })

    if (filing?.header) {
      // reload just the comments
      item.comments = this.flattenAndSortComments(filing.header.comments)
      // TODO: implement and update item.numComments
    }
  }

  /** Closes current panel or opens new panel. */
  private async togglePanel (index: number, item: HistoryItemIF): Promise<void> {
    const isCurrentPanel = (this.panel === index)

    // if we're not closing the current panel,
    // and we don't already have both comments and documents,
    // then load them
    if (!isCurrentPanel && !item.comments && !item.documents && item.commentsLink && item.documentsLink) {
      this.isBusy = true
      await this.loadCommentsAndDocuments(item)
      this.isBusy = false
    }
    // toggle the subject panel
    this.panel = isCurrentPanel ? null : index
  }

  /** Loads the comments and documents for this history item. */
  private async loadCommentsAndDocuments (item: HistoryItemIF): Promise<void> {
    // fetch comments and documents from API
    const data = await Promise.all([
      this.fetchComments(item.commentsLink),
      this.fetchDocuments(item.documentsLink)
    ]).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchComments() or fetchDocuments() error =', error)
      // FUTURE: enable some error dialog?
    })

    if (data && data.length === 2) {
      // load the comments
      item.comments = this.flattenAndSortComments(data[0])
      // load the documents
      item.documents = data[1] || []

      // TODO: remove this when API provides it!
      // load receipt
      if (item.receipt) item.documents.push(item.receipt)
    }
  }

  /** Whether to disable correction for this history item. */
  private disableCorrection (item: HistoryItemIF): boolean {
    return (
      this.disableChanges ||
      item.availableOnPaperOnly ||
      item.isTypeStaff ||
      item.isFutureEffectiveIa ||
      this.isStatusCorrected(item) ||
      this.isTypeAlteration(item) ||
      this.isTypeCorrection(item) ||
      this.isTypeTransition(item)
    )
  }

  /** The action label to display documents and/or detail comments. */
  private viewLabel (item: HistoryItemIF): string {
    return (item.isTypeStaff ? 'View' : 'View Documents')
  }

  /** The action label to hide documents and/or detail comments. */
  private hideLabel (item: HistoryItemIF): string {
    return (item.isTypeStaff ? 'Hide' : 'Hide Documents')
  }

  @Watch('filings')
  private onFilingsChange (): void {
    // if filings changes, reload them
    // (does not fire on initial page load)
    this.loadData()
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.scrollable-container {
  max-height: 60rem;
}

.filing-history-item {
  // disable expansion generally
  pointer-events: none;
}

// specifically enable anchors, buttons, the pending alert icon and tooltips
// for this page and sub-components
::v-deep a,
::v-deep .v-btn,
::v-deep .pending-alert .v-icon,
::v-deep .v-tooltip + div {
  pointer-events: auto;
}

.item-header {
  line-height: 1.25rem;

  &__label {
    flex: 1 1 auto;
    padding-top: 0.5rem;
  }

  &__actions {
    text-align: right;
    min-width: 12rem;

    .expand-btn {
      letter-spacing: -0.01rem;
      font-size: 0.875rem;
      font-weight: 700;
    }

    // make menu button slightly smaller
    .menu-btn {
      height: unset !important;
      min-width: unset !important;
      padding: 0.25rem !important;
      color: $app-blue
    }
  }

  &__title {
    font-weight: 700;
  }

  &__subtitle {
    color: $gray6;
    margin-top: 0.5rem;
  }
}

.item-header + .item-header {
  border-top: 1px solid $gray3;
}

.v-col-padding {
  padding: 0 12px 0 12px;
}

.pending-tooltip {
  max-width: 16rem;
}

.pending-alert .v-icon {
  font-size: 18px; // same as other v-icons
  padding-left: 0.875rem;
}

.details-btn,
.expand-btn,
.comments-btn {
  border: none;
}

.details-btn {
  margin-bottom: 0.25rem;
}

.v-expansion-panel-header {
  padding-top: 1.25rem !important;
  padding-bottom: 1.25rem !important;
}

::v-deep .v-expansion-panel-content__wrap {
  padding-right: 1.5rem;
  padding-left: 1.5rem;
  padding-bottom: 1.5rem;
}

.document-list .v-list-item {
  padding-left: 0;
  min-height: 1.5rem;
}

::v-deep .theme--light.v-list-item--disabled {
  opacity: 0.38 !important;
}
</style>
