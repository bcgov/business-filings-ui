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
      data-test-id="cancel-pay-error-dialog"
    />
    <v-expansion-panels v-if="taskItems && taskItems.length > 0" accordion>
      <v-expansion-panel
        class="align-items-top todo-item"
        expand-icon=""
        v-for="(task, index) in orderBy(taskItems, 'order')"
        :key="index"
        :class="{
          'disabled': !task.enabled,
          'draft': isDraft(task) && !isCorrection(task)
        }"
      >
        <v-expansion-panel-header class="todo-item-toggle no-dropdown">
          <div class="list-item">
            <div class="todo-label">
              <h3 class="list-item__title">{{task.title}}
                <div v-if="isCorrection(task) && isDraft(task)">
                  <v-btn small icon color="red" class="info-btn">
                    <v-icon>mdi-information-outline</v-icon>
                  </v-btn>
                </div>
              </h3>

              <div class="bcorps-ar-subtitle"
                v-if="entityFilter(EntityTypes.BCOMP) && isConfirmEnabled(task.type, task.status)"
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
                <div v-if="entityFilter(EntityTypes.COOP) && task.subtitle" class="todo-status">
                  <span>{{task.subtitle}}</span>
                </div>

                <div v-if="isCorrection(task) && isDraft(task)" class="todo-status">
                  <div>DRAFT</div>
                  <v-btn x-small icon class="info-btn">
                    <v-icon>mdi-message-reply</v-icon>
                  </v-btn>
                  Detail{{task.comments.length > 1 ? "s" : ""}} ({{task.comments.length}})
                </div>

                <div v-else-if="isDraft(task)" class="todo-status">
                  <div>DRAFT</div>
                </div>

                <div v-else-if="isCorrection(task) && isCorrectionPending(task)" class="todo-status">
                  <span class="before-details">FILING PENDING</span>
                  <v-btn x-small icon class="info-btn">
                    <v-icon>mdi-message-reply</v-icon>
                  </v-btn>
                  Detail{{task.comments.length > 1 ? "s" : ""}} ({{task.comments.length}})
                </div>

                <div v-else-if="isPending(task)" class="todo-status">
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

                <div v-else-if="isError(task)" class="todo-status">
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

                <div v-else-if="isPaid(task)" class="todo-status">
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
                <p class="date-subtitle"
                  v-if="entityFilter(EntityTypes.BCOMP) && isConfirmEnabled(task.type, task.status)"
                >Due {{ task.nextArDate }}</p>

                <!-- pre-empt any buttons below -->
                <template v-if="inProcessFiling === task.id">
                  <v-btn text loading disabled />
                </template>

                <template v-else-if="isRoleStaff && isCorrection(task) && isDraft(task)">
                  <v-btn class="btn-corr-draft-resume"
                     color="primary"
                     :disabled="!task.enabled"
                     @click.native.stop="doResumeFiling(task)"
                  >
                    <span>Resume</span>
                  </v-btn>
                </template>

                <div v-else-if="!isCorrection(task)">

                  <template v-if="isDraft(task)">
                    <v-btn class="btn-draft-resume"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumeFiling(task)"
                    >
                      <span>Resume</span>
                    </v-btn>
                    <!-- more DRAFT actions menu -->
                    <v-menu offset-y left>
                      <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="actions__more-actions__btn px-0"
                          v-on="on" id="menu-activator" :disabled="!task.enabled"
                        >
                          <v-icon>mdi-menu-down</v-icon>
                        </v-btn>
                      </template>
                      <v-list ref="draft_actions" class="actions__more-actions">
                        <v-list-item id="btn-delete-draft" @click="confirmDeleteDraft(task)">
                          <v-list-item-title>Delete Draft</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>

                  <template v-else-if="isPending(task)">
                    <v-btn class="btn-resume-payment"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumePayment(task)"
                      data-test-id="btn-resume-payment"
                    >
                      <span>Resume Payment</span>
                      <!-- Cancel Payment -->
                    </v-btn>
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

                  <v-btn v-else-if="isError(task)"
                    class="btn-retry-payment"
                    color="primary"
                    :disabled="!task.enabled"
                    @click.native.stop="doResumePayment(task)"
                  >
                    <span>Retry Payment</span>
                  </v-btn>

                  <template v-else-if="isPaid(task)">
                    <!-- no action button in this case -->
                  </template>

                  <v-btn v-else-if="!isCompleted(task)"
                  class="btn-file-now"
                  color="primary"
                  :disabled="!task.enabled || coaPending || !confirmCheckbox || hasBlockerFiling"
                  @click.native.stop="doFileNow(task)"
                >
                  <span>File Annual Report</span>
                </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <div v-if="isCorrection(task)">
            <div v-if="isDraft(task)" data-test-class="correction-draft" class="todo-list-detail">
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
          <v-card v-else-if="isPending(task)" data-test-class="payment-incomplete">
            <v-card-text>
              <p class="font-weight-bold black--text">Payment Incomplete</p>
              <p>This filing is pending payment. The payment may still be in progress or may have been
                interrupted for some reason.<p>
              <p>You may continue this filing by selecting "Resume Payment".</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="isError(task)" data-test-class="payment-unsuccessful">
            <v-card-text>
              <p class="font-weight-bold black--text">Payment Unsuccessful</p>
              <p>This filing is pending payment. The payment appears to have been unsuccessful for some
                reason.</p>
              <p>You may continue this filing by selecting "Retry Payment".</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="isPaid(task)" data-test-class="payment-paid">
            <v-card-text>
              <p class="font-weight-bold black--text">Paid</p>
              <p>This filing is paid but the filing is not yet complete. Please check again later.</p>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="taskItems && taskItems.length === 0">
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
import { EntityFilterMixin, DateMixin, FilingMixin } from '@/mixins'

