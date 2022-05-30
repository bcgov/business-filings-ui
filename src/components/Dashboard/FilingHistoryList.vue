<template>
  <div id="filing-history-list">
    <AddCommentDialog
      :dialog="addCommentDialog"
      :filing="currentFiling"
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
          class="align-items-top filing-history-item px-6 py-5"
          v-for="(filing, index) in historyItems"
          :key="index"
        >
          <v-expansion-panel-header class="no-dropdown-icon pa-0">
            <div class="item-header d-flex">
              <!-- the filing label (left side) -->
              <div class="item-header__label">
                <h3 class="item-header__title">{{filing.displayName}}</h3>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- is this a Staff Only filing? -->
                <div v-if="filing.isTypeStaff" class="item-header__subtitle">
                  <FiledLabel :filing="filing" />
                </div>

                <!-- is this a FE BCOMP COA pending (not yet completed)? -->
                <div v-else-if="filing.isFutureEffectiveBcompCoaPending" class="item-header__subtitle">
                  <span>FILED AND PENDING <FiledLabel :filing="filing" /></span>
                  <v-tooltip top content-class="pending-tooltip">
                    <template v-slot:activator="{ on }">
                      <div class="pending-alert" v-on="on">
                        <v-icon color="orange darken-2">mdi-alert</v-icon>
                      </div>
                    </template>
                    The updated office addresses will be legally effective on
                    {{dateToPacificDateTime(filing.effectiveDate)}}.
                    No other filings are allowed until then.
                  </v-tooltip>
                </div>

                <!-- is this a completed IA? -->
                <!-- or a completed Alteration? -->
                <!-- or a completed Dissolution? -->
                <div v-else-if="filing.isCompletedIa || filing.isCompletedAlteration || filing.isCompletedDissolution"
                  class="item-header__subtitle"
                >
                  <span>FILED AND PAID <FiledLabel :filing="filing" /></span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="blue darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    <span>{{(panel === index) ? "Hide Details" : "View Details"}}</span>
                  </v-btn>
                </div>

                <!-- is this a FE IA pending (overdue)? -->
                <!-- or a FE Alteration pending (overdue)? -->
                <!-- or a FE Dissolution pending (overdue)? -->
                <div v-else-if="filing.isFutureEffectiveIaPending || filing.isFutureEffectiveAlterationPending ||
                  filing.isFutureEffectiveDissolutionPending" class="item-header__subtitle"
                >
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
                    <span>{{(panel === index) ? "Hide Details" : "View Details"}}</span>
                  </v-btn>
                </div>

                <!-- is this a FE IA still waiting for effective date/time? -->
                <!-- is this a FE Alteration still waiting for effective date/time? -->
                <!-- is this a FE Dissolution still waiting for effective date/time? -->
                <div v-else-if="filing.isFutureEffectiveIa || filing.isFutureEffectiveAlteration ||
                  filing.isFutureEffectiveDissolution" class="item-header__subtitle"
                >
                  <span v-if="filing.isFutureEffectiveIa">FUTURE EFFECTIVE INCORPORATION</span>
                  <span v-if="filing.isFutureEffectiveAlteration">FUTURE EFFECTIVE ALTERATION</span>
                  <span v-if="filing.isFutureEffectiveDissolution">FUTURE EFFECTIVE DISSOLUTION</span>
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
                    <span>{{(panel === index) ? "Hide Details" : "View Details"}}</span>
                  </v-btn>
                </div>

                <!-- is this a generic paid (not yet completed) filing? -->
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
                    <span>{{(panel === index) ? "Hide Details" : "View Details"}}</span>
                  </v-btn>
                </div>

                <!-- else this must be a completed filing -->
                <!-- NB: no view/hide details button -->
                <div v-else class="item-header__subtitle">
                  <span>FILED AND PAID <FiledLabel :filing="filing" /></span>
                </div>

                <!-- optional detail comments button -->
                <div v-if="filing.commentsCount > 0" class="item-header__subtitle mb-n2">
                  <v-btn
                    class="comments-btn"
                    outlined
                    color="primary"
                    :ripple=false
                    @click.stop="togglePanel(index, filing)"
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    <span>Detail{{filing.commentsCount > 1 ? "s" : ""}} ({{filing.commentsCount}})</span>
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
                  v-show="displayAction(filing)"
                >
                  <span v-if="filing.availableOnPaperOnly" class="app-blue">
                    {{(panel === index) ? "Close" : "Request a Copy"}}
                  </span>
                  <span v-else-if="filing.isTypeStaff" class="app-blue">
                    {{(panel === index) ? "Hide" : "View"}}
                  </span>
                  <span v-else-if="filing.documentsLink" class="app-blue">
                    {{(panel === index) ? "Hide Documents" : "View Documents"}}
                  </span>
                </v-btn>

                <!-- the drop-down menu -->
                <v-menu offset-y left transition="slide-y-transition" v-if="isRoleStaff && !!businessId">
                  <template v-slot:activator="{ on }">
                    <v-btn text v-on="on" class="menu-btn app-blue pa-1" click.stop>
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item-group color="primary">
                      <v-list-item :disabled="disableCorrection(filing)">
                        <v-list-item-icon>
                          <v-icon class="app-blue">mdi-file-document-edit-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title
                          class="file-correction-item"
                          @click.stop="correctThisFiling(filing)"
                        >
                          <span class="app-blue">File a Correction</span>
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item :disabled="!isAllowed(AllowableActions.ADD_DETAIL_COMMENT)">
                        <v-list-item-icon>
                          <v-icon class="app-blue">mdi-comment-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title
                          class="add-detail-comment-item"
                          @click.stop="showCommentDialog(filing)"
                        >
                          <span class="app-blue">Add Detail</span>
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
              <StaffFiling :filing="filing" class="mt-6" />
            </template>

            <!-- is this a FE BCOMP COA pending (not yet completed)? -->
            <template v-else-if="filing.isFutureEffectiveBcompCoaPending">
              <!-- no details -->
            </template>

            <!-- is this a completed IA? -->
            <template v-else-if="filing.isCompletedIa">
              <CompletedIa class="mt-6" />
            </template>

            <!-- is this a completed alteration? -->
            <template v-else-if="filing.isCompletedAlteration">
              <CompletedAlteration :filing=filing class="mt-6" />
            </template>

            <!-- is this a completed dissolution? -->
            <template v-else-if="filing.isCompletedDissolution">
              <CompletedDissolution :filing="filing" class="mt-6" />
            </template>

            <!-- is this a FE IA pending (overdue)? -->
            <!-- or a FE Alteration pending (overdue)? -->
            <!-- or a FE Dissolution pending (overdue)? -->
            <template v-else-if="filing.isFutureEffectiveIaPending || filing.isFutureEffectiveAlterationPending ||
              filing.isFutureEffectiveDissolutionPending"
            >
              <FutureEffectivePending :filing=filing class="mt-6" />
            </template>

            <!-- is this a FE IA still waiting for effective date/time? -->
            <!-- or a FE Alteration still waiting for effective date/time?  -->
            <!-- or a FE Dissolution still waiting for effective date/time?  -->
            <template v-else-if="filing.isFutureEffectiveIa || filing.isFutureEffectiveAlteration ||
              filing.isFutureEffectiveDissolution"
            >
              <FutureEffective :filing=filing class="mt-6" />
            </template>

            <!-- is this a generic paid (not yet completed) filing? -->
            <template v-else-if="isStatusPaid(filing)">
              <PendingFiling :filing=filing class="mt-6" />
            </template>

            <!-- is this a paper filing? -->
            <template v-else-if="filing.availableOnPaperOnly">
              <PaperFiling class="mt-6" />
            </template>

            <!-- else this must be a completed filing -->
            <template v-else>
              <!-- no details -->
            </template>

            <!-- the documents section -->
            <template v-if="filing.documents && filing.documents.length > 0">
              <v-divider class="my-6" />
              <DocumentsList
                :filing=filing
                :loadingOne=loadingOne
                :loadingAll=loadingAll
                :loadingOneIndex=loadingOneIndex
                @downloadOne="downloadOne(...arguments)"
                @downloadAll="downloadAll($event)"
              />
            </template>

            <!-- the details (comments) section -->
            <template v-if="filing.comments && filing.commentsCount > 0">
              <v-divider class="my-6" />
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
        <template v-if="!!tempRegNumber">
          <div class="no-results__subtitle">Complete your filing to display</div>
        </template>

        <template v-if="!!businessId">
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
import { Action, Getter } from 'vuex-class'
import { navigate } from '@/utils'

