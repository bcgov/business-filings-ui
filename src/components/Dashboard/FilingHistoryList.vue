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
        <v-expansion-panel-header class="filing-item-toggle no-dropdown-icon">
          <div class="list-item">
            <div class="filing-label">
              <h3>{{filing.title}} {{applyCorrectionTag(filing)}}</h3>

              <div class="list-item__subtitle d-flex">

                <v-scale-transition v-if="isCoaFutureEffective(filing.type, filing.status)">
                  <v-tooltip top content-class="pending-tooltip">
                    <template v-slot:activator="{ on }">
                      <div id="pending-alert" class="list-item__subtitle" v-on="on">
                        <span>FILED AND PENDING (filed by {{filing.filingAuthor}} on {{filing.filingDate}})</span>
                        <v-icon color="yellow" small>mdi-alert</v-icon>
                      </div>
                    </template>
                    <span>The updated office addresses will be legally effective on {{filing.filingEffectiveDate}},
                      12:01 AM (Pacific Time). No other filings are allowed until then.</span>
                  </v-tooltip>
                </v-scale-transition>

                <template v-else-if="isPaid(filing.status)">
                  <div>
                    <span class="orange--text text--darken-2">FILING PENDING</span>
                    <span class="vert-pipe"></span>
                    <span>PAID</span>
                  </div>
                  <v-btn
                      class="expand-btn"
                      outlined
                      color="orange darken-2"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-alert</v-icon>
                      {{ (panel === index) ? "Hide Details" : "View Details" }}
                    </v-btn>
                </template>

                <!-- else filing is COMPLETED -->
                <span v-else>FILED AND PAID (filed by {{filing.filingAuthor}} on {{filing.filingDate}})</span>

                <template v-if="filing.comments.length > 0">
                  <v-btn
                    class="comments-btn"
                    outlined
                    :ripple=false
                    @click.stop="togglePanel(index)"
                  >
                    <v-icon small left>mdi-message-reply</v-icon>
                    Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})
                  </v-btn>
                </template>

              </div>
            </div>

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
                    <v-list-item :disabled="hasBlockerFiling || filing.isCorrection">
                      <v-list-item-icon>
                        <v-icon>mdi-file-document-edit-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title
                        class="file-correction-item"
                        @click="correctThisItem(filing)"
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
          <pending-filing v-if="isPaid(filing.status)" :title=filing.title />

          <paper-filing v-if="filing.paperOnly" />

          <v-list dense class="py-0" v-else>
            <v-list-item
              class="px-0"
              v-for="(document, index) in filing.filingDocuments"
              :key="index"
            >
              <v-btn text color="primary"
                class="download-document-btn"
                @click="downloadDocument(document)"
                :disabled="loadingDocument"
                :loading="loadingDocument"
              >
                <v-icon>mdi-file-pdf-outline</v-icon>
                <span>{{document.name}}</span>
              </v-btn>
            </v-list-item>

            <v-list-item class="px-0" v-if="filing.paymentToken">
              <v-btn text color="primary"
                class="download-receipt-btn"
                @click="downloadReceipt(filing)"
                :disabled="loadingReceipt"
                :loading="loadingReceipt"
              >
                <v-icon>mdi-file-pdf-outline</v-icon>
                <span>Receipt</span>
              </v-btn>
            </v-list-item>

            <v-list-item class="px-0" v-if="!filing.paperOnly">
              <v-btn text color="primary"
                class="download-all-btn"
                @click="downloadAll(filing)"
                :disabled="loadingAll"
                :loading="loadingAll"
              >
                <v-icon>mdi-download</v-icon>
                <span>Download All</span>
              </v-btn>
            </v-list-item>
          </v-list>

          <!-- the detail comments section -->
          <details-list
             v-if="filing.comments.length > 0"
            :filing=filing
            :isTask="false"
            @showCommentDialog="showCommentDialog($event)"
          />

        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="!filedItems.length">
      <v-card-text>
        <div class="no-results__subtitle" v-if="nrNumber">Complete your filing to display</div>
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
    AddCommentDialog,
    DownloadErrorDialog
  },

  data () {
    return {
      addCommentDialog: false,
      downloadErrorDialog: false,
      panel: null as number, // currently expanded panel
      filedItems: [],
      loadingDocument: false,
      loadingReceipt: false,
      loadingAll: false,
      currentFilingId: null,

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

    /** The NR Number string. */
    nrNumber (): string {
      return sessionStorage.getItem('NR_NUMBER')
    }
  },

  created (): void {
    // load data into this page
    this.loadData()
  },

  methods: {
    loadData () {
      this.filedItems = []

      // create filed items
      for (let i = 0; i < this.filings.length; i++) {
        const filing = this.filings[i].filing
        if (filing && filing.header) {
          let filingDate = filing.header.date.slice(0, 10)
          if (filingDate < '2019-03-08' || filing.header.availableOnPaperOnly) {
            // filings before Bob Date
            this.loadPaperFiling(filing)
          } else {
            // filings on or after Bob Date
            switch (filing.header.name) {
              case FilingTypes.ANNUAL_REPORT:
                this.loadAnnualReport(filing, filing.annualReport)
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
                this.loadCorrection(filing, filing.correction)
                break
              case FilingTypes.INCORPORATION_APPLICATION:
                this.loadOtherReport(filing, filing.incorporationApplication)
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
          console.log('ERROR - invalid filing or filing header =', filing)
        }
      }

      this.$emit('filed-count', this.filedItems.length)
      this.$emit('filings-list', this.filedItems)

      // if needed, highlight a specific filing
      // NB: use unary plus operator to cast string to number
      const highlightId = +this.$route.query.filing_id // may be NaN (which is false)
      if (highlightId) { this.highlightFiling(highlightId) }
    },

    // Extracts date from a local datetime string
    // Returns "yyyy-mm-dd"
    formatDate (dateString: string): string {
      if (!dateString) return null // safety check
      return dateString.split(' ')[0]
    },

    loadAnnualReport (filing, section) {
      if (section) {
        const date = section.annualReportDate
        if (date) {
          const localDateTime = this.convertUTCTimeToLocalTime(filing.header.date)
          const filingDate = this.formatDate(localDateTime)

          const type = filing.header.name
          const agmYear = +date.slice(0, 4)
          const title = this.filingTypeToName(type, agmYear)
          const item = {
            type: type,
            title: title,
            filingId: filing.header.filingId,
            filingAuthor: filing.header.certifiedBy,
            filingDateTime: localDateTime,
            filingDate: filingDate,
            paymentToken: filing.header.paymentToken,
            filingDocuments: [{
              filingId: filing.header.filingId,
              name: 'Annual Report',
              documentName: `${this.entityIncNo} - ${title} - ${filingDate}.pdf`
            }],
            isCorrected: filing.header.isCorrected || false,
            isCorrectionPending: filing.header.isCorrectionPending || false,
            comments: this.flattenAndSortComments(filing.header.comments)
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

    loadOtherReport (filing, section) {
      if (section) {
        const localDateTime = this.convertUTCTimeToLocalTime(filing.header.date)
        const filingDate = this.formatDate(localDateTime)

        // Effective date is when the filing is applied to the backend, assigned by the backend when the filing is made.
        // Currently, all filings will be applied immediately except a change of address for a Benefit Company
        // The latter is always effective the following day at 12:01 AM Pacific Time
        let effectiveDate = filing.header.date.slice(0, 10)
        if (filing.header.effectiveDate) effectiveDate = filing.header.effectiveDate.slice(0, 10)

        const type = filing.header.name
        const title = this.filingTypeToName(type)

        const item = {
          type: type,
          title: title,
          filingId: filing.header.filingId,
          filingAuthor: filing.header.certifiedBy,
          filingDateTime: localDateTime,
          filingDate: filingDate,
          filingEffectiveDate: effectiveDate,
          paymentToken: filing.header.paymentToken,
          filingDocuments: [{
            filingId: filing.header.filingId,
            name: title,
            documentName: `${this.entityIncNo} - ${title} - ${filingDate}.pdf`
          }],
          status: filing.header.status,
          isCorrected: filing.header.isCorrected || false,
          isCorrectionPending: filing.header.isCorrectionPending || false,
          comments: this.flattenAndSortComments(filing.header.comments)
        }
        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    loadCorrection (filing, section) {
      if (section) {
        const localDateTime = this.convertUTCTimeToLocalTime(filing.header.date)

        const item = {
          type: filing.header.name,
          title: `Correction - ${this.filingTypeToName(filing.correction.correctedFilingType)}`,
          filingId: filing.header.filingId,
          filingAuthor: filing.header.certifiedBy,
          filingDateTime: localDateTime,
          filingDate: filing.correction.correctedFilingDate,
          isCorrection: true,
          paymentToken: filing.header.paymentToken,
          corrFilingId: filing.correction.correctedFilingId,
          correctedFilingType: filing.correction.correctedFilingType,
          comments: this.flattenAndSortComments(filing.header.comments)
        }
        this.filedItems.push(item)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - missing section in filing =', filing)
      }
    },

    loadPaperFiling (filing) {
      // split name on camelcase and capitalize first letters
      if (!filing || !filing.header || !filing.header.name) return // safety check

      const localDateTime = this.convertUTCTimeToLocalTime(filing.header.date)
      const filingDate = this.formatDate(localDateTime)

      const type = filing.header.name

      let title: string
      if (filing.annualReport && filing.annualReport.annualReportDate) {
        const agmYear: number = +filing.annualReport.annualReportDate.slice(0, 4)
        title = this.filingTypeToName(type, agmYear)
      } else {
        title = this.filingTypeToName(type)
      }

      const item = {
        type: type,
        title: title,
        filingId: filing.header.filingId,
        filingAuthor: 'Registry Staff',
        filingDate: filingDate,
        filingYear: filing.header.date.slice(0, 4),
        paymentToken: null,
        filingDocuments: [{
          filingId: filing.header.filingId,
          name: title,
          documentName: null
        }],
        paperOnly: true,
        isCorrected: filing.header.isCorrected || false,
        isCorrectionPending: filing.header.isCorrectionPending || false,
        comments: this.flattenAndSortComments(filing.header.comments)
      }
      this.filedItems.push(item)
    },

    /** Expands the panel of the specified Filing ID. */
    highlightFiling (filingId: number) {
      for (let i = 0; i < this.filedItems.length; i++) {
        const filingDocuments = this.filedItems[i].filingDocuments
        // NB: this only works if there is a filing document
        if (filingDocuments && filingDocuments[0].filingId === filingId) {
          this.panel = i
          break
        }
      }
    },

    correctThisItem (item) {
      if (!item || !item.type) return // safety check
      switch (item.type) {
        case FilingTypes.ANNUAL_REPORT:
          // FUTURE:
          // this.$router.push({ name: ANNUAL_REPORT,
          //   params: { filingId: item.filingId, isCorrection: true }})
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: item.filingId } })
          break
        case FilingTypes.CHANGE_OF_DIRECTORS:
          // FUTURE:
          // this.$router.push({ name: STANDALONE_DIRECTORS,
          //   params: { filingId: item.filingId, isCorrection: true } })
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: item.filingId } })
          break
        case FilingTypes.CHANGE_OF_ADDRESS:
          // FUTURE:
          // this.$router.push({ name: STANDALONE_ADDRESSES,
          //   params: { filingId: item.filingId, isCorrection: true } })
          // FOR NOW:
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: item.filingId } })
          break
        case FilingTypes.CORRECTION:
          // FUTURE: allow a correction to a correction?
          // this.$router.push({ name: CORRECTION,
          //   params: { correctedFilingId: item.filingId } })
          alert('At this time, you cannot correct a correction. Please contact Ops if needed.')
          break
        default:
          // fallback for all other filings
          this.$router.push({ name: CORRECTION,
            params: { correctedFilingId: item.filingId } })
          break
      }
    },

    async downloadDocument (filingDocument) {
      this.loadingDocument = true
      await this.downloadOneDocument(filingDocument)
      this.loadingDocument = false
    },

    async downloadOneDocument (filingDocument) {
      const url = `businesses/${this.entityIncNo}/filings/${filingDocument.filingId}`
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
            window.navigator.msSaveOrOpenBlob(blob, filingDocument.documentName)
          } else {
            // for other browsers, create a link pointing to the ObjectURL containing the blob
            const url = window.URL.createObjectURL(blob)
            const a = window.document.createElement('a')
            window.document.body.appendChild(a)
            a.setAttribute('style', 'display: none')
            a.href = url
            a.download = filingDocument.documentName
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
        console.error('loadOneDocument() error =', error)
        this.downloadErrorDialog = true
      })
    },

    async downloadReceipt (filing) {
      this.loadingReceipt = true
      await this.downloadOneReceipt(filing)
      this.loadingReceipt = false
    },

    async downloadOneReceipt (filing) {
      if (!filing.paymentToken || !filing.filingDateTime || !filing.filingDate) return // safety check

      const url = `${filing.paymentToken}/receipts`
      const data = {
        corpName: this.entityName,
        filingDateTime: filing.filingDateTime,
        fileName: 'receipt' // not used
      }
      const config = {
        headers: { 'Accept': 'application/pdf' },
        responseType: 'blob' as 'json',
        baseURL: sessionStorage.getItem('PAY_API_URL') + 'payment-requests/'
      }

      await axios.post(url, data, config).then(response => {
        if (response) {
          const fileName = `${this.entityIncNo} - Receipt - ${filing.filingDate}.pdf`

          /* solution from https://github.com/axios/axios/issues/1392 */

          // it is necessary to create a new blob object with mime-type explicitly set
          // otherwise only Chrome works like it should
          const blob = new Blob([response.data], { type: 'application/pdf' })

          // IE doesn't allow using a blob object directly as link href
          // instead it is necessary to use msSaveOrOpenBlob
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName)
          } else {
            // for other browsers, create a link pointing to the ObjectURL containing the blob
            const url = window.URL.createObjectURL(blob)
            const a = window.document.createElement('a')
            window.document.body.appendChild(a)
            a.setAttribute('style', 'display: none')
            a.href = url
            a.download = fileName
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
        console.error('downloadOneReceipt() error =', error)
        this.downloadErrorDialog = true
      })
    },

    async downloadAll (filing) {
      this.loadingAll = true
      // first download documents (if any)
      if (filing.filingDocuments) {
        for (let i = 0; i < filing.filingDocuments.length; i++) {
          await this.downloadOneDocument(filing.filingDocuments[i])
        }
      }
      // finally download receipt
      if (filing.paymentToken) {
        await this.downloadOneReceipt(filing)
      }
      this.loadingAll = false
    },

    /**
     * Whether this specific filing is a future affective COA.
     * @param filingType The type of the filing in the history list.
     * @param status The status of the filing in the history list.
     */
    isCoaFutureEffective (filingType: string, status: string): boolean {
      return (
        this.isBComp() &&
        filingType === FilingTypes.CHANGE_OF_ADDRESS &&
        this.isPaid(status)
      )
    },

    /**
     * Whether this specific filing is paid.
     * @param status The status of the filing in the history list.
     */
    isPaid (status: string): boolean {
      return (status === FilingStatus.PAID)
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
          console.error('reloadComments() error =', error)
        })
      } else {
        // eslint-disable-next-line no-console
        console.error('reloadComments() error - could not find filing id =', filingId)
      }
    },

    applyCorrectionTag (item: any): string {
      return item.isCorrected ? '- Corrected' : item.isCorrectionPending ? '- Correction Pending' : ''
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
  // disable expansion in general
  pointer-events: none;
}

// specifically enable anchors and buttons
// for this page and sub-components
::v-deep a,
::v-deep .v-btn {
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

.pending-tooltip {
  max-width: 16rem;
}

// .pending-icon {
//   background-color: black;
// }

// vertical pipe for separating subtitle statuses
.vert-pipe {
  margin-top: 0.1rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  height: 1rem;
  border-left: 1px solid $gray6;
}

.comments-btn {
  border: none;

  // bullet for separating subtitle and comments button
  &:before {
    display: inline-block;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    content: "•";
  }
}

.expand-btn {
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

.filing-history-item h3 {
  margin-bottom: 0.25rem;
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
</style>
