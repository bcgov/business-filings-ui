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

    <v-expansion-panels v-if="taskItems && taskItems.length > 0" accordion  v-model="panel">
      <v-expansion-panel
        class="align-items-top todo-item"
        v-for="(task, index) in orderBy(taskItems, 'order')"
        :key="index"
        :class="{
          'disabled': !task.enabled,
          'bcol-error': isBcolError(task)
        }"
      >
        <v-expansion-panel-header class="no-dropdown-icon">
          <div class="list-item">
            <div class="todo-label">
              <h3 class="list-item__title">{{task.title}}
                <v-btn v-if="(isTypeCorrection(task) || isTypeAlteration(task)) && isStatusDraft(task)"
                  class="expand-btn ml-0"
                  outlined
                  color="red"
                  :ripple=false
                >
                  <v-icon left>mdi-information-outline</v-icon>
                  {{ (panel === index) ? "Hide Details" : "View Details" }}
                </v-btn>
              </h3>

              <div v-if="businessId && isBComp && task.enabled && isTypeAnnualReport(task) && isStatusNew(task)"
                class="bcorps-ar-subtitle"
              >
                <p>Verify your Office Address and Current Directors before filing your Annual Report.</p>
                <v-checkbox
                  id="enable-checkbox"
                  class="todo-list-checkbox"
                  label="All information about the Office Addresses and Current Directors is correct."
                  :disabled="!task.enabled || coaPending"
                  v-model="enableCheckbox[index]"
                  @click.native.stop
                />
              </div>

              <div v-else class="list-item__subtitle">
                <div v-if="task.subtitle && isTypeAnnualReport(task)" class="todo-subtitle">
                  <span>{{ task.subtitle }}</span>
                </div>

                <!-- NB: the following blocks are mutually exclusive -->
                <div v-if="task.subtitle && isTypeIncorporationApplication(task)" class="todo-subtitle">
                  <div>{{ task.subtitle }}</div>
                  <div v-if="task.nameRequest" class="payment-status">
                    <v-btn
                      class="expand-btn"
                      outlined
                      color="blue darken-2"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-information-outline</v-icon>
                      {{ (panel === index) ? "Hide Details" : "View Details" }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="(isTypeCorrection(task) || isTypeAlteration(task)) && isStatusDraft(task)"
                  class="todo-subtitle"
                >
                  <div>DRAFT</div>
                  <v-btn
                    v-if="task.comments.length > 0"
                    class="expand-btn"
                    outlined
                    color="primary"
                    :ripple=false
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    {{task.comments.length > 1 ? "Details" : "Detail"}} ({{task.comments.length}})
                  </v-btn>
                </div>

                <div v-else-if="isBcolError(task)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status">
                    <span>PAYMENT UNSUCCESSFUL</span>
                    <v-btn
                      class="expand-btn"
                      outlined
                      color="red"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-information-outline</v-icon>
                      {{ (panel === index) ? "Hide Details" : "View Details" }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="isStatusDraft(task) && !isTypeIncorporationApplication(task)" class="todo-subtitle">
                  <div>DRAFT</div>
                </div>

                <div v-else-if="(isTypeCorrection(task) || isTypeAlteration(task)) && isStatusCorrectionPending(task)"
                  class="todo-subtitle"
                >
                  <div>FILING PENDING</div>
                  <v-btn
                    class="expand-btn"
                    outlined
                    color="primary"
                    :ripple=false
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    {{task.comments.length > 1 ? "Details" : "Detail"}} ({{task.comments.length}})
                  </v-btn>
                </div>

                <div v-else-if="isStatusPending(task)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAYMENT INCOMPLETE</span>
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
                  </div>
                </div>

                <div v-else-if="isStatusError(task)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAYMENT UNSUCCESSFUL</span>
                    <v-btn
                      class="expand-btn"
                      outlined
                      color="red darken-4"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-information-outline</v-icon>
                      {{ (panel === index) ? "Hide Details" : "View Details" }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="isStatusPaid(task)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span>PAID</span>
                    <v-btn
                      class="expand-btn"
                      outlined
                      color="red darken-4"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-information-outline</v-icon>
                      {{ (panel === index) ? "Hide Details" : "View Details" }}
                    </v-btn>
                  </div>
                </div>
              </div> <!-- end of subtitle -->
            </div>

            <div class="list-item__actions">
              <div style="width:100%">
                <p class="date-subtitle" v-if="isBComp && task.enabled && isTypeAnnualReport(task) && isStatusNew(task)"
                >
                  Due {{task.arDueDate}}
                </p>

                <!-- pre-empt any buttons below -->
                <template v-if="inProcessFiling === task.id">
                  <v-btn text loading disabled />
                </template>

                <template v-else-if="isRoleStaff && (isTypeCorrection(task) || isTypeAlteration(task))
                  && isStatusDraft(task)"
                >
                  <v-btn class="btn-corr-draft-resume"
                     color="primary"
                     :disabled="!task.enabled"
                     @click.native.stop="doResumeFiling(task)"
                  >
                    <span>Resume</span>
                  </v-btn>
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="actions__more-actions__btn px-0"
                        v-on="on" id="menu-activator-staff" :disabled="!task.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                        v-if="businessId"
                        id="btn-delete-draft-staff"
                        @click="confirmDeleteDraft(task)"
                      >
                        <v-list-item-title>Delete Draft</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-else-if="!isTypeCorrection(task) && !isTypeAlteration(task)">
                  <template v-if="isStatusDraft(task)">
                    <v-btn class="btn-draft-resume"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumeFiling(task)"
                    >
                      <template v-if="isTypeIncorporationApplication(task) && task.isEmptyFiling">
                        <span v-if="nameRequest">Incorporate using this NR</span>
                        <span v-else>Incorporate a Numbered Company</span>
                      </template>
                      <span v-else>Resume</span>
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
                      <v-list class="actions__more-actions">
                        <v-list-item
                          v-if="businessId"
                          id="btn-delete-draft"
                          @click="confirmDeleteDraft(task)"
                        >
                          <v-list-item-title>Delete Draft</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          v-if="tempRegNumber"
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
                      <v-list class="actions__more-actions">
                        <v-list-item id="btn-cancel-payment" @click="confirmCancelPayment(task)"
                          data-test-id="btn-cancel-payment"
                        >
                          <v-list-item-title>Cancel Payment</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>

                  <template v-else-if="isStatusError(task)">
                    <v-btn class="btn-retry-payment"
                      color="primary"
                      :disabled="!task.enabled"
                      @click.native.stop="doResumePayment(task)"
                    >
                      <span>Retry Payment</span>
                    </v-btn>
                  </template>

                  <template v-else-if="isStatusPaid(task)">
                    <!-- no action button in this case -->
                  </template>

                  <template v-else-if="isStatusNew(task) && isTypeAnnualReport(task)">
                    <v-btn class="btn-file-now"
                      color="primary"
                      :disabled="!task.enabled || coaPending || ( isBComp && !enableCheckbox[index] ) || disableChanges"
                      @click.native.stop="doFileNow(task)"
                    >
                      <span>File Annual Report</span>
                    </v-btn>
                  </template>
                </template>
              </div>
            </div> <!-- end of actions -->
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <div v-if="isBcolError(task)" class="todo-list-detail bcol-todo-list-detail body-2">
            <template v-if="task.bcolErrObj && task.bcolErrObj.title && task.bcolErrObj.detail">
              <h4>Payment Incomplete - {{task.bcolErrObj.title}}</h4>
              <p v-html="task.bcolErrObj.detail" />
            </template>
          </div>

          <template v-else-if="isTypeCorrection(task) || isTypeAlteration(task)">
            <div v-if="isStatusDraft(task)" data-test-class="correction-draft" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is in review and has been saved as a draft.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="mt-6"></v-divider>
              <!-- the detail comments section -->
              <details-list
                :filing=task
                :isTask="true"
                @showCommentDialog="showCommentDialog($event)"
              />
            </div>

            <div v-else data-test-class="correction-pending" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is pending review by Registry Staff.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="mt-6"></v-divider>
              <!-- the detail comments section -->
              <details-list
                :filing=task
                :isTask="true"
                @showCommentDialog="showCommentDialog($event)"
              />
            </div>
          </template>

          <div v-else-if="isStatusPending(task)" data-test-class="payment-incomplete" class="todo-list-detail body-2">
            <h4>Payment Incomplete</h4>
            <p>This filing is pending payment. The payment may still be in progress or may have been
              interrupted for some reason.<p>
            <p>You may continue this filing by selecting "Resume Payment".</p>
          </div>

          <div v-else-if="isStatusError(task)" data-test-class="payment-unsuccessful" class="todo-list-detail body-2">
            <p class="font-weight-bold black--text">Payment Unsuccessful</p>
            <p>This filing is pending payment. The payment appears to have been unsuccessful for some
              reason.</p>
            <p>You may continue this filing by selecting "Retry Payment".</p>
          </div>

          <div v-else-if="isStatusPaid(task)" data-test-class="payment-paid" class="todo-list-detail body-2">
            <p class="font-weight-bold black--text">Paid</p>
            <p>This filing is paid but the filing is not yet complete. Please check again later.</p>
          </div>

          <div v-else-if="isStatusDraft(task) && isTypeIncorporationApplication(task)" data-test-class="nr-details">
            <name-request-info :nameRequest="task.nameRequest" />
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-else>
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
import { DetailsList, NameRequestInfo } from '@/components/common'

// Dialogs
import { AddCommentDialog, ConfirmDialog, DeleteErrorDialog, CancelPaymentErrorDialog } from '@/components/dialogs'

// Mixins
import { BcolMixin, DateMixin, EnumMixin, FilingMixin } from '@/mixins'

// Enums and Interfaces
import { FilingNames, FilingStatus, FilingTypes, Routes } from '@/enums'
import { FilingIF, TaskItemIF } from '@/interfaces'

export default {
  name: 'TodoList',

  components: {
    AddCommentDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    DetailsList,
    NameRequestInfo
  },

  mixins: [BcolMixin, DateMixin, EnumMixin, FilingMixin, Vue2Filters.mixin],

  data () {
    return {
      addCommentDialog: false,
      taskItems: [] as Array<TaskItemIF>,
      deleteErrors: [] as Array<any>,
      deleteWarnings: [] as Array<any>,
      deleteErrorDialog: false,
      cancelPaymentErrors: [] as Array<any>,
      cancelPaymentErrorDialog: false,
      enableCheckbox: [] as Array<any>,
      confirmEnabled: false,
      currentFilingId: null as number,
      panel: null as number // currently expanded panel
    }
  },

  props: {
    inProcessFiling: null,
    coaPending: null,
    disableChanges: null
  },

  computed: {
    ...mapGetters(['getEntityIncNo', 'isBComp', 'isCoop', 'isRoleStaff']),

    ...mapState(['tasks', 'entityIncNo', 'entityName', 'nameRequest']),

    /** The Business ID string. */
    businessId (): string | null {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /** The Incorporation Application's Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    }
  },

  created (): void {
    // load data into this page
    this.loadData()
  },

  methods: {
    ...mapActions(['setARFilingYear', 'setCurrentFilingStatus']),

    async loadData () {
      this.taskItems = []

      // If the Entity is a COOP, Enable the 'FileNow' Button without any user validation
      if (this.isCoop) this.confirmCheckbox = true

      for (const task of this.tasks) {
        if (task?.task?.todo) {
          await this.loadTodoItem(task)
        } else if (task?.task?.filing) {
          await this.loadFilingItem(task)
        } else {
          // eslint-disable-next-line no-console
          console.log('ERROR - got unknown task =', task)
        }
      }

      this.$emit('task-count', this.taskItems.length)
      this.$emit('task-items', this.taskItems)

      // If there are any draft/pending/error/paid/correction tasks, emit this event to the parent component.
      // This indicates that a new filing cannot be started because this item has to be completed first.
      this.$emit('has-blocker-task',
        this.taskItems.filter(item => {
          return (this.isStatusDraft(item) || this.isStatusPending(item) || this.isStatusError(item) ||
            this.isStatusPaid(item) || this.isTypeCorrection(item) || this.isTypeAlteration(item))
        }).length > 0
      )
    },

    loadTodoItem (task) {
      const todo: FilingIF = task.task.todo
      if (todo && todo.header) {
        switch (todo.header.name) {
          case FilingTypes.ANNUAL_REPORT:
            const ARFilingYear = todo.header.ARFilingYear
            this.taskItems.push({
              id: -1, // not falsy
              filingType: FilingTypes.ANNUAL_REPORT,
              title: `File ${ARFilingYear} Annual Report`,
              subtitle: task.enabled && !this.isBComp ? '(including Address and/or Director Change)' : null,
              ARFilingYear,
              status: todo.header.status || FilingStatus.NEW,
              enabled: Boolean(task.enabled),
              order: task.order,
              nextArDate: this.toReadableDate(todo.business?.nextAnnualReport),
              arDueDate: this.arDueDate(todo.header?.ARFilingYear, todo.business?.foundingDate)
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

    expiresText (nameRequest): string {
      // NB: if expiration date is today (0) then NR is expired
      const expireDays = this.daysFromToday(nameRequest?.expirationDate)
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

    async loadFilingItem (task) {
      const filing: FilingIF = task.task.filing
      if (filing?.header) {
        switch (filing.header.name) {
          case FilingTypes.ANNUAL_REPORT:
            await this.loadAnnualReport(task)
            break
          case FilingTypes.CHANGE_OF_DIRECTORS:
            await this.loadChangeOfDirectors(task)
            break
          case FilingTypes.CHANGE_OF_ADDRESS:
            await this.loadChangeOfAddress(task)
            break
          case FilingTypes.CORRECTION:
            this.loadCorrection(task)
            break
          case FilingTypes.INCORPORATION_APPLICATION:
            await this.loadIncorporationApplication(task)
            break
          case FilingTypes.NOTICE_OF_ALTERATION:
            this.loadAlteration(task)
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

    loadAlteration (task) {
      const filing: FilingIF = task.task.filing
      if (filing?.header && filing?.alteration) {
        this.taskItems.push({
          filingType: FilingTypes.NOTICE_OF_ALTERATION,
          id: filing.header.filingId,
          // FUTURE
          filingDate: filing.header.date,
          title: this.priorityAlterationTitle(filing.header.priority),
          draftTitle: this.filingTypeToName(FilingTypes.NOTICE_OF_ALTERATION),
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null,
          comments: this.flattenAndSortComments(filing.header.comments)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or alteration in task =', task)
      }
    },

    async loadAnnualReport (task) {
      let date
      const filing: FilingIF = task.task.filing
      // NB: AR page requires "filing.annualReport"
      if (filing?.header && filing?.annualReport) {
        filing.annualReport.annualReportDate
          ? date = filing.annualReport.annualReportDate
          : date = filing.annualReport.nextARDate

        const bcolErr = filing.header.paymentStatusCode || null
        const bcolObj = bcolErr && await this.getErrorObj(bcolErr)

        if (date) {
          const ARFilingYear = +date.substring(0, 4)
          this.taskItems.push({
            filingType: FilingTypes.ANNUAL_REPORT,
            id: filing.header.filingId,
            title: `File ${ARFilingYear} Annual Report`,
            draftTitle: `${ARFilingYear} Annual Report`,
            ARFilingYear,
            status: filing.header.status || FilingStatus.NEW,
            enabled: Boolean(task.enabled),
            order: task.order,
            paymentToken: filing.header.paymentToken || null,
            bcolErrObj: bcolObj
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

    async loadChangeOfDirectors (task) {
      const filing: FilingIF = task.task.filing
      // no need to check for "filing.changedOfDirectors" as the COD page handles it
      if (filing?.header) {
        const bcolErr = filing.header.paymentStatusCode || null
        const bcolObj = bcolErr && await this.getErrorObj(bcolErr)

        this.taskItems.push({
          filingType: FilingTypes.CHANGE_OF_DIRECTORS,
          id: filing.header.filingId,
          title: `File Director Change`,
          draftTitle: `Director Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null,
          bcolErrObj: bcolObj
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfDirectors in task =', task)
      }
    },

    async loadChangeOfAddress (task) {
      const filing: FilingIF = task.task.filing
      // NB: COA page requires "filing.changeOfAddress"
      if (filing?.header && filing?.changeOfAddress) {
        const bcolErr = filing.header.paymentStatusCode || null
        const bcolObj = bcolErr && await this.getErrorObj(bcolErr)

        this.taskItems.push({
          filingType: FilingTypes.CHANGE_OF_ADDRESS,
          id: filing.header.filingId,
          title: `File Address Change`,
          draftTitle: `Address Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null,
          bcolErrObj: bcolObj
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfAddress in task =', task)
      }
    },

    loadCorrection (task) {
      const filing: FilingIF = task.task.filing
      if (filing?.header && filing?.correction) {
        this.taskItems.push({
          filingType: FilingTypes.CORRECTION,
          id: filing.header.filingId,
          filingDate: filing.correction.correctedFilingDate,
          // this is only used for internal corrections (not IA):
          correctedFilingId: filing.correction.correctedFilingId,
          // this is only used for external corrections (IA):
          correctedFilingType: this.filingTypeToName(filing.correction.correctedFilingType),
          title: (this.priorityCorrectionTitle(filing.header.priority) + ' - ' +
            this.filingTypeToName(filing.correction.correctedFilingType)),
          draftTitle: this.filingTypeToName(FilingTypes.CORRECTION),
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null,
          comments: this.flattenAndSortComments(filing.header.comments)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or correction in task =', task)
      }
    },

    async loadIncorporationApplication (task) {
      const filing: FilingIF = task.task.filing
      if (filing?.header) {
        const title = this.nameRequest
          ? `${this.entityTypeToDescription(this.entityType)} Incorporation Application - ${this.entityName}`
          : `${this.entityTypeToDescription(this.entityType)} Incorporation Application`

        // set subtitle only if DRAFT
        let subtitle
        if (this.isStatusDraft(filing.header)) {
          if (this.nameRequest) {
            subtitle = `NR APPROVED - ${this.expiresText(this.nameRequest)}`
          } else {
            subtitle = 'DRAFT'
          }
        }

        const bcolErr = filing.header.paymentStatusCode || null
        const bcolObj = bcolErr && await this.getErrorObj(bcolErr)

        const ia = filing.incorporationApplication // may be undefined
        const haveData = Boolean(ia?.offices || ia?.contactPoint || ia?.parties || ia?.shareClasses)

        this.taskItems.push({
          filingType: FilingTypes.INCORPORATION_APPLICATION,
          id: filing.header.filingId,
          title,
          subtitle,
          draftTitle: 'Incorporation Application',
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentToken: filing.header.paymentToken || null,
          bcolErrObj: bcolObj,
          isEmptyFiling: !haveData,
          nameRequest: this.nameRequest
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or incorporationApplication in task =', task)
      }
    },

    doFileNow (task: TaskItemIF) {
      switch (task.filingType) {
        case FilingTypes.ANNUAL_REPORT:
          // file the subject Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.NEW)
          this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: 0 } }) // 0 means "new AR"
          break
        // FUTURE: uncomment when/if we have NRs without a draft
        // case FilingTypes.NAME_REQUEST:
        //   // redirect to Create web app to create this Incorporation Application
        //   const createUrl = sessionStorage.getItem('CREATE_URL')
        //   const url = `${createUrl}?id=${this.tempRegNumber}`
        //   // assume Create URL is always reachable
        //   window.location.assign(url)
        //   break
        default:
          // eslint-disable-next-line no-console
          console.log('doFileNow(), invalid type for item =', task)
          break
      }
    },

    doResumeFiling (task: TaskItemIF) {
      switch (task.filingType) {
        case FilingTypes.ANNUAL_REPORT:
          // resume this Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: task.id } })
          break

        case FilingTypes.CHANGE_OF_DIRECTORS:
          // resume this Change Of Directors
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: task.id } })
          break

        case FilingTypes.CHANGE_OF_ADDRESS:
          // resume this Change Of Address
          this.setARFilingYear(task.ARFilingYear)
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: task.id } })
          break

        case FilingTypes.CORRECTION:
          if (task.correctedFilingType === FilingNames.INCORPORATION_APPLICATION) {
            // redirect to Edit web app to correct this Incorporation Application
            const editUrl = sessionStorage.getItem('EDIT_URL')
            const correctionUrl = `${editUrl}${this.getEntityIncNo}/correction?correction-id=${task.id}`
            // assume Correction URL is always reachable
            window.location.assign(correctionUrl)
          } else {
            // resume this Correction Filing
            this.setCurrentFilingStatus(FilingStatus.DRAFT)
            this.$router.push({ name: Routes.CORRECTION,
              params: { filingId: task.id, correctedFilingId: task.correctedFilingId }
            })
          }
          break

        case FilingTypes.INCORPORATION_APPLICATION:
          // redirect to Create web app to resume this Incorporation Application
          const createUrl = sessionStorage.getItem('CREATE_URL')
          const incorpAppUrl = `${createUrl}?id=${this.tempRegNumber}`
          // assume Incorp App URL is always reachable
          window.location.assign(incorpAppUrl)
          break

        case FilingTypes.NOTICE_OF_ALTERATION:
          // redirect to Edit web app to alter this company
          const editUrl = sessionStorage.getItem('EDIT_URL')
          const alterationUrl = `${editUrl}${this.getEntityIncNo}/alteration?alteration-id=${task.id}`
          // assume Alteration URL is always reachable
          window.location.assign(alterationUrl)
          break

        default:
          // eslint-disable-next-line no-console
          console.log('doResumeFiling(), invalid type for item =', task)
          break
      }
    },

    // this is called for both Resume Payment and Retry Payment
    doResumePayment (task: TaskItemIF) {
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

    confirmDeleteDraft (task: TaskItemIF) {
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

    confirmDeleteIncorporation (task: TaskItemIF) {
      const line1 = `Deleting this ${task.draftTitle} will remove this application and all information ` +
        'associated with this application.'
      const line2 = this.nameRequest
        ? 'You will be returned to your Manage Businesses dashboard where you can use the Name Request ' +
          'associated with this application for a future application.'
        : 'You will be returned to the Business Registry home page.'

      // open confirmation dialog and wait for response
      this.$refs.confirm.open(
        'Delete Incorporation Application?',
        `${line1}\n\n${line2}`,
        {
          width: '40rem',
          persistent: true,
          yes: 'Delete',
          no: null,
          cancel: 'Don\'t delete',
          stayOpenAfterConfirm: true
        }
      ).then(async (confirm) => {
        // if we get here, "Delete" was clicked
        if (confirm) {
          // delete without refreshing the dashboard as it triggers an error loading an IA
          // a redirect will happen taking the user off this page
          await this.doDeleteDraft(task, false)

          if (this.nameRequest) {
            // redirect to Manage Businesses page
            const manageBusinessesUrl = sessionStorage.getItem('BUSINESSES_URL') + 'business'
            // assume Manage Businesses URL is always reachable
            window.location.assign(manageBusinessesUrl)
          } else {
            // redirect to Business Registry home page
            const businessesUrl = sessionStorage.getItem('BUSINESSES_URL')
            // assume Businesses URL is always reachable
            window.location.assign(businessesUrl)
          }
        } else {
          // do nothing
        }
      }).catch(() => {
        // if we get here, "Don't Delete" was clicked - do nothing
      })
    },

    async doDeleteDraft (task: TaskItemIF, refreshDashboard: boolean = true) {
      const id = this.entityIncNo || this.tempRegNumber
      let url = `businesses/${id}/filings/${task.id}`
      await axios.delete(url).then(res => {
        if (!res) { throw new Error('Invalid API response') }

        if (refreshDashboard) {
          // emit dashboard reload trigger event
          this.$root.$emit('triggerDashboardReload')
        }
      }).catch(error => {
        if (error?.response) {
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

    confirmCancelPayment (task: TaskItemIF) {
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

    async cancelPaymentAndSetToDraft (task: TaskItemIF) {
      let url = `businesses/${this.entityIncNo}/filings/${task.id}`
      await axios.patch(url, {}).then(res => {
        if (!res) { throw new Error('Invalid API response') }

        // emit dashboard reload trigger event
        this.$root.$emit('triggerDashboardReload')
      }).catch(error => {
        if (error?.response) {
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

    isBcolError (task: TaskItemIF): boolean {
      return !!task.bcolErrObj
    },

    priorityAlterationTitle (priority: boolean): string {
      let title = priority ? 'Priority ' : ''
      title += this.filingTypeToName(FilingTypes.NOTICE_OF_ALTERATION)
      return title
    },

    priorityCorrectionTitle (priority: boolean): string {
      let title = priority ? 'Priority ' : ''
      title += this.filingTypeToName(FilingTypes.CORRECTION)
      return title
    },

    /** Closes current panel or opens new panel. */
    togglePanel (index: number) {
      this.panel = (this.panel === index) ? null : index
    },

    /** Determine the Annual Report Due date for a given filing. */
    arDueDate (filingYear: number, foundingDate: Date) {
      const dueDate = new Date(foundingDate)
      dueDate.setFullYear(filingYear)
      dueDate.setDate(dueDate.getDate() + 60) // The due date is 60 days AFTER the anniversary date for a given year
      return this.toReadableDate(dueDate)
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
  // disable expansion generally
  pointer-events: none;

  // enable all buttons (that aren't explicitly disabled)
  .v-btn:not(:disabled) {
    pointer-events: auto;
  }

  // specifically enable COA checkbox
  .todo-list-checkbox {
    pointer-events: auto;
  }

  // specifically enable events on this div
  .todo-list-detail {
    pointer-events: auto;
  }
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

.list-item__title {
  min-height: 20px; // for consistent height with and without icon button

  .v-btn {
    // adjust button position so it fits within the title height
    margin-top: -8px;
    margin-bottom: -4px
  }
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

.expand-btn {
  margin-left: 0.25rem;
  border: none;
}

.todo-subtitle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 2.25rem; // for consistent height with and without icon button
  margin-bottom: -0.5rem; // remove extra space when subtitle displays
}

.todo-list-detail {
  h4 {
    letter-spacing: 0;
    font-size: 0.9375rem;
    font-weight: 700;
  }

  p:first-of-type {
    padding-top: 0.75rem;
  }

  p {
    margin-bottom: 0.5rem !important;
  }
}

.payment-status {
  display: flex;
  align-items: center;
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

.v-expansion-panel-header:before {
  background-color: white !important;
}

.bcol-error {
  border-top: solid #a94442 3px;
}

.bcol-todo-list-detail {
  background-color: #f1f1f1 !important;
}

.contact-info-container {
  width: 50%;
  margin-top: 0.5rem;
  display: inline-block;
}
</style>
