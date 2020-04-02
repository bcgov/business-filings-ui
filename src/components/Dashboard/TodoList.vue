<template>
  <div id="todo-list">
    <add-comment-dialog
      :dialog="addCommentDialog"
      :filingId="currentFilingId"
      @close="hideCommentDialog($event)"
      attach="#todo-list"
    />

    <confirm-dialog
      ref="confirm"
      attach="#todo-list"
    />

    <confirm-dialog
      ref="confirmCancelPaymentDialog"
      attach="#todo-list"
    />

    <delete-error-dialog
      :dialog="deleteErrorDialog"
      :errors="deleteErrors"
      :warnings="deleteWarnings"
      @okay="resetErrors"
      attach="#todo-list"
    />

    <cancel-payment-error-dialog
      :dialog="cancelPaymentErrorDialog"
      :errors="cancelPaymentErrors"
      @okay="resetCancelPaymentErrors"
      attach="#todo-list"
    />

    <v-expansion-panels v-if="taskItems && taskItems.length > 0" accordion>
      <v-expansion-panel
        class="align-items-top todo-item"
        expand-icon=""
        v-for="(task, index) in orderBy(taskItems, 'order')"
        :key="index"
        :class="{
          'disabled': !task.enabled,
          'draft': isStatusDraft(task) && !isTypeCorrection(task)
        }"
      >
        <v-expansion-panel-header class="todo-item-toggle no-dropdown">
          <div class="list-item">
            <div class="todo-label">
              <h3 class="list-item__title">{{task.title}}
                <div v-if="isTypeCorrection(task) && isStatusDraft(task)">
                  <v-btn small icon color="red" class="info-btn">
                    <v-icon>mdi-information-outline</v-icon>
                  </v-btn>
                </div>
              </h3>

              <div class="bcorps-ar-subtitle"
                v-if="businessId && isBComp() && isTypeAnnualReport(task) && isStatusNew(task)"
              >
                <p>Verify your Office Address and Current Directors before filing your Annual Report.</p>
                <v-checkbox
                  class="todo-list-checkbox"
                  label="All information about the Office Addresses and Current Directors is correct."
                  :disabled=!task.enabled
                  v-model="confirmCheckbox"
                  @click.native.stop
                />
              </div>

              <div class="list-item__subtitle">
                <div v-if="(isCoop() || isCorp()) && task.subtitle" class="todo-status">
                  <span>{{task.subtitle}}</span>
                </div>

                <div v-if="isTypeCorrection(task) && isStatusDraft(task)" class="todo-status">
                  <div>DRAFT</div>
                  <v-btn x-small icon class="info-btn">
                    <v-icon>mdi-message-reply</v-icon>
                  </v-btn>
                  Detail{{task.comments.length > 1 ? "s" : ""}} ({{task.comments.length}})
                </div>

                <div v-else-if="isStatusDraft(task)" class="todo-status">
                  <div>DRAFT</div>
                </div>

                <div v-else-if="isTypeCorrection(task) && isStatusCorrectionPending(task)" class="todo-status">
                  <span class="before-details">FILING PENDING</span>
                  <v-btn x-small icon class="info-btn">
                    <v-icon>mdi-message-reply</v-icon>
                  </v-btn>
                  Detail{{task.comments.length > 1 ? "s" : ""}} ({{task.comments.length}})
                </div>

                <div v-else-if="isStatusPending(task)" class="todo-status">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe">&nbsp;</div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAYMENT INCOMPLETE</span>
                    <v-btn small icon color="black" class="info-btn">
                      <v-icon>mdi-information-outline</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="isStatusError(task)" class="todo-status">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe">&nbsp;</div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAYMENT UNSUCCESSFUL</span>
                    <v-btn small icon color="black" class="info-btn">
                      <v-icon>mdi-information-outline</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="isStatusPaid(task)" class="todo-status">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe">&nbsp;</div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAID</span>
                    <v-btn small icon color="black" class="info-btn">
                      <v-icon>mdi-information-outline</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <div class="list-item__actions">
              <div style="width:100%">
                <p class="date-subtitle" v-if="isBComp() && isTypeAnnualReport(task) && isStatusNew(task)">
                  Due {{task.nextArDate}}
                </p>

                <!-- pre-empt any buttons below -->
                <template v-if="inProcessFiling === task.id">
                  <v-btn text loading disabled />
                </template>

                <template v-else-if="isRoleStaff && isTypeCorrection(task) && isStatusDraft(task)">
                  <v-btn class="btn-corr-draft-resume"
                     color="primary"
                     :disabled="!task.enabled"
                     @click.native.stop="doResumeFiling(task)"
                  >
                    <span>Resume</span>
                  </v-btn>
                </template>

                <div v-else-if="!isTypeCorrection(task)">
                  <template v-if="isStatusDraft(task)">
                    <v-btn class="btn-draft-resume"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumeFiling(task)"
                    >
                      <span>Resume</span>
                    </v-btn>
                    <!-- dropdown menu -->
                    <v-menu offset-y left>
                      <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="actions__more-actions__btn px-0"
                          v-on="on" id="menu-activator" :disabled="!task.enabled"
                        >
                          <v-icon>mdi-menu-down</v-icon>
                        </v-btn>
                      </template>
                      <v-list ref="draft_actions" class="actions__more-actions">
                        <v-list-item
                          v-if="businessId"
                          id="btn-delete-draft"
                          @click="confirmDeleteDraft(task)"
                        >
                          <v-list-item-title>Delete Draft</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          v-if="nrNumber"
                          id="btn-delete-incorporation"
                          @click="confirmDeleteIncorporation(task)"
                        >
                          <v-list-item-title>Delete Incorporation Application</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>

                  <template v-else-if="isStatusPending(task)">
                    <v-btn class="btn-resume-payment"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumePayment(task)"
                    >
                      <span>Resume Payment</span>
                    </v-btn>
                    <!-- dropdown menu -->
                    <v-menu offset-y left>
                      <template v-slot:activator="{ on }">
                        <v-btn color="primary"
                          v-on="on" id="pending-item-menu-activator" :disabled="!task.enabled"
                          class="actions__more-actions__btn px-0"
                          @click.native.stop
                          data-test-id="btn-pending-filing-menu"
                        >
                          <v-icon>mdi-menu-down</v-icon>
                        </v-btn>
                      </template>
                      <v-list ref="pending_actions" class="actions__more-actions">
                        <v-list-item id="btn-cancel-payment" @click="confirmCancelPayment(task)"
                          data-test-id="btn-cancel-payment"
                        >
                          <v-list-item-title>Cancel Payment</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>

                  <v-btn v-else-if="isStatusError(task)"
                    class="btn-retry-payment"
                    color="primary"
                    :disabled="!task.enabled"
                    @click.native.stop="doResumePayment(task)"
                  >
                    <span>Retry Payment</span>
                  </v-btn>

                  <template v-else-if="isStatusPaid(task)">
                    <!-- no action button in this case -->
                  </template>

                  <v-btn v-else-if="!isStatusCompleted(task) && isTypeAnnualReport(task)"
                    class="btn-file-now"
                    color="primary"
                    :disabled="!task.enabled || coaPending || !confirmCheckbox || hasBlockerFiling"
                    @click.native.stop="doFileNow(task)"
                  >
                    <span>File Annual Report</span>
                  </v-btn>

                  <v-btn v-else-if="!isStatusCompleted(task) && isTypeNameRequest(task)"
                    class="btn-file-now"
                    color="primary"
                    :disabled="!task.enabled"
                    @click.native.stop="doFileNow(task)"
                  >
                    <span>Incorporate using this NR</span>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <div v-if="isTypeCorrection(task)">
            <div v-if="isStatusDraft(task)" data-test-class="correction-draft" class="todo-list-detail">
              <p class="list-item__subtitle">
                This filing is in review and has been saved as a draft.<br />
                Normal processing times are 2 to 5 business days; Priority processing times are 1 to 2 business days.
              </p>
              <!-- the detail comments section -->
              <details-list
                :filing=task
                :isTask="true"
                @showCommentDialog="showCommentDialog($event)"
              />
            </div>

            <div v-else data-test-class="correction-pending" class="todo-list-detail">
            <p class="list-item__subtitle">This filing is pending review by Registry Staff.<br />
              Normal processing times are 2 to 5 business days; Priority processing times are 1 to 2 business days.</p>
            <!-- the detail comments section -->
            <details-list
              :filing=task
              :isTask="true"
              @showCommentDialog="showCommentDialog($event)"
            />
          </div>
          </div>
          <v-card v-else-if="isStatusPending(task)" data-test-class="payment-incomplete">
            <v-card-text>
              <p class="font-weight-bold black--text">Payment Incomplete</p>
              <p>This filing is pending payment. The payment may still be in progress or may have been
                interrupted for some reason.<p>
              <p>You may continue this filing by selecting "Resume Payment".</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="isStatusError(task)" data-test-class="payment-unsuccessful">
            <v-card-text>
              <p class="font-weight-bold black--text">Payment Unsuccessful</p>
              <p>This filing is pending payment. The payment appears to have been unsuccessful for some
                reason.</p>
              <p>You may continue this filing by selecting "Retry Payment".</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="isStatusPaid(task)" data-test-class="payment-paid">
            <v-card-text>
              <p class="font-weight-bold black--text">Paid</p>
              <p>This filing is paid but the filing is not yet complete. Please check again later.</p>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="taskItems && !taskItems.length">
      <v-card-text>
        <div class="no-results__title">You don't have anything to do yet</div>
        <div class="no-results__subtitle">Filings that require your attention will appear here</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import axios from '@/axios-auth'
