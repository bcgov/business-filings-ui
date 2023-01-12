<template>
  <div id="todo-list">
    <ConfirmDialog
      ref="confirm"
      attach="#todo-list"
    />

    <DeleteErrorDialog
      :dialog="deleteErrorDialog"
      :errors="deleteErrors"
      :warnings="deleteWarnings"
      @okay="resetErrors()"
      attach="#todo-list"
    />

    <CancelPaymentErrorDialog
      :dialog="cancelPaymentErrorDialog"
      :errors="cancelPaymentErrors"
      @okay="resetCancelPaymentErrors()"
      attach="#todo-list"
    />

    <v-expansion-panels v-if="showTodoPanel" accordion v-model="panel">
      <v-expansion-panel
        class="align-items-top todo-item px-6 py-5"
        v-for="(item, index) in orderedTodoItems"
        :key="index"
        :class="{
          'disabled': !item.enabled,
          'pay-error': isStatusDraft(item) && isPayError(item)
        }"
      >
        <v-expansion-panel-header
          class="no-dropdown-icon pa-0"
          :class="{'invalid-section ml-n1 pl-1 rounded-0': showInvalidSection(item)}"
        >
          <div class="list-item">
            <div class="todo-label">
              <!-- title -->
              <h3 class="list-item__title">
                {{ item.title }}

                <!-- red details button -->
                <v-btn v-if="showDetailsBtnRed(item)" class="expand-btn ml-1" text color="error" :ripple=false>
                  <v-icon>mdi-information-outline</v-icon>
                  <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                </v-btn>

                <!-- blue details button -->
                <v-btn v-else-if="showDetailsBtnBlue(item)" class="expand-btn ml-1" text color="primary" :ripple=false>
                  <v-icon>mdi-information-outline</v-icon>
                  <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                </v-btn>
              </h3>

              <!-- Annual Report verify checkbox -->
              <div v-if="showAnnualReportCheckbox(item)" class="list-item__subtitle pt-4">
                <p>Verify your Office Address and Current Directors before filing your Annual Report.</p>
                <v-checkbox
                  id="enable-checkbox"
                  class="todo-list-checkbox"
                  label="All information about the Office Addresses and Current Directors is correct."
                  :disabled="!item.enabled || isCoaPending"
                  v-model="enableCheckbox[index]"
                  @click.stop
                />
              </div>

              <div v-else class="list-item__subtitle">
                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- new todo task -->
                <div v-if="isStatusNew(item)" class="todo-subtitle">
                  <span v-if="!!item.subtitle">{{ item.subtitle }}</span>
                </div>

                <!-- draft with pay error -->
                <div v-else-if="isStatusDraft(item) && isPayError(item)" class="todo-subtitle">
                  <span>PAYMENT INCOMPLETE</span>
                </div>

                <!-- draft alteration to a BEN not in good standing -->
                <div v-else-if="isStatusDraft(item) && item.isAlteringToBen && !isGoodStanding"
                  class="todo-subtitle mt-4 flex-column align-start"
                >
                  <p class="app-red font-weight-bold">
                    <v-icon small color="error">mdi-alert</v-icon>
                    This business is not in good standing.
                  </p>

                  <p>
                    Before you can alter your business, it must be in good standing with the Business
                    Registry. There may be several reasons why a business is not in good standing, but
                    the most common reason is an overdue annual report.
                  </p>

                  <p>
                    To resolve this issue, you MUST contact BC Registries staff:
                  </p>
                  <ContactInfo class="mt-4 contact-info-warning" />
                </div>

                <!-- draft incorporation -->
                <div v-else-if="isStatusDraft(item) && isTypeIncorporationApplication(item)" class="todo-subtitle">
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft registration -->
                <div v-else-if="isStatusDraft(item) && isTypeRegistration(item)" class="todo-subtitle">
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft other -->
                <div v-else-if="isStatusDraft(item)" class="todo-subtitle">
                  <span>DRAFT</span>
                </div>

                <!-- pending filing -->
                <div v-else-if="isStatusPending(item) || isStatusPendingCorrection(item)" class="todo-subtitle">
                  <template v-if="isTypeCorrection(item) || isTypeAlteration(item)">
                    <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                    <span v-else>FILING PENDING</span>
                  </template>

                  <template v-else>
                    <span>FILING PENDING</span>
                    <span class="vert-pipe"></span>
                    <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                    <span v-else-if="isPayMethodOnlineBanking(item)">ONLINE BANKING PAYMENT PENDING</span>
                    <span v-else>PAYMENT INCOMPLETE</span>
                  </template>
                </div>

                <!-- error filing -->
                <div v-else-if="isStatusError(item)" class="todo-subtitle">
                  <span>FILING PENDING</span>
                  <span class="vert-pipe"></span>
                  <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                  <span v-else>PAYMENT UNSUCCESSFUL</span>
                </div>

                <!-- paid filing -->
                <div v-else-if="isStatusPaid(item)" class="todo-subtitle">
                  <span>FILING PENDING</span>
                  <span class="vert-pipe"></span>
                  <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                  <span v-else>PAID</span>
                </div>
              </div> <!-- end of other subtitles -->
            </div> <!-- end of todo label -->

            <div class="list-item__actions">
              <div style="width:100%">
                <!-- BEN/BC/CCC/ULC AR special case -->
                <template v-if="isBenBcCccUlc && item.enabled && isTypeAnnualReport(item) && isStatusNew(item)">
                  <p class="date-subtitle">Due: {{item.arDueDate}}</p>
                </template>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- this loading button pre-empts all buttons below -->
                <template v-if="inProcessFiling === item.filingId">
                  <v-btn text loading disabled />
                </template>

                <!-- new annual report -->
                <template v-else-if="isStatusNew(item) && isTypeAnnualReport(item)">
                  <v-btn
                    class="btn-file-now"
                    color="primary"
                    :disabled="isFileAnnualReportDisabled(item, index)"
                    @click.stop="doFileNow(item)"
                  >
                    <span>File Annual Report</span>
                  </v-btn>
                </template>

                <!-- new conversion (staff only) -->
                <template v-else-if="isStatusNew(item) && isTypeConversion(item) && isRoleStaff">
                  <v-btn
                    class="btn-file-now"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.stop="doFileNow(item)"
                  >
                    <span>File Record Conversion</span>
                  </v-btn>
                </template>

                <!-- draft correction or conversion or restoration (staff only) -->
                <template v-else-if="isStatusDraft(item) && (isTypeCorrection(item) || isTypeConversion(item) ||
                  isTypeRestoration(item)) && isRoleStaff"
                >
                  <v-btn
                    class="btn-draft-resume"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumeFiling(item)"
                  >
                    <span>Resume</span>
                  </v-btn>

                  <!-- dropdown menu -->
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        id="menu-activator"
                        class="actions__more-actions__btn px-0"
                        color="primary"
                        :disabled="!item.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item id="btn-draft-delete" @click.stop="confirmDeleteDraft(item)">
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title>Delete draft</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <!-- other correction or conversion or restoration -->
                <template v-else-if="isTypeCorrection(item) || isTypeConversion(item) || isTypeRestoration(item)">
                  <!-- no action button in this case -->
                </template>

                <!-- other draft filing -->
                <template v-else-if="isStatusDraft(item)">
                  <v-btn
                    class="btn-draft-resume"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumeFiling(item)"
                  >
                    <template v-if="isTypeIncorporationApplication(item) && item.isEmptyFiling">
                      <span v-if="nameRequest">Incorporate using this NR</span>
                      <span v-else>Incorporate a Numbered Company</span>
                    </template>
                    <template v-else-if="isTypeRegistration(item) && item.isEmptyFiling">
                      <span>Register using this NR</span>
                    </template>
                    <span v-else>Resume</span>
                  </v-btn>

                  <!-- dropdown menu -->
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        id="menu-activator"
                        class="actions__more-actions__btn px-0"
                        color="primary"
                        :disabled="!item.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions py-2">
                      <v-list-item
                        v-if="businessId"
                        id="btn-draft-delete"
                        @click.stop="confirmDeleteDraft(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title v-if="isTypeDissolution(item)">
                          Delete {{ todoListTitle }}
                        </v-list-item-title>
                        <v-list-item-title v-else-if="isTypeSpecialResolution(item)">
                          Delete Special Resolution
                        </v-list-item-title>
                        <v-list-item-title v-else-if="isTypeAlteration(item)">
                          Delete changes to company information
                        </v-list-item-title>
                        <v-list-item-title v-else>
                          Delete draft
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        v-if="tempRegNumber"
                        id="btn-delete-application"
                        @click.stop="confirmDeleteApplication(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title>Delete {{filingTypeToName(item.name)}}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <!-- pending filing -->
                <template v-else-if="isStatusPending(item)">
                  <v-btn v-if="isPayMethodOnlineBanking(item)"
                    class="btn-change-payment-type"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Change Payment Type</span>
                  </v-btn>
                  <v-btn v-else
                    class="btn-resume-payment"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Resume Payment</span>
                  </v-btn>

                  <!-- dropdown menu -->
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        id="menu-activator"
                        class="actions__more-actions__btn px-0"
                        color="primary"
                        :disabled="!item.enabled"
                        @click.native.stop
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                        id="btn-cancel-payment"
                        @click.stop="confirmCancelPayment(item)"
                      >
                        <v-list-item-title>Cancel Payment</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <!-- error filing -->
                <template v-else-if="isStatusError(item)">
                  <v-btn
                    class="btn-retry-payment"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Retry Payment</span>
                  </v-btn>
                </template>

                <!-- paid filing -->
                <template v-else-if="isStatusPaid(item)">
                  <!-- no action button in this case -->
                </template>
              </div>
            </div> <!-- end of actions -->
          </div> <!-- end of list item -->
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <!-- NB: blocks below are mutually exclusive, and order is important -->

          <!-- does this item have an incomplete payment? -->
          <template v-if="isStatusDraft(item) && isPayError(item)">
            <PaymentIncomplete :filing=item />
          </template>

          <!-- is this a conversion in any status? -->
          <template v-else-if="isTypeConversion(item)">
            <ConversionDetails :filing=item class="mb-4" />
          </template>

          <!-- is this a draft correction? -->
          <template v-else-if="isStatusDraft(item) && isTypeCorrection(item)">
            <div data-test-class="correction-draft" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is in review and has been saved as a draft.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6"></v-divider>
              <!-- the correction comment -->
              <CorrectionComment :comment="item.comment" />
            </div>
          </template>

          <!-- is this a correction in any other status? -->
          <template v-else-if="isTypeCorrection(item)">
            <div data-test-class="correction-pending" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is pending review by Registry Staff.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6"></v-divider>
              <!-- the correction comment -->
              <CorrectionComment :comment="item.comment" />
            </div>
          </template>

          <!-- is this a draft IA or Registration? -->
          <template v-else-if="isStatusDraft(item) &&
            (isTypeIncorporationApplication(item) || isTypeRegistration(item))"
          >
            <NameRequestInfo :nameRequest="item.nameRequest" />
          </template>

          <!-- does this item have a pending payment? -->
          <template v-else-if="isStatusPending(item)">
            <PaymentPendingOnlineBanking v-if="isPayMethodOnlineBanking(item)" :filing=item class="mb-6" />
            <PaymentPending v-else />
          </template>

          <!-- does this item have an unsuccessful payment? -->
          <template v-else-if="isStatusError(item)">
            <PaymentUnsuccessful />
          </template>

          <!-- does this item have a paid payment? -->
          <template v-else-if="isStatusPaid(item)">
            <PaymentPaid />
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- No Results Message -->
    <v-card class="no-results" flat v-if="!showTodoPanel">
      <v-card-text>
        <div class="no-results__title">You don't have anything to do yet</div>
        <div class="no-results__subtitle">Filings that require your attention will appear here</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'