// Components and dialogs
import CompletedAlteration from './FilingHistoryList/CompletedAlteration.vue'
import CompletedDissolution from './FilingHistoryList/CompletedDissolution.vue'
import CompletedIa from './FilingHistoryList/CompletedIa.vue'
import DocumentsList from './FilingHistoryList/DocumentsList.vue'
import FiledLabel from './FilingHistoryList/FiledLabel.vue'
import FutureEffective from './FilingHistoryList/FutureEffective.vue'
import FutureEffectivePending from './FilingHistoryList/FutureEffectivePending.vue'
import PaperFiling from './FilingHistoryList/PaperFiling.vue'
import PendingFiling from './FilingHistoryList/PendingFiling.vue'
import StaffFiling from './FilingHistoryList/StaffFiling.vue'
import { DetailsList } from '@/components/common'
import { AddCommentDialog, DownloadErrorDialog, LoadCorrectionDialog } from '@/components/dialogs'

// Enums, interfaces and mixins
import { AllowableActions, FilingTypes, Routes } from '@/enums'
import { ActionBindingIF, ApiFilingIF, DocumentIF, HistoryItemIF, LegalFilingIF,
  FilingHistoryListResourceIF } from '@/interfaces'
import { AllowableActionsMixin, DateMixin, EnumMixin, FilingMixin, LegalApiMixin } from '@/mixins'

