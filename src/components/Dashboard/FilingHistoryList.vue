<template>
  <div id="filing-history-list">
    <add-comment-dialog
      :dialog="addCommentDialog"
      :filingId="currentFilingId"
      @close="hideCommentDialog($event)"
      attach="#filing-history-list"
    />

    <download-error-dialog
      :dialog="downloadErrorDialog"
      @close="downloadErrorDialog=false"
      attach="#filing-history-list"
    />

    <v-expansion-panels v-if="filedItems.length > 0" v-model="panel">
      <v-expansion-panel
        class="align-items-top filing-history-item"
        v-for="(filing, index) in filedItems"
        :key="index"
      >
        <!-- NB: bottom padding for when panel is collapsed -->
        <v-expansion-panel-header class="no-dropdown-icon">
          <div class="list-item">
            <div class="filing-label">
              <h3 class="list-item__title mb-0">{{filing.title}}{{applyCorrectionTag(filing)}}</h3>

              <div class="list-item__subtitle d-flex">
                <div v-if="filing.isBcompCoaFutureEffective" class="filing-subtitle">
                  <span>FILED AND PENDING (filed by {{filing.filingAuthor}} on {{filing.filingDate}})</span>
                  <v-tooltip top content-class="pending-tooltip">
                    <template v-slot:activator="{ on }">
                      <div class="pending-alert" v-on="on">
                        <v-icon color="orange darken-2">mdi-alert</v-icon>
                      </div>
                    </template>
                    <span>The updated office addresses will be legally effective on {{filing.effectiveDate}},
                      12:01 AM (Pacific Time). No other filings are allowed until then.</span>
                  </v-tooltip>
                </div>

                <div v-else-if="filing.isIaFutureEffective" class="filing-subtitle">
                  <span>FUTURE EFFECTIVE INCORPORATION</span>
                  <span class="vert-pipe"></span>
                  <span>PAID (filed by {{filing.filingAuthor}} on {{filing.filingDate}})</span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="blue darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    {{ (panel === index) ? "Hide Details" : "View Details" }}
                  </v-btn>
                </div>

                <div v-else-if="filing.isPaid" class="filing-subtitle">
                  <span class="orange--text text--darken-2">
                    PENDING FILING (filed by {{filing.filingAuthor}} on {{filing.filingDate}})
                  </span>
                  <span class="vert-pipe"></span>
                  <span>PAID</span>
                  <v-btn
                    class="details-btn"
                    outlined
                    color="orange darken-2"
                    :ripple=false
                    @click.stop="togglePanel(index)"
                  >
                    <v-icon left>mdi-alert</v-icon>
                    {{ (panel === index) ? "Hide Details" : "View Details" }}
                  </v-btn>
                </div>

                <!-- else filing is COMPLETED -->
                <div v-else class="filing-subtitle">
                  <span>FILED AND PAID (filed by {{filing.filingAuthor}} on {{filing.filingDate}})</span>
                </div>

                <div v-if="filing.comments.length > 0" class="filing-subtitle">
                  <v-btn
                    class="comments-btn"
                    outlined
                    color="primary"
                    :ripple=false
                    @click.stop="togglePanel(index)"
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})
                  </v-btn>
                </div>
              </div> <!-- end of subtitle -->
            </div> <!-- end of filing-label -->

            <div class="filing-item__actions">
              <v-btn
                class="expand-btn"
                outlined
                :ripple=false
                @click.stop="togglePanel(index)"
              >
                <span v-if="(panel === index)">{{ filing.paperOnly ? "Close" : "Hide Documents" }}</span>
                <span v-else>{{ filing.paperOnly ? "Request a Copy" : "View Documents" }}</span>
              </v-btn>

              <!-- the drop-down menu -->
              <v-menu offset-y left transition="slide-y-transition" v-if="isRoleStaff">
                <template v-slot:activator="{ on }">
                  <v-btn text v-on="on" class="menu-btn">
                    <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item-group color="primary">
                    <v-list-item :disabled="hasBlockerFiling || filing.isCorrection || filing.isIaFutureEffective">
                      <v-list-item-icon>
                        <v-icon>mdi-file-document-edit-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title
                        class="file-correction-item"
                        @click="correctThisFiling(filing)"
                      >
                        File a Correction
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-comment-plus</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title
                        class="add-detail-comment-item"
                        @click="showCommentDialog(filing.filingId)"
                      >
                        Add Detail
                      </v-list-item-title>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <template v-if="filing.isBcompCoaFutureEffective" />

          <template v-else-if="filing.isIaFutureEffective">
            <future-effective-filing :filing=filing />
            <v-divider class="mt-7 mb-5"></v-divider>
          </template>

          <template v-else-if="filing.isPaid">
            <pending-filing :filing=filing />
            <v-divider class="mt-7 mb-5"></v-divider>
          </template>

          <paper-filing v-if="filing.paperOnly" />

          <!-- the list of documents -->
          <v-list dense class="document-list py-0" v-if="filing.documents">
            <v-list-item
              v-for="(document, index) in filing.documents"
              :key="index"
            >
              <v-btn v-if="document.type === DOCUMENT_TYPE_REPORT"
                text color="primary"
                class="download-document-btn"
                @click="downloadDocument(document)"
                :disabled="loadingDocument || loadingReceipt || loadingAll"
                :loading="loadingDocument"
              >
                <v-icon>mdi-file-pdf-outline</v-icon>
                <span>{{document.title}}</span>
              </v-btn>

              <v-btn v-if="document.type === DOCUMENT_TYPE_RECEIPT"
                text color="primary"
                class="download-receipt-btn"
                @click="downloadReceipt(document)"
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

          <!-- the detail comments section -->
          <template v-if="filing.comments.length > 0">
            <v-divider class="mt-6"></v-divider>
            <details-list
              :filing=filing
              :isTask="false"
              @showCommentDialog="showCommentDialog($event)"
            />
          </template>

        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="!filedItems.length">
      <v-card-text>
        <div class="no-results__subtitle" v-if="tempRegNumber">Complete your filing to display</div>
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
import axios from '@/axios-auth'
import { mapGetters, mapState } from 'vuex'