import axios from '@/axios-auth'
import { navigate } from '@/utils'
import { CancelPaymentErrorDialog, ConfirmDialog, DeleteErrorDialog } from '@/components/dialogs'
import { NameRequestInfo, ContactInfo } from '@/components/common'
import ConversionDetails from './TodoList/ConversionDetails.vue'
import CorrectionComment from './TodoList/CorrectionComment.vue'
import PaymentIncomplete from './TodoList/PaymentIncomplete.vue'
import PaymentPaid from './TodoList/PaymentPaid.vue'
import PaymentPending from './TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from './TodoList/PaymentPendingOnlineBanking.vue'
import PaymentUnsuccessful from './TodoList/PaymentUnsuccessful.vue'
import { AllowableActionsMixin, DateMixin, EnumMixin } from '@/mixins'
import { LegalServices, PayServices } from '@/services/'
import { AllowableActions, CorpTypeCd, FilingNames, FilingStatus, FilingTypes, Routes } from '@/enums'
import { ActionBindingIF, ApiTaskIF, BusinessIF, BusinessWarningIF, ConfirmDialogType, TodoItemIF,
  TodoListResourceIF } from '@/interfaces'

@Component({
  components: {
    // dialogs
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    // components
    ConversionDetails,
    CorrectionComment,
    NameRequestInfo,
    ContactInfo,
    PaymentIncomplete,
    PaymentPaid,
    PaymentPending,
    PaymentPendingOnlineBanking,
    PaymentUnsuccessful
  },
  mixins: [
    AllowableActionsMixin,
    DateMixin,
    EnumMixin
  ]
})
export default class TodoList extends Vue {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType
  }

  // local properties
  protected todoItems: Array<TodoItemIF> = []
  protected deleteErrors: Array<any> = []
  protected deleteWarnings: Array<any> = []
  protected deleteErrorDialog = false
  protected cancelPaymentErrors: Array<any> = []
  protected cancelPaymentErrorDialog = false
  protected enableCheckbox: Array<any> = []
  protected confirmEnabled = false
  protected panel: number = null // currently expanded panel
  protected checkTimer: number = null
  protected inProcessFiling: number = null

  @Prop({ default: null }) readonly highlightId!: number

  @Getter getCurrentYear!: number
  @Getter getTasks!: Array<ApiTaskIF>
  @Getter getEntityName!: string
  @Getter isCoaPending!: boolean
  @Getter getTodoListResource!: TodoListResourceIF
  @Getter getBusinessWarnings!: BusinessWarningIF
  @Getter isBenBcCccUlc!: boolean
  @Getter getEntityType!: CorpTypeCd
  @Getter getIdentifier!: string

  @State nameRequest!: any
  @State lastAnnualReportDate!: string

  @Action setARFilingYear!: ActionBindingIF
  @Action setArMinDate!: ActionBindingIF
  @Action setArMaxDate!: ActionBindingIF
  @Action setNextARDate!: ActionBindingIF
  @Action setCurrentFilingStatus!: ActionBindingIF
  @Action setHasBlockerTask!: ActionBindingIF

  /** The Auth Web URL string. */
  get authWebUrl (): string {
    return sessionStorage.getItem('AUTH_WEB_URL')
  }

  /** The Edit URL string. */
  get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

  /** The Create URL string. */
  get createUrl (): string {
    return sessionStorage.getItem('CREATE_URL')
  }

  /** The My Business Registry URL string. */
  get myBusinessRegistryUrl (): string {
    return sessionStorage.getItem('AUTH_WEB_URL') + 'business'
  }

  /** The BCROS Home URL string. */
  get bcrosHomeUrl (): string {
    return sessionStorage.getItem('BUSINESSES_URL')
  }

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** The Business ID string. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Incorporation Application's Temporary Registration Number string. */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Whether to show the todo panel. */
  get showTodoPanel () {
    return (this.todoItems.length > 0)
  }

  /** The Todo List title. */
  get todoListTitle (): string {
    return this.getTodoListResource?.title
  }

  /** The todo items sorted by "order" key. */
  get orderedTodoItems (): Array<TodoItemIF> {
    return this.todoItems.sort((a, b) => (a.order - b.order))
  }

  /** Whether to show the invalid section styling. */
  protected showInvalidSection (item: TodoItemIF): boolean {
    if (item.isAlteringToBen && !this.isGoodStanding) return true
    return false
  }

  /** Whether to show the Annual Report verify checkbox. */
  protected showAnnualReportCheckbox (item: TodoItemIF): boolean {
    return (
      item.enabled &&
      this.businessId &&
      this.isBenBcCccUlc &&
      this.isTypeAnnualReport(item) &&
      this.isStatusNew(item)
    )
  }

  /** Whether the File Annual Report button should be disabled. */
  protected isFileAnnualReportDisabled (item: TodoItemIF, index: number): boolean {
    return (
      !item.enabled ||
      (this.isBenBcCccUlc && !this.enableCheckbox[index]) ||
      !this.isAllowed(AllowableActions.FILE_ANNUAL_REPORT)
    )
  }

  /** Whether to show the details button with blue color. */
  protected showDetailsBtnBlue (item: TodoItemIF): boolean {
    if (this.isStatusNew(item) && this.isTypeConversion(item)) return true
    if (this.isStatusDraft(item) && this.isTypeConversion(item)) return true
    if (this.isStatusDraft(item) && this.isTypeIncorporationApplication(item) &&
      item.nameRequest) return true
    if (this.isStatusDraft(item) && this.isTypeRegistration(item) &&
      item.nameRequest) return true
    if (this.isStatusPending(item)) return true
    return false
  }

  /** Whether to show the details button with red color. */
  protected showDetailsBtnRed (item: TodoItemIF): boolean {
    if (this.isStatusDraft(item) && this.isTypeCorrection(item)) return true
    if (this.isStatusDraft(item) && this.isPayError(item)) return true
    if (this.isStatusError(item) && (this.inProcessFiling !== item.filingId)) return true
    if (this.isStatusPaid(item) && (this.inProcessFiling !== item.filingId)) return true
    return false
  }

  /** Loads list of tasks from the API into Todo Items array. */
  private async loadData (): Promise<void> {
    this.todoItems = []

    // create 'task items' list from 'tasks' array from API
    for (const task of this.getTasks) {
      if (task.task?.todo) {
        this.loadTodoItem(task)
      } else if (task.task?.filing) {
        await this.loadFilingItem(task)
      } else {
        // eslint-disable-next-line no-console
        console.log('ERROR - got unknown task =', task)
      }
    }

    // report number of items back to parent (dashboard)
    this.$emit('todo-count', this.todoItems.length)

    // Check if there is a draft/pending/error/paid/correction/alteration task.
    // This is a blocker because it needs to be completed first.
    const hasBlockerTask = this.todoItems.some(task => (
      this.isStatusDraft(task) ||
      this.isStatusPending(task) ||
      this.isStatusError(task) ||
      this.isStatusPaid(task) ||
      this.isTypeCorrection(task) ||
      this.isTypeAlteration(task)
    ))
    this.setHasBlockerTask(hasBlockerTask)

    // if needed, highlight a specific task
    if (this.highlightId) this.highlightTask(this.highlightId)
  }

  /**
   * Identifies the specified task as "in progress" and starts a
   * process to check if the task changes to a completed filing.
   */
  private highlightTask (id: number): void {
    // first ensure filing is in todo list
    const index = this.todoItems.findIndex(h => h.filingId === id)
    if (index >= 0) {
      this.inProcessFiling = id

      // start check process
      this.checkIfCompleted(id, 0)
    }
  }

  /**
   * Checks whether the subject filing is now Completed.
   * Retries after 1 second for up to 5 iterations.
   */
  private checkIfCompleted (id: number, count: number): void {
    // stop this cycle after 5 iterations
    if (++count > 5) {
      this.inProcessFiling = null
      return
    }

    // get filing's status
    let url = `businesses/${this.getIdentifier}/filings/${id}`
    LegalServices.fetchFiling(url).then(filing => {
      // if the filing is now COMPLETED, emit event to reload all data
      if (filing?.header?.status === FilingStatus.COMPLETED) {
        this.$root.$emit('reloadData')
      } else {
        throw new Error('Filing not yet completed')
      }
    }).catch(() => {
      // call this function again in 1 second
      this.checkTimer = setTimeout(() => {
        this.checkIfCompleted(id, count)
      }, 1000)
    })
  }

  /** Loads a todo item into the Todo Items array. */
  private loadTodoItem (task: ApiTaskIF): void {
    const todo = task.task.todo // already checked for not falsey in loadData()
    const header = todo.header

    if (header) {
      switch (header.name) {
        case FilingTypes.ANNUAL_REPORT:
          this.loadAnnualReportTodo(task)
          break
        case FilingTypes.CONVERSION:
          this.loadConversionTodo(task)
          break
        default:
          // eslint-disable-next-line no-console
          console.log('ERROR - invalid name in todo header =', header)
          break
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header in todo =', todo)
    }
  }

  /** Loads a NEW Annual Report todo. */
  private loadAnnualReportTodo (task: ApiTaskIF): void {
    const todo = task.task.todo
    const business = todo.business as BusinessIF
    const header = todo.header

    if (business && header) {
      const ARFilingYear = header.ARFilingYear

      let subtitle: string = null
      if (task.enabled && !this.isBenBcCccUlc) {
        subtitle = '(including Address and/or Director Change)'
      }

      const item: TodoItemIF = {
        filingId: -1, // not falsy
        name: FilingTypes.ANNUAL_REPORT,
        title: `File ${ARFilingYear} Annual Report`,
        draftTitle: null,
        subtitle,
        ARFilingYear,
        // NB: get min/max AR dates from header object (not business object)
        // same as loading a draft AR
        arMinDate: header.arMinDate, // COOP only
        arMaxDate: header.arMaxDate, // COOP only
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        nextArDate: this.apiToYyyyMmDd(business.nextAnnualReport), // BEN/BC/CCC/ULC only
        arDueDate: this.formatYyyyMmDd(header.arMaxDate)
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in todo =', todo)
    }
  }

  /** Loads a NEW Conversion todo. */
  private loadConversionTodo (task: ApiTaskIF): void {
    if (!this.isRoleStaff) return // regular users can't file a new conversion

    const todo = task.task.todo
    const business = todo.business as BusinessIF
    const header = todo.header

    if (business && header) {
      const item: TodoItemIF = {
        name: FilingTypes.CONVERSION,
        title: FilingNames.CONVERSION,
        draftTitle: null,
        filingId: -1, // not falsy
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        warnings: business.warnings.map(warning => warning.message)
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in todo =', todo)
    }
  }

  /** Loads a filing item into the Todo Items array. */
  private async loadFilingItem (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing // already checked for not falsey in loadData()
    const header = filing.header

    if (header) {
      switch (header.name) {
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
          await this.loadCorrection(task)
          break
        case FilingTypes.INCORPORATION_APPLICATION:
          await this.loadIncorporationApplication(task)
          break
        case FilingTypes.ALTERATION:
          await this.loadAlteration(task)
          break
        case FilingTypes.DISSOLUTION:
          await this.loadDissolution(task)
          break
        case FilingTypes.REGISTRATION:
          await this.loadRegistration(task)
          break
        case FilingTypes.CHANGE_OF_REGISTRATION:
          await this.loadChangeOfRegistration(task)
          break
        case FilingTypes.CONVERSION:
          await this.loadConversion(task)
          break
        case FilingTypes.SPECIAL_RESOLUTION:
          await this.loadSpecialResolution(task)
          break
        case FilingTypes.RESTORATION:
          await this.loadRestoration(task)
          break
        default:
          // eslint-disable-next-line no-console
          console.log('ERROR - invalid name in filing header =', header)
          break
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header in filing =', filing)
    }
  }

  private async loadDissolution (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const dissolution = filing.dissolution
    const business = filing.business
    const header = filing.header

    if (dissolution && business && header) {
      // don't allow resuming a draft if not in good standing
      if (this.isStatusDraft(header) && !this.isGoodStanding) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.DISSOLUTION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        title: this.getTodoListResource?.title,
        draftTitle: this.filingTypeToName(FilingTypes.DISSOLUTION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or dissolution or business in task =', task)
    }
  }

  private async loadAlteration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const alteration = filing.alteration
    const business = filing.business
    const header = filing.header

    if (alteration && business && header) {
      // whether this is a non-BEN altering to a BEN
      const isAlteringToBen = (
        business.legalType !== CorpTypeCd.BENEFIT_COMPANY &&
        alteration.business?.legalType === CorpTypeCd.BENEFIT_COMPANY
      )

      // don't allow resuming a draft if not in good standing
      // for entity type change alterations only
      if (this.isStatusDraft(header) && !this.isGoodStanding && isAlteringToBen) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      let title = header.priority ? 'Priority ' : ''
      if (isAlteringToBen) {
        title += this.filingTypeToName(FilingTypes.CHANGE_OF_COMPANY_INFO)
        title += ` - ${corpTypeDescription} to a BC Benefit Company`
      } else {
        title += this.filingTypeToName(FilingTypes.ALTERATION)
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.ALTERATION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        isAlteringToBen,
        title,
        draftTitle: this.filingTypeToName(FilingTypes.ALTERATION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or alteration or business in task =', task)
    }
  }

  /**
   * Loads a DRAFT/PENDING/ERROR/PAID Annual Report filing.
   * (Currently used for Coop ARs only, as BEN/BC/CCC/ULC can't save draft ARs.)
   */
  private async loadAnnualReport (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const annualReport = filing.annualReport
    const business = filing.business
    const header = filing.header

    if (annualReport && business && header) {
      const ARFilingYear = header.ARFilingYear
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.ANNUAL_REPORT,
        filingId: header.filingId,
        title: `File ${ARFilingYear} Annual Report`,
        draftTitle: `${ARFilingYear} Annual Report`,
        ARFilingYear,
        arMinDate: header.arMinDate, // COOP only
        arMaxDate: header.arMaxDate, // COOP only
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        nextArDate: annualReport.nextARDate, // BEN/BC/CCC/ULC only
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or annualReport or business in filing =', filing)
    }
  }

  private async loadChangeOfDirectors (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const header = filing.header

    // NB: don't check "changeOfDirectors" as it may be empty
    if (business && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CHANGE_OF_DIRECTORS,
        filingId: header.filingId,
        title: `File Director Change`,
        draftTitle: `Director Change`,
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  private async loadChangeOfAddress (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const changeOfAddress = filing.changeOfAddress
    const header = filing.header

    if (business && changeOfAddress && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CHANGE_OF_ADDRESS,
        filingId: header.filingId,
        title: `File Address Change`,
        draftTitle: `Address Change`,
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or changeOfAddress or business in filing =', filing)
    }
  }

  private async loadCorrection (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const correction = filing.correction
    const header = filing.header

    if (business && correction && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CORRECTION,
        filingId: header.filingId,
        // this is only used for internal corrections (not IA):
        correctedFilingId: correction.correctedFilingId,
        // this is only used for external corrections (IA):
        // Corrections on Alterations always have a correctedFilingType of Alteration -> alterationRequired = true
        correctedFilingType: this.filingTypeToName(correction.correctedFilingType as FilingTypes, null, true),
        title: (this.priorityCorrectionTitle(header.priority) + ' - ' +
          this.filingTypeToName(correction.correctedFilingType as FilingTypes, null, true)),
        draftTitle: this.filingTypeToName(FilingTypes.CORRECTION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        comment: correction.comment
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or correction or business in filing =', filing)
    }
  }

  private async loadIncorporationApplication (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const incorporationApplication = filing.incorporationApplication

    // NB: don't check "incorporationApplication" as it may be empty
    if (header) {
      const title = `${this.getCorpTypeDescription(this.getEntityType)} Incorporation Application`

      // set subtitle only if DRAFT IA
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.nameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.nameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const ia = incorporationApplication // may be undefined
      const haveData = Boolean(ia?.offices || ia?.contactPoint || ia?.parties || ia?.shareClasses)

      const item: TodoItemIF = {
        name: FilingTypes.INCORPORATION_APPLICATION,
        filingId: header.filingId,
        title,
        subtitle,
        draftTitle: FilingNames.INCORPORATION_APPLICATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.nameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header in filing =', filing)
    }
  }

  private async loadRegistration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const registration = filing.registration

    // NB: don't check "registration" as it may be empty
    if (header) {
      const corpTypeDescription = this.getCorpTypeDescription(this.getEntityType)
      const title = this.isSoleProp
        ? `${corpTypeDescription} / Doing Business As (DBA) ${FilingNames.REGISTRATION}`
        : `${corpTypeDescription} ${FilingNames.REGISTRATION}`

      // set subtitle only if DRAFT
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.nameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.nameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const draft = registration // may be undefined
      const haveData = Boolean(draft?.offices || draft?.contactPoint || draft?.parties || draft?.shareClasses)

      const item: TodoItemIF = {
        name: FilingTypes.REGISTRATION,
        filingId: header.filingId,
        title,
        subtitle,
        draftTitle: FilingNames.REGISTRATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.nameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  private async loadChangeOfRegistration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const changeOfRegistration = filing.changeOfRegistration

    if (header && changeOfRegistration) {
      const title = `Change to ${this.getCorpTypeDescription(this.getEntityType)} Registration`

      // set subtitle only if DRAFT
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.nameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.nameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const draft = changeOfRegistration
      // FUTURE: verify that this checks for all possible data:
      const haveData = Boolean(draft?.offices || draft?.contactPoint || draft?.parties)

      const item: TodoItemIF = {
        name: FilingTypes.CHANGE_OF_REGISTRATION,
        filingId: header.filingId,
        title,
        subtitle,
        draftTitle: FilingNames.CHANGE_OF_REGISTRATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.nameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  private async loadConversion (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const conversion = filing.conversion

    if (header && conversion) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      // FUTURE: check for all possible data:
      const haveData = Boolean(conversion?.offices || conversion?.contactPoint || conversion?.parties)

      const item: TodoItemIF = {
        name: FilingTypes.CONVERSION,
        filingId: header.filingId,
        title: FilingNames.CONVERSION, // FUTURE: enhance title (and subtitle?) if needed
        draftTitle: FilingNames.CONVERSION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  private async loadSpecialResolution (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const business = filing.business
    const specialResolution = filing.specialResolution

    if (header && specialResolution) {
      // don't allow resuming a draft if not in good standing
      if (this.isStatusDraft(header) && !this.isGoodStanding) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.SPECIAL_RESOLUTION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        title: this.specialResolutionTitle(header.priority),
        draftTitle: this.filingTypeToName(FilingTypes.SPECIAL_RESOLUTION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or specialResolution in task =', task)
    }
  }

  private async loadRestoration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const business = filing.business
    const restoration = filing.restoration

    if (header && restoration) {
      // don't allow resuming a draft if not in good standing
      if (this.isStatusDraft(header) && !this.isGoodStanding) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      const title = this.filingTypeToName(FilingTypes.RESTORATION, null, restoration.type)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.RESTORATION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        title,
        draftTitle: title,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or restoration in task =', task)
    }
  }

  private expiresText (nameRequest: any): string {
    const date = this.apiToDate(nameRequest.expirationDate)
    const expireDays = this.daysFromToday(date)
    // NB: 0 means NR expires today
    if (isNaN(expireDays) || expireDays < 0) {
      return 'Expired'
    } else if (expireDays < 1) {
      return 'Expires today'
    } else if (expireDays < 2) {
      return 'Expires tomorrow'
    } else {
      return `Expires in ${expireDays} days`
    }
  }

  /** Files a new filing (todo item). */
  protected doFileNow (item: TodoItemIF): void {
    switch (item.name) {
      case FilingTypes.ANNUAL_REPORT:
        // file the subject Annual Report
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BEN/BC/CCC/ULC only
        this.setCurrentFilingStatus(FilingStatus.NEW)
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: '0' } }) // 0 means "new AR"
        break
      case FilingTypes.CONVERSION:
        // go to conversion filing
        const url = `${this.editUrl}${this.getIdentifier}/conversion`
        navigate(url)
        break
      default:
        // eslint-disable-next-line no-console
        console.log('doFileNow(), invalid type for task =', item)
        break
    }
  }

  /** Resumes a draft filing. */
  protected doResumeFiling (item: TodoItemIF): void {
    switch (item.name) {
      case FilingTypes.ANNUAL_REPORT:
        // resume this Annual Report locally
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BEN/BC/CCC/ULC only
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_DIRECTORS:
        // resume this Change Of Directors locally
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_ADDRESS:
        // resume this Change Of Address locally
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CORRECTION:
        // see also FilingHistoryList.vue:correctThisFiling()
        switch (item.correctedFilingType) {
          case FilingNames.ALTERATION:
          case FilingNames.INCORPORATION_APPLICATION:
          case FilingNames.CHANGE_OF_REGISTRATION:
          case FilingNames.CORRECTION:
          case FilingNames.REGISTRATION:
            // resume correction via Edit UI
            const correctionUrl = `${this.editUrl}${this.getIdentifier}/correction/?correction-id=${item.filingId}`
            navigate(correctionUrl)
            break

          case FilingTypes.ANNUAL_REPORT:
          case FilingTypes.CHANGE_OF_ADDRESS:
          case FilingTypes.CHANGE_OF_DIRECTORS:
          case FilingTypes.CONVERSION:
          default:
            // resume local correction for all other filings
            this.setCurrentFilingStatus(FilingStatus.DRAFT)
            this.$router.push({
              name: Routes.CORRECTION,
              params: { filingId: item.filingId.toString(), correctedFilingId: item.correctedFilingId.toString() }
            })
            break
        }
        break

      case FilingTypes.INCORPORATION_APPLICATION: {
        // navigate to Create UI to resume this Incorporation Application
        const incorpAppUrl = `${this.createUrl}?id=${this.tempRegNumber}`
        navigate(incorpAppUrl)
        break
      }

      case FilingTypes.REGISTRATION: {
        // navigate to Create UI to resume this Registration
        const registrationAppUrl = `${this.createUrl}define-registration?id=${this.tempRegNumber}`
        navigate(registrationAppUrl)
        break
      }

      case FilingTypes.ALTERATION: {
        // navigate to Edit UI to resume this Alteration
        const alterationUrl = `${this.editUrl}${this.getIdentifier}/alteration/?alteration-id=${item.filingId}`
        navigate(alterationUrl)
        break
      }

      case FilingTypes.DISSOLUTION: {
        // navigate to Create UI to resume this Dissolution
        const dissolutionUrl = `${this.createUrl}define-dissolution?id=${this.getIdentifier}`
        navigate(dissolutionUrl)
        break
      }

      case FilingTypes.CHANGE_OF_REGISTRATION: {
        // navigate to Edit UI to resume this Change of Registration
        const changeUrl = `${this.editUrl}${this.getIdentifier}/change/?change-id=${item.filingId}`
        navigate(changeUrl)
        break
      }

      case FilingTypes.CONVERSION: {
        // navigate to Edit UI to resume this Conversion
        const conversionUrl = `${this.editUrl}${this.getIdentifier}/conversion/?conversion-id=${item.filingId}`
        navigate(conversionUrl)
        break
      }

      case FilingTypes.SPECIAL_RESOLUTION: {
        // navigate to Edit UI to resume this Special Resolution
        const specialResolutionUrl =
          `${this.editUrl}${this.getIdentifier}/special-resolution/?special-resolution-id=${item.filingId}`
        navigate(specialResolutionUrl)
        break
      }

      case FilingTypes.RESTORATION: {
        // navigate to Create UI to resume this Restoration
        const registrationAppUrl = `${this.createUrl}?id=${this.getIdentifier}`
        navigate(registrationAppUrl)
        break
      }

      default:
        // eslint-disable-next-line no-console
        console.log('doResumeFiling(), invalid type for item =', item)
        break
    }
  }

  // this is called for both Resume Payment and Retry Payment
  protected doResumePayment (item: TodoItemIF): boolean {
    const paymentToken = item.paymentToken

    const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + item.filingId)
    const payUrl = this.authWebUrl + 'makepayment/' + paymentToken + '/' + returnUrl

    navigate(payUrl)
    return true
  }

  protected confirmDeleteDraft (item: TodoItemIF): void {
    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Delete Draft?',
      'Delete your ' + item.draftTitle + '? Any changes you\'ve made will be lost.',
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
        await this.doDeleteDraft(item)
      } else {
        // do nothing
      }
    }).catch(() => {
      // if we get here, Don't Delete was clicked - do nothing
    })
  }

  protected confirmDeleteApplication (item: TodoItemIF): void {
    const line1 = `Deleting this ${item.draftTitle} will remove this application and all information ` +
      'associated with this application.'
    const line2 = this.nameRequest
      ? 'You will be returned to My Business Registry.'
      : 'You will be returned to the Business Registry page.'

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      `Delete ${this.filingTypeToName(item.name)}?`,
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
        // a navigation will happen, taking the user off this page
        await this.doDeleteDraft(item, false)

        if (this.nameRequest) {
          // go to My Business Registry page
          navigate(this.myBusinessRegistryUrl)
        } else {
          // go to BCROS home page
          navigate(this.bcrosHomeUrl)
        }
      } else {
        // do nothing
      }
    }).catch(() => {
      // if we get here, "Don't Delete" was clicked - do nothing
    })
  }

  private async doDeleteDraft (item: TodoItemIF, refreshDashboard = true): Promise<void> {
    const id = this.getIdentifier || this.tempRegNumber
    const url = `businesses/${id}/filings/${item.filingId}`

    await axios.delete(url).then(res => {
      if (!res) { throw new Error('Invalid API response') }

      if (refreshDashboard) {
        // emit event to reload all data
        this.$root.$emit('reloadData')
      }
    }).catch(error => {
      if (error?.response) {
        if (error.response.data?.errors) {
          this.deleteErrors = error.response.data.errors
        }
        if (error.response.data?.warnings) {
          this.deleteWarnings = error.response.data.warnings
        }
        this.deleteErrorDialog = true
      } else {
        this.deleteErrorDialog = true
      }
    })
  }

  protected resetErrors (): void {
    this.deleteErrorDialog = false
    this.deleteErrors = []
    this.deleteWarnings = []
  }

  protected resetCancelPaymentErrors (): void {
    this.cancelPaymentErrorDialog = false
    this.cancelPaymentErrors = []
  }

  protected confirmCancelPayment (item: TodoItemIF): void {
    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Cancel Payment?',
      'Cancel payment for your ' + item.draftTitle + '?',
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
        await this.cancelPaymentAndSetToDraft(item)
      } else {
        // do nothing
      }
    }).catch(() => {
      // if we get here, Cancel was clicked - do nothing
    })
  }

  private async cancelPaymentAndSetToDraft (item: TodoItemIF): Promise<void> {
    const url = `businesses/${this.getIdentifier}/filings/${item.filingId}`

    await axios.patch(url, {}).then(res => {
      if (!res) { throw new Error('Invalid API response') }

      // emit event to reload all data
      this.$root.$emit('reloadData')
    }).catch(error => {
      if (error?.response) {
        if (error.response.data?.errors) {
          this.cancelPaymentErrors = error.response.data.errors
        }
        this.cancelPaymentErrorDialog = true
      } else {
        this.cancelPaymentErrorDialog = true
      }
    })
  }

  protected isPayError (item: TodoItemIF): boolean {
    return !!item.payErrorObj
  }

  private priorityCorrectionTitle (priority: boolean): string {
    let title = priority ? 'Priority ' : ''
    title += this.filingTypeToName(FilingTypes.CORRECTION)
    return title
  }

  private specialResolutionTitle (priority: boolean): string {
    let title = priority ? 'Priority ' : ''
    title += this.filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
    return title
  }

  @Watch('getTasks', { immediate: true })
  private async onTasksChanged (): Promise<void> {
    // load data initially and when tasks list changes
    await this.loadData()
  }

  /** Called just before this component is destroyed. */
  protected beforeDestroy (): void {
    // cancel the check timer if it is running
    clearTimeout(this.checkTimer)
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
    p {
      color: $gray7;
      margin-top: 1rem;
    }
  }
}

.todo-item .list-item {
  padding: 0;
  justify-content: space-evenly;
  align-items: flex-start;
}

.todo-item .list-item .list-item__actions {
  .date-subtitle {
    font-size: $px-14;
    margin-bottom: 4.5rem;
  }

  .btn-draft-resume {
    min-width: 103px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
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
    margin-bottom: -4px;
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
  .v-list-item {
    min-width: 140px;
  }

  .v-list-item__title {
    font-size: $px-14;
    color: $app-blue;
  }

  #btn-draft-delete:hover,
  #btn-delete-application:hover,
  #btn-cancel-payment:hover {
    background-color: $gray1;
  }
}

.todo-subtitle {
  color: $gray7;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.contact-info-warning {
  width: 100%;
}

.vert-pipe {
  margin-top: 0.1rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  height: 1rem;
  border-left: 1px solid $gray6;
}

.v-expansion-panel-header:before {
  background-color: white !important;
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 0;
}

.pay-error {
  border-top: solid #a94442 3px;
}
</style>
