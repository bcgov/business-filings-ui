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
          'pay-error': isStatusDraft(task) && isPayError(task)
        }"
      >
        <v-expansion-panel-header class="no-dropdown-icon">
          <div class="list-item">
            <div class="todo-label">
              <h3 class="list-item__title">{{task.title}}
                <v-btn v-if="isStatusDraft(task) && isTypeCorrection(task)"
                  class="expand-btn ml-0"
                  outlined
                  color="red"
                  :ripple=false
                >
                  <v-icon left>mdi-information-outline</v-icon>
                  {{ (panel === index) ? "Hide Details" : "View Details" }}
                </v-btn>
              </h3> <!-- end of title -->

              <!-- BCOMP AR special case -->
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
                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <div v-if="isStatusNew(task) && task.subtitle" class="todo-subtitle">
                  <span>{{ task.subtitle }}</span>
                </div>

                <div v-else-if="isStatusDraft(task) && isTypeAlteration(task) && !task.goodStanding"
                  class="todo-list-detail body-2"
                >
                  <p class="red--text">
                    <v-icon color="red" left>mdi-information-outline</v-icon>
                    This business is not in good standing.
                  </p>

                  Before you can alter your business it must be in good standing with the Business Registry.
                  There may be several reasons a business is not be in good standing, but the most
                  common reason is an overdue annual report.<br>
                  To resolve this issue, you MUST contact Registry Staff:
                  <contact-info class="pt-3" />
                </div>
                <div
                  v-else-if="isStatusDraft(task) && (isTypeCorrection(task) ||
                  (isTypeAlteration(task) && task.goodStanding))"
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
                <div v-else-if="isStatusDraft(task) && isPayError(task)" class="todo-subtitle">
                  <div>PAYMENT INCOMPLETE</div>
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

                <div v-else-if="isStatusDraft(task) && isTypeIncorporationApplication(task)" class="todo-subtitle">
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

                <div v-else-if="isStatusDraft(task)" class="todo-subtitle">
                  <div>DRAFT</div>
                </div>

                <div v-else-if="isStatusCorrectionPending(task)" class="todo-subtitle">
                  <template v-if="isTypeCorrection(task) || isTypeAlteration(task)">
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
                  </template>
                </div>

                <div v-else-if="isStatusPending(task)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === task.id">
                    PROCESSING...
                  </div>
                  <div class="payment-status" v-else>
                    <span v-if="isPayMethodOnlineBanking(task)">ONLINE BANKING PAYMENT PENDING</span>
                    <span v-else>PAYMENT INCOMPLETE</span>
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
              </div> <!-- end of other subtitles -->
            </div>

            <div class="list-item__actions">
              <div style="width:100%">
                <!-- BCOMP AR special case -->
                <template v-if="isBComp && task.enabled && isTypeAnnualReport(task) && isStatusNew(task)">
                  <p class="date-subtitle">Due {{task.arDueDate}}</p>
                </template>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- this loading button pre-empts all buttons below -->
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

                <template v-else-if="isTypeCorrection(task)">
                  <!-- no action button in this case -->
                </template>

                <!-- Alteration Actions -->
                <template v-else-if="isTypeAlteration(task) && isStatusDraft(task)">
                  <v-btn class="btn-alt-draft-resume"
                         color="primary"
                         :disabled="!task.enabled"
                         @click.native.stop="doResumeFiling(task)"
                  >
                    <span>Resume</span>
                  </v-btn>
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="actions__more-actions__btn px-0"
                             v-on="on" id="menu-activator-alt" :disabled="!task.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                              v-if="businessId"
                              id="btn-delete-draft-alt"
                              @click="confirmDeleteDraft(task)"
                      >
                        <v-list-item-title>Delete changes to company information</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-else-if="isStatusDraft(task)">
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
                  <v-btn v-if="isPayMethodOnlineBanking(task)"
                    class="btn-change-payment-type"
                    color="primary"
                    :disabled="!task.enabled"
                    @click.native.stop="doResumePayment(task)"
                  >
                    <span>Change Payment Type</span>
                  </v-btn>
                  <v-btn v-else
                    class="btn-resume-payment"
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
                        v-on="on" id="pending-item-menu-activator"
                        :disabled="!task.enabled"
                        class="actions__more-actions__btn px-0"
                        data-test-id="btn-pending-filing-menu"
                        @click.native.stop
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item id="btn-cancel-payment"
                        data-test-id="btn-cancel-payment"
                        @click="confirmCancelPayment(task)"
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
              </div>
            </div> <!-- end of actions -->
          </div> <!-- end of list item -->
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <!-- NB: blocks below are mutually exclusive, and order is important -->

          <template v-if="isStatusDraft(task) && isPayError(task)">
            <payment-incomplete :filing=task />
          </template>

          <template v-else-if="isTypeCorrection(task)">
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

          <template v-else-if="isStatusPending(task)">
            <payment-pending-online-banking v-if="isPayMethodOnlineBanking(task)" :filing=task />
            <payment-pending v-else />
          </template>

          <template v-else-if="isStatusError(task)">
            <payment-unsuccessful />
          </template>

          <template v-else-if="isStatusPaid(task)">
            <payment-paid />
          </template>

          <template v-else-if="isStatusDraft(task) && isTypeIncorporationApplication(task)">
            <name-request-info :nameRequest="task.nameRequest" />
          </template>
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