// Enums
import { EntityTypes, FilingStatus, FilingTypes } from '@/enums'

export default {
  name: 'TodoList',

  components: {
    AddCommentDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    DetailsList
  },

  mixins: [EntityFilterMixin, DateMixin, FilingMixin, Vue2Filters.mixin],

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

    ...mapState(['tasks', 'entityIncNo'])
  },

  created (): void {
    // load data into this page
    this.loadData()
  },

  methods: {
    ...mapActions(['setARFilingYear', 'setCurrentFilingStatus', 'setTriggerDashboardReload']),

    loadData () {
      this.taskItems = []
      // If the Entity is a COOP, Enable the 'FileNow' Button without any user validation
      if (this.entityFilter(EntityTypes.COOP)) this.confirmCheckbox = true

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
        this.taskItems.filter(elem => {
          return this.isDraft(elem) || this.isPending(elem) || this.isError(elem) || this.isPaid(elem) ||
            this.isCorrection(elem)
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
              type: todo.header.name,
              title: `File ${ARFilingYear} Annual Report`,
              subtitle: task.enabled ? '(including Address and/or Director Change)' : null,
              ARFilingYear,
              status: todo.header.status || FilingStatus.NEW,
              enabled: Boolean(task.enabled),
              order: task.order,
              nextArDate: this.toReadableDate(todo.business.nextAnnualReport)
            })
            break
          }
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
            type: filing.header.name,
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
          type: filing.header.name,
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
          type: filing.header.name,
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
          type: filing.header.name,
          filingId: filing.header.filingId,
          filingDate: filing.correction.correctedFilingDate,
          corrFilingId: filing.correction.correctedFilingId,
          correctedFilingType: this.typeToTitle(filing.correction.correctedFilingType),
          title: `${this.isPriority(filing.header.priority)} -
            ${this.typeToTitle(filing.correction.correctedFilingType)}`,
          draftTitle: `${this.typeToTitle(filing.correction.correctedFilingType)}`,
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

    doFileNow (task) {
      switch (task.type) {
        case FilingTypes.ANNUAL_REPORT:
          // file the subject Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.NEW)
          this.$router.push({ name: 'annual-report', params: { id: 0 } }) // 0 means "new AR"
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
          // resume the subject Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: 'annual-report', params: { id: task.id } })
          break
        case FilingTypes.CHANGE_OF_DIRECTORS:
          // resume the subject Change Of Directors
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: 'standalone-directors', params: { id: task.id } })
          break
        case FilingTypes.CHANGE_OF_ADDRESS:
          // resume the subject Change Of Address
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: 'standalone-addresses', params: { id: task.id } })
          break
        case FilingTypes.CORRECTION:
          // resume the subject Correction Filing
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: 'correction', params: { id: task.filingId, correctedFilingId: task.corrFilingId } })
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
      const returnURL = encodeURIComponent(baseUrl + 'dashboard?filing_id=' + filingId)
      const authUrl = sessionStorage.getItem('AUTH_URL')
      const payURL = authUrl + 'makepayment/' + paymentToken + '/' + returnURL

      // assume Pay URL is always reachable
      window.location.assign(payURL)
      return true
    },

    isNew (task) {
      return task.status === FilingStatus.NEW
    },

    isDraft (task) {
      return task.status === FilingStatus.DRAFT
    },

    isPending (task) {
      return task.status === FilingStatus.PENDING
    },

    isCorrectionPending (task) {
      return task.status === FilingStatus.PENDING_CORRECTION
    },

    isError (task) {
      return task.status === FilingStatus.ERROR
    },

    isPaid (task) {
      return task.status === FilingStatus.PAID
    },

    isCompleted (task) {
      return task.status === FilingStatus.COMPLETED
    },

    isCorrection (task) {
      return task.type === FilingTypes.CORRECTION
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
        // if we get here, Yes or No was clicked
        if (confirm) {
          await this.doDeleteDraft(task)
        } else {
          // do nothing
        }
      }).catch(() => {
        // if we get here, Cancel was clicked - do nothing
      })
    },

    async doDeleteDraft (task) {
      let url = this.entityIncNo + '/filings/' + task.id
      await axios.delete(url).then(res => {
        if (!res) { throw new Error('invalid API response') }

        // reload dashboard
        this.setTriggerDashboardReload(true)
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

    isConfirmEnabled (type, status) {
      return ((type === FilingTypes.ANNUAL_REPORT) && (status === FilingStatus.NEW))
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
      let url = this.entityIncNo + '/filings/' + task.id
      await axios.patch(url, {}).then(res => {
        if (!res) { throw new Error('invalid API response') }

        // reload dashboard
        this.setTriggerDashboardReload(true)
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
      if (needReload) this.setTriggerDashboardReload(true)
    },

    isPriority (priority: boolean): string {
      return priority ? 'Priority Correction' : 'Correction'
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