import { mapState, mapActions, mapGetters } from 'vuex'
import Vue2Filters from 'vue2-filters' // needed for orderBy

// Components
import { DetailsList } from '@/components/common'

// Dialogs
import { AddCommentDialog, ConfirmDialog, DeleteErrorDialog, CancelPaymentErrorDialog } from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, EnumMixin, FilingMixin } from '@/mixins'

// Enums and Constants
import { EntityTypes, FilingStatus, FilingTypes } from '@/enums'
import { ANNUAL_REPORT, CORRECTION, STANDALONE_ADDRESSES, STANDALONE_DIRECTORS } from '@/constants'

export default {
  name: 'TodoList',

  components: {
    AddCommentDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    DetailsList
  },

  mixins: [CommonMixin, DateMixin, EnumMixin, FilingMixin, Vue2Filters.mixin],

  data () {
    return {
      addCommentDialog: false,
      taskItems: null,
      deleteErrors: [],
      deleteWarnings: [],
      deleteErrorDialog: false,
      cancelPaymentErrors: [],
      cancelPaymentErrorDialog: false,
      confirmCheckbox: false,
      confirmEnabled: false,
      currentFilingId: null,

      // enums
      EntityTypes,
      FilingStatus
    }
  },

  props: {
    inProcessFiling: null,
    coaPending: null,
    hasBlockerFiling: null
  },

  computed: {
    ...mapGetters(['isRoleStaff']),

    ...mapState(['tasks', 'entityIncNo', 'entityName']),

    /** The Business ID string. */
    businessId (): string | null {
      return sessionStorage.getItem('BUSINESS_ID')
    },

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
    ...mapActions(['setARFilingYear', 'setCurrentFilingStatus']),

    loadData () {
      this.taskItems = []
      // If the Entity is a COOP, Enable the 'FileNow' Button without any user validation
      if (this.isCoop()) this.confirmCheckbox = true

      // create task items
      this.tasks.forEach(task => {
        if (task && task.task && task.task.todo) {
          this.loadTodoItem(task)
        } else if (task && task.task && task.task.filing) {
          this.loadFilingItem(task)
        } else {
          // eslint-disable-next-line no-console
          console.log('ERROR - got unknown task =', task)
        }
      })

      this.$emit('todo-count', this.taskItems.length)
      this.$emit('todo-filings', this.taskItems)

      // If this is a draft/pending/error/paid item, emit the has-blocker-filings event to the parent component.
      // This indicates that a new filing cannot be started because this one has to be completed first.
      this.$emit('has-blocker-filing',
        this.taskItems.filter(item => {
          return (this.isStatusDraft(item) || this.isStatusPending(item) || this.isStatusError(item) ||
            this.isStatusPaid(item) || this.isTypeCorrection(item))
        }).length > 0
      )
    },

    loadTodoItem (task) {
      const todo = task.task.todo
      if (todo && todo.header) {
        switch (todo.header.name) {
          case FilingTypes.ANNUAL_REPORT: {
            const ARFilingYear = todo.header.ARFilingYear
            this.taskItems.push({
              type: FilingTypes.ANNUAL_REPORT,
              title: `File ${ARFilingYear} Annual Report`,
              subtitle: task.enabled ? '(including Address and/or Director Change)' : null,
              ARFilingYear,
              status: todo.header.status || FilingStatus.NEW,
              enabled: Boolean(task.enabled),
              order: task.order,
              nextArDate: this.toReadableDate(todo.business?.nextAnnualReport)
            })
            break
          }
          case FilingTypes.NAME_REQUEST:
            this.taskItems.push({
              type: FilingTypes.NAME_REQUEST,
              title: `Name Request ${this.nrNumber} - ${this.entityName}`,
              subtitle: `APPROVED - ${this.expiresText(todo)}`,
              status: todo.header.status || FilingStatus.NEW,
              enabled: Boolean(task.enabled),
              order: task.order
            })
            break
          default:
            // eslint-disable-next-line no-console
            console.log('ERROR - got unknown todo item =', todo)
            break
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid todo or header in task =', task)
      }
    },

    expiresText (task): string {
      // NB: if expiration date is today (0) then NR is expired
      const expireDays = this.daysFromToday(task.nameRequest?.expirationDate)
      if (isNaN(expireDays) || expireDays < 1) {
        return 'Expired'
      } else if (expireDays < 2) {
        return 'Expires today'
      } else if (expireDays < 3) {
        return 'Expires tomorrow'
      } else {
        return `Expires in ${expireDays} days`
      }
    },

    loadFilingItem (task) {
      const filing = task.task.filing
      if (filing && filing.header) {
        switch (filing.header.name) {
          case FilingTypes.ANNUAL_REPORT:
            this.loadAnnualReport(task)
            break
          case FilingTypes.CHANGE_OF_DIRECTORS:
            this.loadChangeOfDirectors(task)
            break
          case FilingTypes.CHANGE_OF_ADDRESS:
            this.loadChangeOfAddress(task)
            break
          case FilingTypes.CORRECTION:
            this.loadCorrection(task)
            break
          case FilingTypes.INCORPORATION_APPLICATION:
            this.loadIncorporationApplication(task)
            break
          default:
            // eslint-disable-next-line no-console
            console.log('ERROR - got unknown filing item =', filing)
            break
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header in task =', task)
      }
    },

    loadAnnualReport (task) {
      let date
      const filing = task.task.filing
      if (filing && filing.header && filing.annualReport) {
        filing.annualReport.annualReportDate
          ? date = filing.annualReport.annualReportDate
          : date = filing.annualReport.nextARDate
        if (date) {
          const ARFilingYear = +date.substring(0, 4)
          this.taskItems.push({
            type: FilingTypes.ANNUAL_REPORT,
            id: filing.header.filingId,
            title: `File ${ARFilingYear} Annual Report`,
            draftTitle: `${ARFilingYear} Annual Report`,
            ARFilingYear,
            status: filing.header.status || FilingStatus.NEW,
            enabled: Boolean(task.enabled),
            order: task.order,
            paymentToken: filing.header.paymentToken || null
          })
        } else {
          // eslint-disable-next-line no-console
          console.log('ERROR - invalid date in filing =', filing)
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or annualReport in task =', task)
      }
    },

    loadChangeOfDirectors (task) {
      const filing = task.task.filing
      if (filing && filing.header && filing.changeOfDirectors) {
        this.taskItems.push({
          type: FilingTypes.CHANGE_OF_DIRECTORS,
          id: filing.header.filingId,
          title: `File Director Change`,
          draftTitle: `Director Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfDirectors in task =', task)
      }
    },

    loadChangeOfAddress (task) {
      const filing = task.task.filing
      if (filing && filing.header && filing.changeOfAddress) {
        this.taskItems.push({
          type: FilingTypes.CHANGE_OF_ADDRESS,
          id: filing.header.filingId,
          title: `File Address Change`,
          draftTitle: `Address Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfAddress in task =', task)
      }
    },

    loadCorrection (task) {
      const filing = task.task.filing
      if (filing && filing.header && filing.correction) {
        this.taskItems.push({
          type: FilingTypes.CORRECTION,
          id: filing.header.filingId,
          filingDate: filing.correction.correctedFilingDate,
          corrFilingId: filing.correction.correctedFilingId,
          correctedFilingType: this.filingTypeToName(filing.correction.correctedFilingType),
          title: `${this.isPriority(filing.header.priority)} -
            ${this.filingTypeToName(filing.correction.correctedFilingType)}`,
          draftTitle: `${this.filingTypeToName(filing.correction.correctedFilingType)}`,
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order,
          comments: this.flattenAndSortComments(filing.header.comments)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfAddress in task =', task)
      }
    },

    loadIncorporationApplication (task) {
      const filing = task.task.filing
      if (filing && filing.header && filing.incorporationApplication) {
        this.taskItems.push({
          type: FilingTypes.INCORPORATION_APPLICATION,
          id: filing.header.filingId,
          title: `${this.entityTypeToName(this.entityType)}  Incorporation Application - ${this.entityName}`,
          draftTitle: 'Incorporation Application',
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or incorporationApplication in task =', task)
      }
    },

    doFileNow (task) {
      switch (task.type) {
        case FilingTypes.ANNUAL_REPORT:
          // file the subject Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.NEW)
          this.$router.push({ name: ANNUAL_REPORT, params: { filingId: 0 } }) // 0 means "new AR"
          break
        case FilingTypes.NAME_REQUEST:
          // redirect to Create web app to create this Incorporation Application
          const createUrl = sessionStorage.getItem('CREATE_URL')
          const url = `${createUrl}?nrNumber=${this.nrNumber}`
          // assume Create URL is always reachable
          window.location.assign(url)
          break
        default:
          // eslint-disable-next-line no-console
          console.log('doFileNow(), invalid type for item =', task)
          break
      }
    },

    doResumeFiling (task) {
      switch (task.type) {
        case FilingTypes.ANNUAL_REPORT:
          // resume this Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: ANNUAL_REPORT, params: { filingId: task.id } })
          break
        case FilingTypes.CHANGE_OF_DIRECTORS:
          // resume this Change Of Directors
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: STANDALONE_DIRECTORS, params: { filingId: task.id } })
          break
        case FilingTypes.CHANGE_OF_ADDRESS:
          // resume this Change Of Address
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: STANDALONE_ADDRESSES, params: { filingId: task.id } })
          break
        case FilingTypes.CORRECTION:
          // resume this Correction Filing
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: CORRECTION,
            params: { filingId: task.id, correctedFilingId: task.corrFilingId }
          })
          break
        case FilingTypes.INCORPORATION_APPLICATION:
          // redirect to Create web app to resume this Incorporation Application
          const createUrl = sessionStorage.getItem('CREATE_URL')
          const url = `${createUrl}?nrNumber=${this.nrNumber}`
          // assume Create URL is always reachable
          window.location.assign(url)
          break
        default:
          // eslint-disable-next-line no-console
          console.log('doFileNow(), invalid type for item =', task)
          break
      }
    },

    // this is called for both Resume Payment and Retry Payment
    doResumePayment (task) {
      const filingId = task.id
      const paymentToken = task.paymentToken

      const baseUrl = sessionStorage.getItem('BASE_URL')
      const returnUrl = encodeURIComponent(baseUrl + '?filing_id=' + filingId)
      const authUrl = sessionStorage.getItem('AUTH_URL')
      const payUrl = authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

      // assume Pay URL is always reachable
      window.location.assign(payUrl)
      return true
    },

    confirmDeleteDraft (task) {
      // open confirmation dialog and wait for response
      this.$refs.confirm.open(
        'Delete Draft?',
        'Delete your ' + task.draftTitle + '? Any changes you\'ve made will be lost.',
        {
          width: '40rem',
          persistent: true,
          yes: 'Delete',
          no: null,
          cancel: 'Don\'t delete'
        }
      ).then(async (confirm) => {
        // if we get here, Delete was clicked
        if (confirm) {
          await this.doDeleteDraft(task)
        } else {
          // do nothing
        }
      }).catch(() => {
        // if we get here, Don't Delete was clicked - do nothing
      })
    },

    confirmDeleteIncorporation (task) {
      // open confirmation dialog and wait for response
      this.$refs.confirm.open(
        'Delete Incorporation Application?',
        'Deleting this Incorporation Application will remove this application and all information associated ' +
          'with this application.\n\nYou may use any valid Name Request associated with this application for ' +
          'future Benefit Company Incorporation Applications',
        {
          width: '40rem',
          persistent: true,
          yes: 'Delete',
          no: null,
          cancel: 'Don\'t delete'
        }
      ).then(async (confirm) => {
        // if we get here, Delete was clicked
        if (confirm) {
          await this.doDeleteDraft(task)
        } else {
          // do nothing
        }
      }).catch(() => {
        // if we get here, Don't Delete was clicked - do nothing
      })
    },

    async doDeleteDraft (task) {
      const id = this.entityIncNo || this.nrNumber
      let url = `businesses/${id}/filings/${task.id}`
      await axios.delete(url).then(res => {
        if (!res) { throw new Error('Invalid API response') }

        // emit dashboard reload trigger event
        this.$root.$emit('triggerDashboardReload')
      }).catch(error => {
        if (error && error.response) {
          if (error.response.data.errors) {
            this.deleteErrors = error.response.data.errors
          }
          if (error.response.data.warnings) {
            this.deleteWarnings = error.response.data.warnings
          }
          this.deleteErrorDialog = true
        } else {
          this.deleteErrorDialog = true
        }
      })
    },

    resetErrors () {
      this.deleteErrorDialog = false
      this.deleteErrors = []
      this.deleteWarnings = []
    },

    resetCancelPaymentErrors () {
      this.cancelPaymentErrorDialog = false
      this.cancelPaymentErrors = []
    },

    confirmCancelPayment (task) {
      // open confirmation dialog and wait for response
      this.$refs.confirmCancelPaymentDialog.open(
        'Cancel Payment?',
        'Cancel payment for your ' + task.draftTitle + '?',
        {
          width: '40rem',
          persistent: true,
          yes: 'Cancel Payment',
          no: null,
          cancel: 'Don\'t Cancel'
        }
      ).then(async (confirm) => {
        // if we get here, Yes or No was clicked
        if (confirm) {
          await this.cancelPaymentAndSetToDraft(task)
        } else {
          // do nothing
        }
      }).catch(() => {
        // if we get here, Cancel was clicked - do nothing
      })
    },

    async cancelPaymentAndSetToDraft (task) {
      let url = `businesses/${this.entityIncNo}/filings/${task.id}`
      await axios.patch(url, {}).then(res => {
        if (!res) { throw new Error('Invalid API response') }

        // emit dashboard reload trigger event
        this.$root.$emit('triggerDashboardReload')
      }).catch(error => {
        if (error && error.response) {
          if (error.response.data.errors) {
            this.cancelPaymentErrors = error.response.data.errors
          }
          this.cancelPaymentErrorDialog = true
        } else {
          this.cancelPaymentErrorDialog = true
        }
      })
    },

    showCommentDialog (filingId: number): void {
      this.currentFilingId = filingId
      this.addCommentDialog = true
    },

    hideCommentDialog (needReload: boolean): void {
      this.addCommentDialog = false
      if (needReload) {
        // emit dashboard reload trigger event
        this.$root.$emit('triggerDashboardReload')
      }
    },

    isPriority (priority: boolean): string {
      return priority ? 'Priority Correction' : 'Correction'
    },

    /** Returns True if task type is Correction. */
    isTypeCorrection (task: any): boolean {
      return (task.type === FilingTypes.CORRECTION)
    },

    /** Returns True if task type is Annual Report. */
    isTypeAnnualReport (task: any): boolean {
      return (task.type === FilingTypes.ANNUAL_REPORT)
    },

    /** Returns True if task type is Name Request. */
    isTypeNameRequest (task: any): boolean {
      return (task.type === FilingTypes.NAME_REQUEST)
    }
  },

  watch: {
    tasks () {
      // if tasks changes, reload them
      // (does not fire on initial page load)
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.todo-item {
  // disable expansion
  pointer-events: none;

  .todo-list-checkbox {
    pointer-events: auto;
  }

  .todo-list-detail {
    pointer-events: auto;
  }
}

.todo-list.disabled {
  opacity: 0.6;

  .info-btn {
    // enable expansion button
    pointer-events: auto;
  }
}

.todo-item:not(.disabled) {
  .v-btn {
    // enable action buttons
    pointer-events: auto;
  }
}

.todo-item.draft .v-expansion-panel-content {
  display: none;
}

.todo-item .list-item {
  padding: 0;
  justify-content: space-evenly;

  .bcorps-ar-subtitle {
    padding: 1rem 0 .5rem 0;
  }
}

.todo-item .list-item .list-item__actions {
  .date-subtitle {
    font-size: 0.875rem;
    margin-bottom: 4.5rem;
  }

  .btn-draft-resume {
    min-width: 103px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .btn-corr-draft-resume {
    min-width: 103px;
  }

  .btn-resume-payment {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.before-details {
    &:after {
      display: inline-block;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      content: "•";
    }
}

.list-item__title {
  display: flex;
}

.list-item__actions {
  .btn-file-now {
    width: inherit;
  }

  .v-btn.actions__more-actions__btn {
    // make action button width same as its height (per Vuetify)
    min-width: 36px !important;
    width: 36px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: 1px;
  }
}

.actions__more-actions {
  padding: 0;

  .v-list-item {
    min-width: 140px;
  }

  .v-list-item__title {
    font-size: 0.875rem;
  }
}

.todo-label {
  flex: 1 1 auto;
}

.info-btn {
  margin-left: 0.25rem;
}

.todo-status {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.payment-status {
  display: flex;
  align-items: center;
  height: 28px; // for consistent height with and without icon button
}

.vert-pipe {
  margin-top: 0.1rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  height: 1rem;
  border-left: 1px solid $gray6;
}

.v-expansion-panel-header {
  padding-top: 1.25rem !important;
  padding-bottom: 1.25rem !important;
}

.todo-item-toggle h3 {
  margin-bottom: 0.25rem;
}
</style>