// Dialogs
import { AddCommentDialog, CancelPaymentErrorDialog, ConfirmDialog, DeleteErrorDialog } from '@/components/dialogs'

// Components
import { DetailsList, NameRequestInfo, ContactInfo } from '@/components/common'
import PaymentIncomplete from './TodoList/PaymentIncomplete.vue'
import PaymentPaid from './TodoList/PaymentPaid.vue'
import PaymentPending from './TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from './TodoList/PaymentPendingOnlineBanking.vue'
import PaymentUnsuccessful from './TodoList/PaymentUnsuccessful.vue'

// Mixins
import { DateMixin, EnumMixin, FilingMixin } from '@/mixins'

// Enums and Interfaces
import { FilingNames, FilingStatus, FilingTypes, Routes, EntityStatus } from '@/enums'
import { FilingIF, PaymentErrorIF, TaskItemIF } from '@/interfaces'

export default {
  name: 'TodoList',

  components: {
    AddCommentDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    DetailsList,
    NameRequestInfo,
    PaymentIncomplete,
    PaymentPaid,
    PaymentPending,
    PaymentPendingOnlineBanking,
    PaymentUnsuccessful,
    ContactInfo
  },

  mixins: [DateMixin, EnumMixin, FilingMixin, Vue2Filters.mixin],

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
    ...mapGetters(['isBComp', 'isCoop', 'isRoleStaff', 'currentYear']),

    ...mapState(['tasks', 'entityIncNo', 'entityName', 'nameRequest', 'currentDate',
      'lastAnnualReportDate', 'entityStatus']),

    /** The Pay API URL string. */
    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    /** The Auth URL string. */
    authUrl (): string {
      return sessionStorage.getItem('AUTH_URL')
    },

    /** The Edit URL string. */
    editUrl (): string {
      return sessionStorage.getItem('EDIT_URL')
    },

    /** The Create URL string. */
    createUrl (): string {
      return sessionStorage.getItem('CREATE_URL')
    },

    /** The Manage Businesses URL string. */
    manageBusinessesUrl (): string {
      return sessionStorage.getItem('AUTH_URL') + 'business'
    },

    /** The BCROS Home URL string. */
    bcrosHomeUrl (): string {
      return sessionStorage.getItem('BUSINESSES_URL')
    },

    /** The Base URL string. */
    baseUrl (): string {
      return sessionStorage.getItem('BASE_URL')
    },

    /** The Business ID string. */
    businessId (): string {
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
    ...mapActions(['setARFilingYear', 'setArMinDate', 'setArMaxDate', 'setNextARDate', 'setCurrentFilingStatus']),
    ...mapGetters(['isInGoodStanding']),

    async loadData () {
      this.taskItems = []

      // If the Entity is a COOP, Enable the 'FileNow' Button without any user validation
      if (this.isCoop) this.confirmCheckbox = true

      for (const task of this.tasks) {
        if (task?.task?.todo) {
          this.loadTodoItem(task)
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
        this.taskItems.find(item => {
          return (this.isStatusDraft(item) || this.isStatusPending(item) || this.isStatusError(item) ||
            this.isStatusPaid(item) || this.isTypeCorrection(item) || this.isTypeAlteration(item))
        }) !== undefined
      )
    },

    loadTodoItem (task) {
      const todo: FilingIF = task.task.todo
      if (todo?.header) {
        switch (todo.header.name) {
          case FilingTypes.ANNUAL_REPORT:
            this.loadAnnualReportTodo(task)
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

    /** Loads a NEW Annual Report todo. */
    loadAnnualReportTodo (task) {
      const todo: FilingIF = task.task.todo
      if (todo?.header && todo?.business) {
        const ARFilingYear: number = todo.header.ARFilingYear
        const subtitle: string = task.enabled && !this.isBComp ? '(including Address and/or Director Change)' : null
        // nextAnnualReport (and nextArDate and arDueDate below) are only used for BCOMP ARs
        const nextArSimpleDateTime: string = this.apiToSimpleDateTime(todo.business.nextAnnualReport)

        this.taskItems.push({
          id: -1, // not falsy
          filingType: FilingTypes.ANNUAL_REPORT,
          title: `File ${ARFilingYear} Annual Report`,
          subtitle,
          ARFilingYear,
          arMinDate: todo.header.arMinDate, // COOP only
          arMaxDate: todo.header.arMaxDate, // COOP only
          status: todo.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          nextArDate: nextArSimpleDateTime.slice(0, 10), // BCOMP only
          arDueDate: this.arDueDate(nextArSimpleDateTime) // BCOMP only
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid todo or header or business in task =', task)
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
          case FilingTypes.ALTERATION:
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
      if (!this.isInGoodStanding() && this.isStatusDraft(filing.header)) {
        task.enabled = false
      }

      // verify both "header" and "alteration"
      if (filing?.header && filing?.alteration) {
        this.taskItems.push({
          filingType: FilingTypes.ALTERATION,
          id: filing.header.filingId,
          // FUTURE
          filingDate: filing.header.date,
          title: this.priorityAlterationTitle(filing.header.priority),
          draftTitle: this.filingTypeToName(FilingTypes.ALTERATION),
          status: filing.header.status,
          enabled: Boolean(task.enabled),
          order: task.order,
          goodStanding: this.isInGoodStanding(),
          paymentMethod: filing.header.paymentMethod || null,
          paymentToken: filing.header.paymentToken || null,
          comments: this.flattenAndSortComments(filing.header.comments)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or alteration in task =', task)
      }
    },

    /**
     * Loads a DRAFT/PENDING/ERROR/PAID Annual Report filing.
     * (Currently used for Coop ARs only, as BComps can't save draft ARs atm.)
     */
    async loadAnnualReport (task) {
      const filing: FilingIF = task.task.filing
      // verify both "header" and "annualReport"
      if (filing?.header && filing?.annualReport) {
        // FUTURE: delete fallback when all draft ARs contain ARFilingYear
        const ARFilingYear: number =
          filing.header.ARFilingYear || filing.annualReport.annualReportDate?.substring(0, 4)
        const paymentStatusCode = filing.header.paymentStatusCode
        const payErrorObj = paymentStatusCode ? await this.getPayErrorObj(paymentStatusCode) : null

        this.taskItems.push({
          filingType: FilingTypes.ANNUAL_REPORT,
          id: filing.header.filingId,
          title: `File ${ARFilingYear} Annual Report`,
          draftTitle: `${ARFilingYear} Annual Report`,
          ARFilingYear,
          // FUTURE: delete fallbacks when all draft ARs contain arMinDate and arMaxDate
          arMinDate: filing.header.arMinDate || this.getArMinDate(ARFilingYear), // COOP only
          arMaxDate: filing.header.arMaxDate || this.getArMaxDate(ARFilingYear), // COOP only
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentMethod: filing.header.paymentMethod || null,
          paymentToken: filing.header.paymentToken || null,
          payErrorObj
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or annualReport in task =', task)
      }
    },

    async loadChangeOfDirectors (task) {
      const filing: FilingIF = task.task.filing
      // only verify "header" as "changeOfDirectors" may be empty
      if (filing?.header) {
        const paymentStatusCode = filing.header.paymentStatusCode || null
        const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

        this.taskItems.push({
          filingType: FilingTypes.CHANGE_OF_DIRECTORS,
          id: filing.header.filingId,
          title: `File Director Change`,
          draftTitle: `Director Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentMethod: filing.header.paymentMethod || null,
          paymentToken: filing.header.paymentToken || null,
          payErrorObj
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header in task =', task)
      }
    },

    async loadChangeOfAddress (task) {
      const filing: FilingIF = task.task.filing
      // verify both "header" and "changeOfAddress"
      if (filing?.header && filing?.changeOfAddress) {
        const paymentStatusCode = filing.header.paymentStatusCode || null
        const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

        this.taskItems.push({
          filingType: FilingTypes.CHANGE_OF_ADDRESS,
          id: filing.header.filingId,
          title: `File Address Change`,
          draftTitle: `Address Change`,
          status: filing.header.status || FilingStatus.NEW,
          enabled: Boolean(task.enabled),
          order: task.order,
          paymentMethod: filing.header.paymentMethod || null,
          paymentToken: filing.header.paymentToken || null,
          payErrorObj
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header or changeOfAddress in task =', task)
      }
    },

    loadCorrection (task) {
      const filing: FilingIF = task.task.filing
      // verify both "header" and "correction"
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
          paymentMethod: filing.header.paymentMethod || null,
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
      // only verify "header" as "incorporationApplication" may be empty
      if (filing?.header) {
        const title = this.nameRequest
          ? `${this.getCorpTypeDescription(this.entityType)} Incorporation Application - ${this.entityName}`
          : `${this.getCorpTypeDescription(this.entityType)} Incorporation Application`

        // set subtitle only if DRAFT
        let subtitle
        if (this.isStatusDraft(filing.header)) {
          if (this.nameRequest) {
            subtitle = `NR APPROVED - ${this.expiresText(this.nameRequest)}`
          } else {
            subtitle = 'DRAFT'
          }
        }

        const paymentStatusCode = filing.header.paymentStatusCode || null
        const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

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
          paymentMethod: filing.header.paymentMethod || null,
          paymentToken: filing.header.paymentToken || null,
          payErrorObj,
          isEmptyFiling: !haveData,
          nameRequest: this.nameRequest
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - invalid filing or header in task =', task)
      }
    },

    /** Files a new filing (todo). */
    doFileNow (task: TaskItemIF) {
      switch (task.filingType) {
        case FilingTypes.ANNUAL_REPORT:
          // file the subject Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setArMinDate(task.arMinDate)
          this.setArMaxDate(task.arMaxDate)
          this.setNextARDate(task.nextArDate)
          this.setCurrentFilingStatus(FilingStatus.NEW)
          this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: 0 } }) // 0 means "new AR"
          break
        // FUTURE: uncomment when/if we have NRs without a draft
        // case FilingTypes.NAME_REQUEST:
        //   // redirect to Create web app to create this Incorporation Application
        //   const url = `${this.createUrl}?id=${this.tempRegNumber}`
        //   window.location.assign(url) // assume URL is always reachable
        //   break
        default:
          // eslint-disable-next-line no-console
          console.log('doFileNow(), invalid type for item =', task)
          break
      }
    },

    /** Resumes a draft filing. */
    doResumeFiling (task: TaskItemIF) {
      switch (task.filingType) {
        case FilingTypes.ANNUAL_REPORT:
          // resume this Annual Report
          this.setARFilingYear(task.ARFilingYear)
          this.setArMinDate(task.arMinDate)
          this.setArMaxDate(task.arMaxDate)
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
            const correctionUrl = `${this.editUrl}${this.entityIncNo}/correction?correction-id=${task.id}`
            window.location.assign(correctionUrl) // assume URL is always reachable
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
          const incorpAppUrl = `${this.createUrl}?id=${this.tempRegNumber}`
          window.location.assign(incorpAppUrl) // assume URL is always reachable
          break

        case FilingTypes.ALTERATION:
          // redirect to Edit web app to alter this company
          const alterationUrl = `${this.editUrl}${this.entityIncNo}/alteration?alteration-id=${task.id}`
          window.location.assign(alterationUrl) // assume URL is always reachable
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

      const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + filingId)
      const payUrl = this.authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

      window.location.assign(payUrl) // assume URL is always reachable
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
          cancel: 'Cancel'
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
            window.location.assign(this.manageBusinessesUrl) // assume URL is always reachable
          } else {
            // redirect to BCROS home page
            window.location.assign(this.bcrosHomeUrl) // assume URL is always reachable
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

    /**
     * Fetches a payment error object (description) by its code.
     * @param code the error code to look up
     * @returns a promise to return the payment error object
     */
    async getPayErrorObj (code: string): Promise<PaymentErrorIF> {
      const url = this.payApiUrl + 'codes/errors/' + code
      return axios.get(url)
        .then(response => response?.data)
        .catch() // ignore errors
    },

    isPayError (task: TaskItemIF): boolean {
      return !!task.payErrorObj
    },

    priorityAlterationTitle (priority: boolean): string {
      let title = priority ? 'Priority ' : ''
      title += this.filingTypeToName(FilingTypes.ALTERATION)
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

    /**
     * Returns AR Min Date in case a draft filing doesn't contain it.
     * NB: Delete this when all AR drafts contain new arMinDate.
     */
    getArMinDate (ARFilingYear: number): string {
      // min date is the AR year on Jan 1
      // or the date of the previous AR (in case of 2 ARs held in the same year)
      // whichever is latest
      return this.latestDate(`${ARFilingYear}-01-01`, this.lastAnnualReportDate)
    },

    /**
     * Returns AR Max Date in case a draft filing doesn't contain it.
     * NB: Delete this when all AR drafts contain new arMaxDate.
     */
    getArMaxDate (ARFilingYear: number): string {
      if (ARFilingYear === 2020) {
        // special case for 2020 ARs!
        // max date is _today_ or Oct 31, 2021, whichever is earliest
        return this.earliestDate(this.currentDate, '2021-10-31')
      } else if (ARFilingYear < this.currentYear) {
        // for past ARs, max date is the following year on Apr 30
        return `${ARFilingYear + 1}-04-30`
      } else {
        // for current ARs, max date is today
        return this.currentDate
      }
    },

    /**
     * Returns the formatted BCOMP AR Due Date.
     * Used for Todo List display only.
     */
    arDueDate (nextArSimpleDateTime: string): string {
      // due date is 60 days after the next AR date
      const date = new Date(nextArSimpleDateTime)
      date.setDate(date.getDate() + 60)
      const simpleDate = this.dateToSimpleDate(date)
      return this.simpleDateToDisplayDate(simpleDate)
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
  .theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    color: white !important;
    background-color: $app-blue !important;
    opacity: 0.2;
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

  .btn-change-payment-type,
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

.pay-error {
  border-top: solid #a94442 3px;
}

.contact-info-container {
  width: 50%;
  margin-top: 0.5rem;
  display: inline-block;
}
</style>