@Component({
  components: {
    // sub-components
    CompletedAlteration,
    CompletedDissolution,
    CompletedIa,
    DocumentsList,
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
  AllowableActionsMixin, DateMixin, EnumMixin, FilingMixin, LegalApiMixin
) {
  @Prop({ default: null }) readonly highlightId: number

  @Getter getFilings!: Array<ApiFilingIF>
  @Getter getFilingHistoryListResource!: FilingHistoryListResourceIF

  @Action setIsCoaPending!: ActionBindingIF
  @Action setCoaEffectiveDate!: ActionBindingIF
  @Action setHasBlockerFiling!: ActionBindingIF

  // local properties
  private addCommentDialog = false
  private downloadErrorDialog = false
  private loadCorrectionDialog = false
  private panel: number = null // currently expanded panel
  private historyItems: Array<HistoryItemIF> = []
  private loadingOne = false
  private loadingAll = false
  private currentFiling: HistoryItemIF = null
  private loadingOneIndex = -1
  private isBusy = false

  // enum for template
  readonly AllowableActions = AllowableActions

  /** The Edit URL string. */
  private get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

  /** The IA's Temporary Registration Number string. */
  private get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** The Business ID string. */
  private get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** Returns whether the action button is visible or not. */
  private displayAction (filing): string {
    return filing.availableOnPaperOnly || filing.isTypeStaff || filing.documentsLink
  }

  private loadData (): void {
    this.historyItems = []

    // create 'history items' list from 'filings' array from API
    for (const filing of this.getFilings) {
      // safety check for required fields
      if (!filing.name || !filing.displayName || !filing.effectiveDate || !filing.submittedDate || !filing.status) {
        // eslint-disable-next-line no-console
        console.log('Invalid filing =', filing)
        continue
      }

      this.loadFiling(filing)
    }

    // report number of items back to parent (dashboard)
    this.$emit('history-count', this.historyItems.length)

    // Check if there is a pending (ie, paid / not yet completed) filing.
    // This is a blocker because it needs to be completed first.
    // Also update pending COA data.
    let isCoaPending = false
    let coaEffectiveDate: Date = null
    const blockerFiling = this.historyItems.find(item => {
      if (this.isStatusPaid(item)) {
        if (item.isFutureEffectiveBcompCoaPending) {
          isCoaPending = true
          coaEffectiveDate = item.effectiveDate
        }
        return true
      }
      return false
    })
    this.setIsCoaPending(isCoaPending)
    this.setCoaEffectiveDate(coaEffectiveDate)
    this.setHasBlockerFiling(!!blockerFiling)

    // if needed, highlight a specific filing
    if (this.highlightId) this.highlightFiling(this.highlightId)
  }

  /** Loads a filing into the historyItems list. */
  private loadFiling (filing: ApiFilingIF): void {
    try {
      // NB: these `new Date()` are safe because the date strings are in GMT (ie, UTC)
      //     so the conversion to JS Date ignores the browser's local timezone
      const effectiveDate = new Date(filing.effectiveDate)
      const submittedDate = new Date(filing.submittedDate)

      // build filing item
      const item: HistoryItemIF = {
        availableOnPaperOnly: filing.availableOnPaperOnly,
        commentsCount: filing.commentsCount,
        displayName: filing.displayName,
        effectiveDate,
        filingId: filing.filingId,
        isFutureEffective: filing.isFutureEffective,
        name: filing.name || FilingTypes.UNKNOWN,
        status: filing.status,
        submittedDate,
        submitter: filing.submitter,

        commentsLink: filing.commentsLink,
        documentsLink: filing.documentsLink,
        filingLink: filing.filingLink,

        comments: null, // null until loaded
        documents: null // null until loaded
      }

      // add properties for correction filings
      // (a correction filing has the id of the filing that it corrects)
      if (filing.correctedFilingId) {
        item.correctedFilingId = filing.correctedFilingId
        item.correctedLink = filing.correctedLink
      }

      // add properties for corrected filings
      // (a corrected filing has the id of the filing that corrects it)
      if (filing.correctionFilingId) {
        item.correctionFilingId = filing.correctionFilingId
        item.correctionLink = filing.correctionLink
      }

      // add properties for BCOMP COAs
      if (this.isBComp && this.isTypeChangeOfAddress(filing)) {
        // is this a Future Effective BCOMP COA pending (not yet completed)?
        // (NB: this is False after the effective date)
        item.isFutureEffectiveBcompCoaPending = (
          filing.isFutureEffective &&
          this.isStatusPaid(filing) &&
          this.isEffectiveDateFuture(effectiveDate)
        )
      }

      // add properties for IAs
      if (this.isTypeIncorporationApplication(filing)) {
        // is this a completed IA? (incorp app mode only)
        item.isCompletedIa = (
          !!this.tempRegNumber &&
          this.isStatusCompleted(filing)
        )

        // is this a Future Effective IA (not yet completed)? (incorp app mode only)
        item.isFutureEffectiveIa = (
          !!this.tempRegNumber &&
          filing.isFutureEffective &&
          this.isStatusPaid(filing)
        )

        // is this a Future Effective IA pending (overdue)? (incorp app mode only)
        item.isFutureEffectiveIaPending = (
          item.isFutureEffectiveIa &&
          this.isEffectiveDatePast(effectiveDate)
        )
      }

      // add properties for Alterations
      if (this.isTypeAlteration(filing)) {
        // is this a completed alteration?
        item.isCompletedAlteration = this.isStatusCompleted(filing)

        // is this a Future Effective alteration (not yet completed)?
        item.isFutureEffectiveAlteration = (
          filing.isFutureEffective &&
          this.isStatusPaid(filing)
        )

        // is this a Future Effective alteration pending (overdue)?
        item.isFutureEffectiveAlterationPending = (
          item.isFutureEffectiveAlteration &&
          this.isEffectiveDatePast(effectiveDate)
        )

        // data is available only for a completed filing
        if (item.isCompletedAlteration) {
          item.courtOrderNumber = filing.data.order?.fileNumber || ''
          item.isArrangement = this.isEffectOfOrderPlanOfArrangement(filing.data.order?.effectOfOrder)
          item.toLegalType = filing.data.alteration?.toLegalType || null
          item.fromLegalType = filing.data.alteration?.fromLegalType || null
        }
      }

      // add properties for Dissolutions
      if (this.isTypeDissolution(filing)) {
        // is this a completed dissolution?
        item.isCompletedDissolution = this.isStatusCompleted(filing)

        // is this a Future Effective dissolution (not yet completed)?
        item.isFutureEffectiveDissolution = (
          filing.isFutureEffective &&
          this.isStatusPaid(filing)
        )

        // is this a Future Effective dissolution pending (overdue)?
        item.isFutureEffectiveDissolutionPending = (
          item.isFutureEffectiveDissolution &&
          this.isEffectiveDatePast(effectiveDate)
        )
      }

      // add properties for staff filings
      if (this.isTypeStaff(filing)) {
        item.documents = [] // no documents
        item.fileNumber = filing.data.order?.fileNumber || '' // may be falsy
        item.isTypeStaff = true
        item.notationOrOrder = filing.data.order?.orderDetails // should not be falsy
        item.planOfArrangement = filing.data.order?.effectOfOrder ? 'Pursuant to a Plan of Arrangement' : ''
      }

      this.historyItems.push(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading filing =', error)
    }
  }

  /** Whether the subject effective date/time is in the past. */
  isEffectiveDatePast (effectiveDate: Date): boolean {
    return (effectiveDate <= this.getCurrentJsDate)
  }

  /** Whether the subject effective date/time is in the future. */
  isEffectiveDateFuture (effectiveDate: Date): boolean {
    return (effectiveDate > this.getCurrentJsDate)
  }

  /** Expands the panel of the specified filing ID. */
  private highlightFiling (id: number): void {
    const index = this.historyItems.findIndex(h => h.filingId === id)
    if (index >= 0) this.togglePanel(index, this.historyItems[index])
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
          const iaFiling = item.filingLink && await this.fetchFiling(item.filingLink)

          if (!iaFiling) {
            throw new Error('Invalid API response')
          }

          // create draft IA Correction filing
          const correctionIaFiling = this.buildIaCorrectionFiling(iaFiling)
          const draftCorrection = await this.createFiling(this.getIdentifier, correctionIaFiling, true)
          const draftCorrectionId = +draftCorrection?.header?.filingId

          if (!draftCorrection || isNaN(draftCorrectionId) || !draftCorrectionId) {
            throw new Error('Invalid API response')
          }

          // navigate to Edit web app to correct this IA
          // NB: no need to clear spinner
          const correctionUrl = `${this.editUrl}${this.getIdentifier}/correction/?correction-id=${draftCorrectionId}`
          navigate(correctionUrl)
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

  private async downloadOne (document: DocumentIF, index: number): Promise<void> {
    if (document && index >= 0) { // safety check
      this.loadingOne = true
      this.loadingOneIndex = index

      await this.fetchDocument(document).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDocument() error =', error)
        this.downloadErrorDialog = true
      })

      this.loadingOne = false
      this.loadingOneIndex = -1
    }
  }

  private async downloadAll (item: HistoryItemIF): Promise<void> {
    if (item?.documents) { // safety check
      this.loadingAll = true

      for (const document of item.documents) {
        await this.fetchDocument(document).catch(error => {
          // eslint-disable-next-line no-console
          console.log('fetchDocument() error =', error)
          this.downloadErrorDialog = true
        })
      }

      this.loadingAll = false
    }
  }

  private showCommentDialog (filing: HistoryItemIF): void {
    this.currentFiling = filing
    this.addCommentDialog = true
  }

  private async hideCommentDialog (needReload: boolean): Promise<void> {
    this.addCommentDialog = false
    // if needed, reload comments for this filing
    if (needReload) {
      if (this.currentFiling?.commentsLink) { // safety check
        this.isBusy = true
        await this.loadComments(this.currentFiling)
        this.isBusy = false
      }
    }
  }

  /** Loads the comments for this history item. */
  private async loadComments (item: HistoryItemIF): Promise<void> {
    try {
      // fetch comments array from API
      const comments = await this.fetchComments(item.commentsLink)
      // flatten and sort the comments
      item.comments = this.flattenAndSortComments(comments)
    } catch (error) {
      // set property to null to retry next time
      item.comments = null
      // eslint-disable-next-line no-console
      console.log('loadComments() error =', error)
      // FUTURE: enable some error dialog?
    }
    // update comments count
    item.commentsCount = item.comments?.length || 0
  }

  /** Loads the documents for this history item. */
  private async loadDocuments (item: HistoryItemIF): Promise<void> {
    try {
      // fetch documents object from API
      const documents = await this.fetchDocuments(item.documentsLink)
      // load each type of document
      item.documents = []
      // iterate over documents properties
      for (const prop in documents) {
        if (prop === 'legalFilings' && Array.isArray(documents.legalFilings)) {
          // iterate over legalFilings array
          for (const legalFiling of documents.legalFilings as LegalFilingIF[]) {
            // iterate over legalFiling properties
            for (const prop in legalFiling) {
              // this is a legal filing output
              let title
              // use display name for primary document's title
              if (prop === item.name) title = item.displayName
              else title = this.filingTypeToName(prop as FilingTypes, null, true)
              const date = this.dateToYyyyMmDd(item.submittedDate)
              const filename = `${this.getIdentifier} ${title} - ${date}.pdf`
              const link = legalFiling[prop] as string
              pushDocument(title, filename, link)
            }
          }
        } else {
          // this is a submission level output
          const title = this.camelCaseToWords(prop)
          const date = this.dateToYyyyMmDd(item.submittedDate)
          const filename = `${this.getIdentifier} ${title} - ${date}.pdf`
          const link = documents[prop] as string
          pushDocument(title, filename, link)
        }
      }
    } catch (error) {
      // set property to null to retry next time
      item.documents = null
      // eslint-disable-next-line no-console
      console.log('loadDocuments() error =', error)
      // FUTURE: enable some error dialog?
    }

    function pushDocument (title: string, filename: string, link: string) {
      if (title && filename && link) {
        item.documents.push({ title, filename, link } as DocumentIF)
      } else {
        // eslint-disable-next-line no-console
        console.log(`invalid document = ${title} | ${filename} | ${link}`)
      }
    }
  }

  /** Closes current panel or opens new panel. */
  private async togglePanel (index: number, item: HistoryItemIF): Promise<void> {
    const isCurrentPanel = (this.panel === index)

    // check if we're opening a new panel
    if (!isCurrentPanel) {
      const promises: Array<Promise<void>> = []
      // check if we're missing comments or documents
      if (item.commentsLink && !item.comments) promises.push(this.loadComments(item))
      if (item.documentsLink && !item.documents) promises.push(this.loadDocuments(item))

      if (promises.length > 0) {
        this.isBusy = true
        // NB: errors are handled in loadComments() and loadDocuments()
        await Promise.all(promises)
        // leave busy spinner displayed another 250ms
        // to mitigate flashing when the promises are resolved quickly
        setTimeout(() => { this.isBusy = false }, 250)
      }
    }

    // toggle the subject panel
    this.panel = isCurrentPanel ? null : index
  }

  /** Whether to disable correction for this history item. */
  private disableCorrection (item: HistoryItemIF): boolean {
    return (
      !this.isAllowed(AllowableActions.FILE_CORRECTION) ||
      item.availableOnPaperOnly ||
      item.isTypeStaff ||
      item.isFutureEffective ||
      this.isStatusCorrected(item) ||
      this.isTypeAlteration(item) ||
      this.isTypeCorrection(item) ||
      this.isTypeTransition(item) ||
      // at the moment, only BEN IA corrections are supported:
      (this.isTypeIncorporationApplication(item) && !this.isBComp)
    )
  }

  @Watch('getFilings', { immediate: true })
  private onFilingsChange (): void {
    // load data initially and when filings list changes
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
  }

  &__actions {
    text-align: right;
    min-width: 12rem;

    .expand-btn {
      letter-spacing: -0.01rem;
      font-size: $px-14;
      font-weight: 700;
    }

    // make menu button slightly smaller
    .menu-btn {
      height: unset !important;
      min-width: unset !important;
      padding: 0.25rem !important;
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
  max-width: 16.5rem;
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

::v-deep .v-expansion-panel-content__wrap {
  padding: 0;
}

::v-deep .theme--light.v-list-item--disabled {
  opacity: 0.38 !important;
}
</style>