// Components
import { DetailsList } from '@/components/common'
import PaperFiling from './PaperFiling.vue'
import PendingFiling from './PendingFiling.vue'
import FutureEffectiveFiling from './FutureEffectiveFiling.vue'

// Dialogs
import { AddCommentDialog, DownloadErrorDialog } from '@/components/dialogs'

// Enums and Constants
import { EntityTypes, FilingNames, FilingStatus, FilingTypes } from '@/enums'
import { ANNUAL_REPORT, CORRECTION, STANDALONE_ADDRESSES, STANDALONE_DIRECTORS } from '@/constants'

// Mixins
import { CommonMixin, DateMixin, EnumMixin, FilingMixin } from '@/mixins'

export default {
  name: 'FilingHistoryList',

  mixins: [CommonMixin, DateMixin, EnumMixin, FilingMixin],

  components: {
    DetailsList,
    PaperFiling,
    PendingFiling,
    FutureEffectiveFiling,
    AddCommentDialog,
    DownloadErrorDialog
  },

  data () {
    return {
      addCommentDialog: false,
      downloadErrorDialog: false,
      panel: null as number, // currently expanded panel
      filedItems: [] as Array<any>,
      loadingDocument: false,
      loadingReceipt: false,
      loadingAll: false,
      currentFilingId: null as number,

      // enums
      EntityTypes,
      FilingNames,
      FilingStatus,
      FilingTypes
    }
  },

  props: {
    hasBlockerFiling: null
  },

  computed: {
    ...mapGetters(['isRoleStaff']),

    ...mapState(['entityIncNo', 'filings', 'entityName']),

    /** The Incorporation Application's Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    }
  },

  created (): void {
    // constants
    this.DOCUMENT_TYPE_REPORT = 1
    this.DOCUMENT_TYPE_RECEIPT = 2

    // load data into this page
    this.loadData()
  },

  methods: {
    loadData () {
      this.filedItems = []

      // create filed items
      for (let i = 0; i < this.filings.length; i++) {
        const filing = this.filings[i].filing
        if (filing?.header?.date) {
          let filingDate = filing.header.date.slice(0, 10)
          if (filingDate < '2019-03-08' || filing.header.availableOnPaperOnly) {
            // filings before Bob Date
            this.loadPaperFiling(filing)
          } else {
            // filings on or after Bob Date
            switch (filing.header.name) {
              case FilingTypes.ANNUAL_REPORT:
                this.loadAnnualReport(filing)
                break
              case FilingTypes.CHANGE_OF_DIRECTORS:
                this.loadOtherReport(filing, filing.changeOfDirectors)
                break
              case FilingTypes.CHANGE_OF_ADDRESS:
                this.loadOtherReport(filing, filing.changeOfAddress)
                break
              case FilingTypes.CHANGE_OF_NAME:
                this.loadOtherReport(filing, filing.changeOfName)
                break
              case FilingTypes.CORRECTION:
                this.loadCorrection(filing)
                break
              case FilingTypes.INCORPORATION_APPLICATION:
                this.loadIncorporationApplication(filing)
                break
              case FilingTypes.SPECIAL_RESOLUTION:
                this.loadOtherReport(filing, filing.specialResolution)
                break
              case FilingTypes.VOLUNTARY_DISSOLUTION:
                this.loadOtherReport(FilingTypes.VOLUNTARY_DISSOLUTION, filing, filing.voluntaryDissolution)
                break
              default:
                // fallback for unknown filings
                this.loadPaperFiling(filing)
                break
            }
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('ERROR - invalid filing =', filing)
        }
      }

      this.$emit('filed-count', this.filedItems.length)
      this.$emit('filings-list', this.filedItems)

      // If there is an Incorp App item, emit the has-blocker-filings event to the parent component.
      // This indicates that a new filing cannot be started because this item has to be completed first.
      this.$emit('has-blocker-filing',
        this.filedItems.filter(item => {
          return (item.filingType === FilingTypes.INCORPORATION_APPLICATION)
        }).length > 0
      )

      // if needed, highlight a specific filing
      // NB: use unary plus operator to cast string to number
      const highlightId = +this.$route.query.filing_id // may be NaN (which is false)
      if (highlightId) { this.highlightFiling(highlightId) }
    },

    loadAnnualReport (filing: any) {
      const header = filing?.header
      const annualReport = filing?.annualReport

      if (header && annualReport) {
        const date = annualReport.annualReportDate
        if (date) {
          const filingType = header.name
          const agmYear = +date.slice(0, 4)
          const name = this.filingTypeToName(filingType, agmYear)

          const filingDateTime = this.convertUTCTimeToLocalTime(header.date)
          const filingDate = filingDateTime?.slice(0, 10)

          // build filing item
          const item = {
            filingType,
            title: name,
            filingId: header.filingId,
            filingAuthor: header.certifiedBy,
            filingDate,
            documents: [{
              type: this.DOCUMENT_TYPE_REPORT,
              filingId: header.filingId,
              title: name,
              filename: `${this.entityIncNo} - ${name} - ${filingDate}.pdf`
            }] as Array<any>,
            isCorrected: (header.isCorrected || false),
            isCorrectionPending: (header.isCorrectionPending || false),
            comments: this.flattenAndSortComments(header.comments)
          }

          // add receipt
          if (header.paymentToken) {
            item.documents.push({
              type: this.DOCUMENT_TYPE_RECEIPT,
              filingDateTime,
              paymentToken: header.paymentToken,
              title: 'Receipt',
              filename: `${this.entityIncNo} - Receipt - ${filingDate}.pdf`
            })
          }

          this.filedItems.push(item)
        } else {
          // eslint-disable-next-line no-console
          console.log('ERROR - invalid Annual Report Date in filing =', filing)
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    loadIncorporationApplication (filing: any) {
      const header = filing?.header
      const incorporationApplication = filing?.incorporationApplication

      if (header && incorporationApplication) {
        const filingType = header.name // NB: this is not NR type (but they should match)

        const filingDateTime = this.convertUTCTimeToLocalTime(header.date)
        const filingDate = filingDateTime?.slice(0, 10)

        // Effective Date is assigned by the backend when the filing is completed (normally right away).
        // Effective Date may be in the future (eg, for Incorp App future effective filings).
        // If Effective Date is empty, use Filing Date instead.
        const effectiveDateTime = this.convertUTCTimeToLocalTime(header.effectiveDate) || filingDateTime
        const effectiveDate = effectiveDateTime?.slice(0, 10)

        // is this a Future Effective Incorp App?
        const isIaFutureEffective = this.isFutureEffective(filing)

        // is this a paid filing?
        const isPaid = (header.status === FilingStatus.PAID)

        const name = this.filingTypeToName(filingType)
        let docFilename: string
        let receiptFilename: string
        if (isIaFutureEffective) {
          docFilename = `${this.entityIncNo} - ${name} (Future Effective) - ${filingDate}.pdf`
          receiptFilename = `${this.entityIncNo} - Receipt (Future Effective) - ${filingDate}.pdf`
        } else {
          docFilename = `${this.entityIncNo} - ${name} - ${filingDate}.pdf`
          receiptFilename = `${this.entityIncNo} - Receipt - ${filingDate}.pdf`
        }

        // build filing item
        const item: any = {
          filingType,
          title: `${this.entityTypeToName(this.entityType)} ${name} - ${this.entityName}`,
          filingId: header.filingId,
          filingAuthor: header.certifiedBy,
          filingDate,
          effectiveDateTime, // used for future effective Incorp App
          isIaFutureEffective,
          isPaid,
          documents: [{
            type: this.DOCUMENT_TYPE_REPORT,
            filingId: header.filingId,
            title: `${name}${isIaFutureEffective ? ' - Future Effective Incorporation' : ''}`,
            filename: docFilename
          }] as Array<any>,
          status: header.status,
          isCorrected: (header.isCorrected || false),
          isCorrectionPending: (header.isCorrectionPending || false),
          comments: this.flattenAndSortComments(header.comments)
        }

        // add receipt
        if (header.paymentToken) {
          item.documents.push({
            type: this.DOCUMENT_TYPE_RECEIPT,
            filingDateTime,
            paymentToken: header.paymentToken,
            title: `Receipt${isIaFutureEffective ? ' - Future Effective Incorporation' : ''}`,
            filename: receiptFilename
          })
        }

        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    loadOtherReport (filing: any, section: any) {
      const header = filing?.header

      if (header && section) {
        const filingType = header.name

        const filingDateTime = this.convertUTCTimeToLocalTime(header.date)
        const filingDate = filingDateTime?.slice(0, 10)

        // Effective Date is assigned by the backend when the filing is completed (normally right away).
        // Effective Date may be in the future (eg, for BCOMP COA filings).
        // If Effective Date is empty, use Filing Date instead.
        const effectiveDateTime = this.convertUTCTimeToLocalTime(header.effectiveDate) || filingDateTime
        const effectiveDate = effectiveDateTime?.slice(0, 10)

        const name = this.filingTypeToName(filingType)

        // is this a Future Effective BComp Change of Address?
        const isBcompCoaFutureEffective = this.isBComp() &&
          filingType === FilingTypes.CHANGE_OF_ADDRESS &&
          this.isFutureEffective(filing)

        // is this a paid filing?
        const isPaid = (header.status === FilingStatus.PAID)

        // build filing item
        const item: any = {
          filingType,
          title: name,
          filingId: header.filingId,
          filingAuthor: header.certifiedBy,
          filingDate,
          effectiveDate, // used for future effective COA
          isBcompCoaFutureEffective,
          isPaid,
          documents: [{
            type: this.DOCUMENT_TYPE_REPORT,
            filingId: header.filingId,
            title: name,
            filename: `${this.entityIncNo} - ${name} - ${filingDate}.pdf`
          }] as Array<any>,
          status: header.status,
          isCorrected: (header.isCorrected || false),
          isCorrectionPending: (header.isCorrectionPending || false),
          comments: this.flattenAndSortComments(header.comments)
        }

        // add receipt
        if (header.paymentToken) {
          item.documents.push({
            type: this.DOCUMENT_TYPE_RECEIPT,
            filingDateTime,
            paymentToken: header.paymentToken,
            title: 'Receipt',
            filename: `${this.entityIncNo} - Receipt - ${filingDate}.pdf`
          })
        }

        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    /**
     * Whether this filing is in a future effective state.
     * NB: uses data from header
     */
    isFutureEffective (filing: any): boolean {
      if ((filing?.header?.status === FilingStatus.PAID) && filing?.header?.effectiveDate) {
        const effectiveDateTime = new Date(filing.header.effectiveDate)
        const now = new Date()
        if (effectiveDateTime > now) {
          return true
        }
      }
      return false
    },

    loadCorrection (filing: any) {
      const header = filing?.header
      const correction = filing?.correction

      if (header && correction) {
        const item = {
          filingType: header.name,
          title: `Correction - ${this.filingTypeToName(correction.correctedFilingType)}`,
          filingId: header.filingId,
          filingAuthor: header.certifiedBy,
          filingDateTime: this.convertUTCTimeToLocalTime(header.date), // used for receipt
          filingDate: this.convertUTCTimeToLocalTime(correction.correctedFilingDate),
          isCorrection: true,
          correctedFilingId: correction.correctedFilingId,
          correctedFilingType: correction.correctedFilingType,
          comments: this.flattenAndSortComments(header.comments)
        }
        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    loadPaperFiling (filing: any) {
      const header = filing?.header

      if (header) {
        // since name is not guaranteed to exist, provide a fallback
        const filingType = header.name || 'unknown'

        let title: string
        if (filing.annualReport?.annualReportDate) {
          const agmYear = +filing.annualReport.annualReportDate.slice(0, 4)
          title = this.filingTypeToName(filingType, agmYear)
        } else {
          title = this.filingTypeToName(filingType)
        }

        const filingDateTime = this.convertUTCTimeToLocalTime(header.date)
        const filingDate = filingDateTime?.slice(0, 10)
        const filingYear = filingDate?.slice(0, 4)

        const item = {
          filingType,
          title,
          filingId: header.filingId,
          filingAuthor: 'Registry Staff',
          filingDate,
          filingYear,
          paperOnly: true,
          isCorrected: (header.isCorrected || false),
          isCorrectionPending: (header.isCorrectionPending || false),
          comments: this.flattenAndSortComments(header.comments)
        }
        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    /** Expands the panel of the specified Filing ID. */
    highlightFiling (filingId: number) {
      for (let i = 0; i < this.filedItems.length; i++) {
        const documents = this.filedItems[i].documents
        // NB: this only works if there is a filing document
        if (documents && documents[0].filingId === filingId) {
          this.panel = i
          break
        }
      }
    },

    correctThisFiling (filing: any) {
      switch (filing?.filingType) {
        case FilingTypes.ANNUAL_REPORT:
          // FUTURE:
          // this.$router.push({ name: ANNUAL_REPORT,
          //   params: { filingId: filing.filingId, isCorrection: true }})
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: filing.filingId } })
          break
        case FilingTypes.CHANGE_OF_DIRECTORS:
          // FUTURE:
          // this.$router.push({ name: STANDALONE_DIRECTORS,
          //   params: { filingId: filing.filingId, isCorrection: true } })
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: filing.filingId } })
          break
        case FilingTypes.CHANGE_OF_ADDRESS:
          // FUTURE:
          // this.$router.push({ name: STANDALONE_ADDRESSES,
          //   params: { filingId: filing.filingId, isCorrection: true } })
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: filing.filingId } })
          break
        case FilingTypes.INCORPORATION_APPLICATION:
          // for now, not allowed
          alert('At this time, you cannot correct an incorporation application. Please contact Ops if needed.')
          break
        case FilingTypes.CORRECTION:
          // FUTURE: allow a correction to a correction?
          // this.$router.push({ name: CORRECTION,
          //   params: { correctedFilingId: filing.filingId } })
          alert('At this time, you cannot correct a correction. Please contact Ops if needed.')
          break
        default:
          // fallback for all other filings
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: filing.filingId } })
          break
      }
    },

    async downloadDocument (document: any) {
      this.loadingDocument = true
      await this.downloadOneDocument(document)
      this.loadingDocument = false
    },

    async downloadOneDocument (document: any) {
      // safety check
      if (!document.filingId || !document.filename) return

      const url = `businesses/${this.entityIncNo}/filings/${document.filingId}`
      const headers = { 'Accept': 'application/pdf' }

      await axios.get(url, { headers: headers, responseType: 'blob' as 'json' }).then(response => {
        if (response) {
          /* solution from https://github.com/axios/axios/issues/1392 */

          // it is necessary to create a new blob object with mime-type explicitly set
          // otherwise only Chrome works like it should
          const blob = new Blob([response.data], { type: 'application/pdf' })

          // IE doesn't allow using a blob object directly as link href
          // instead it is necessary to use msSaveOrOpenBlob
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, document.filename)
          } else {
            // for other browsers, create a link pointing to the ObjectURL containing the blob
            const url = window.URL.createObjectURL(blob)
            const a = window.document.createElement('a')
            window.document.body.appendChild(a)
            a.setAttribute('style', 'display: none')
            a.href = url
            a.download = document.filename
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('downloadOneDocument() error - null response')
          this.downloadErrorDialog = true
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('loadOneDocument() error =', error)
        this.downloadErrorDialog = true
      })
    },

    async downloadReceipt (document: any) {
      this.loadingReceipt = true
      await this.downloadOneReceipt(document)
      this.loadingReceipt = false
    },

    async downloadOneReceipt (document: any) {
      // safety check
      if (!document.paymentToken || !document.filingDateTime || !document.filename) return

      const url = `${document.paymentToken}/receipts`
      const data = {
        corpName: this.entityName,
        filingDateTime: document.filingDateTime,
        fileName: 'receipt' // not used
      }
      const config = {
        headers: { 'Accept': 'application/pdf' },
        responseType: 'blob' as 'json',
        baseURL: sessionStorage.getItem('PAY_API_URL') + 'payment-requests/'
      }

      await axios.post(url, data, config).then(response => {
        if (response) {
          /* solution from https://github.com/axios/axios/issues/1392 */

          // it is necessary to create a new blob object with mime-type explicitly set
          // otherwise only Chrome works like it should
          const blob = new Blob([response.data], { type: 'application/pdf' })

          // IE doesn't allow using a blob object directly as link href
          // instead it is necessary to use msSaveOrOpenBlob
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, document.filename)
          } else {
            // for other browsers, create a link pointing to the ObjectURL containing the blob
            const url = window.URL.createObjectURL(blob)
            const a = window.document.createElement('a')
            window.document.body.appendChild(a)
            a.setAttribute('style', 'display: none')
            a.href = url
            a.download = document.filename
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('downloadOneReceipt() error - null response')
          this.downloadErrorDialog = true
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('downloadOneReceipt() error =', error)
        this.downloadErrorDialog = true
      })
    },

    async downloadAll (filing: any) {
      this.loadingAll = true
      // first download documents (if any)
      if (filing?.documents) {
        for (let i = 0; i < filing.documents.length; i++) {
          const type = filing.documents[i].type
          if (type === this.DOCUMENT_TYPE_REPORT) {
            await this.downloadOneDocument(filing.documents[i])
          }
          if (type === this.DOCUMENT_TYPE_RECEIPT) {
            await this.downloadOneReceipt(filing.documents[i])
          }
        }
      }
      this.loadingAll = false
    },

    showCommentDialog (filingId: number): void {
      this.currentFilingId = filingId
      this.addCommentDialog = true
    },

    async hideCommentDialog (needReload: boolean): Promise<void> {
      this.addCommentDialog = false
      // if needed, reload comments for this filing
      // NB: no spinner or state change, just do it quietly
      if (needReload) await this.reloadComments(this.currentFilingId)
    },

    async reloadComments (filingId: number): Promise<void> {
      // find the filing in the list
      const filing = this.filedItems.find(item => (item.filingId === filingId))

      if (filing) {
        // fetch latest comments for this filing
        const url = `businesses/${this.entityIncNo}/filings/${filingId}`
        await axios.get(url).then(res => {
          if (res && res.data && res.data.filing && res.data.filing.header) {
            // reassign just the comments
            filing.comments = this.flattenAndSortComments(res.data.filing.header.comments)
          } else {
            // eslint-disable-next-line no-console
            console.log('reloadComments() error - invalid response =', res)
          }
        }).catch(error => {
          // eslint-disable-next-line no-console
          console.log('reloadComments() error =', error)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('reloadComments() error - could not find filing id =', filingId)
      }
    },

    applyCorrectionTag (filing: any): string {
      return filing?.isCorrected ? ' - Corrected' : (filing?.isCorrectionPending ? ' - Correction Pending' : '')
    },

    /** Closes current panel or opens new panel. */
    togglePanel (index: number) {
      this.panel = (this.panel === index) ? null : index
    }
  },

  watch: {
    filings () {
      // if filings changes, reload them
      // (does not fire on initial page load)
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.filing-history-item {
  // disable expansion generally
  pointer-events: none;
}

// specifically enable anchors, buttons and the pending alert icon
// for this page and sub-components
::v-deep a,
::v-deep .v-btn,
::v-deep .pending-alert .v-icon {
  pointer-events: auto;
}

.list-item {
  align-items: flex-start;
  justify-content: space-between;
  padding: 0;
}

.v-col-padding {
  padding: 0 12px 0 12px;
}

.filing-label {
  flex-basis: 33.3333%;
  flex: 1 1 auto;
}

.list-item__subtitle {
  // make all subtitles the same height
  height: 2.25rem;
}

.pending-tooltip {
  max-width: 16rem;
}

.pending-alert .v-icon {
  font-size: 18px; // same as other v-icons
  padding-left: 0.875rem;
}

.filing-subtitle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: -0.5rem; // remove extra space when subtitle displays
}

// vertical pipe for separating subtitle statuses
.vert-pipe {
  margin-top: 0.1rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  height: 1rem;
  border-left: 1px solid $gray6;
}

.details-btn,
.expand-btn,
.comments-btn {
  margin-left: 0.25rem;
  border: none;
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

.filing-item__actions {
  display: inline-block;
  margin-right: 0.5rem;

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
  }
}

.document-list .v-list-item {
  padding-left: 0;
  min-height: 1.5rem;
}
</style>
