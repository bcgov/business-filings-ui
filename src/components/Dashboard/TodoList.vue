<template>
  <div id="todo-list">
    <AddCommentDialog
      :dialog="addCommentDialog"
      :filing="currentFiling"
      @close="hideCommentDialog($event)"
      attach="#todo-list"
    />

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

    <v-expansion-panels v-if="todoItems && todoItems.length > 0" accordion  v-model="panel">
      <v-expansion-panel
        class="align-items-top todo-item px-6 py-5"
        v-for="(item, index) in orderBy(todoItems, 'order')"
        :key="index"
        :class="{
          'disabled': !item.enabled,
          'pay-error': isStatusDraft(item) && isPayError(item)
        }"
      >
        <v-expansion-panel-header
          class="no-dropdown-icon pa-0"
          :class="{'invalid-section': isTypeAlteration(item) && requiresAlteration && !item.goodStanding}"
        >
          <div class="list-item">
            <div class="todo-label">
              <!-- title -->
              <h3 class="list-item__title">{{item.title}}
                <v-btn v-if="isStatusDraft(item) && isTypeCorrection(item)"
                  class="expand-btn ml-0"
                  outlined
                  color="red"
                  :ripple=false
                >
                  <v-icon left>mdi-information-outline</v-icon>
                  <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                </v-btn>
              </h3>

              <!-- BCOMP AR special case -->
              <div v-if="businessId && isBComp && item.enabled && isTypeAnnualReport(item) && isStatusNew(item)"
                class="bcorps-ar-subtitle"
              >
                <p>Verify your Office Address and Current Directors before filing your Annual Report.</p>
                <v-checkbox
                  id="enable-checkbox"
                  class="todo-list-checkbox"
                  label="All information about the Office Addresses and Current Directors is correct."
                  :disabled="!item.enabled || isCoaPending"
                  v-model="enableCheckbox[index]"
                  @click.native.stop
                />
              </div>

              <div v-else class="list-item__subtitle">
                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- new task -->
                <div v-if="isStatusNew(item) && !!item.subtitle" class="todo-subtitle">
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft alteration not in good stating -->
                <div v-else-if="isStatusDraft(item) && isTypeAlteration(item) && !item.goodStanding"
                  class="todo-list-detail body-2"
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

                  <p>To resolve this issue, you MUST contact BC Registries staff:</p>
                  <ContactInfo class="mt-4" />
                </div>

                <!-- alteration in good standing -->
                <div v-else-if="isTypeAlteration(item) && item.goodStanding && !isBComp && !isCoop"
                  class="todo-subtitle my-4"
                >
                  <span>
                    Your business is ready to alter from a {{ item.legalType }} to a BC
                    Benefit Company. Select "Alter Now" to begin your alteration. You will not be able to make
                    any other changes to your business until the alteration is complete.
                  </span>
                  <v-btn
                    v-if="item.comments.length > 0"
                    class="expand-btn"
                    outlined
                    color="primary"
                    :ripple=false
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    <span>{{item.comments.length > 1 ? "Details" : "Detail"}} ({{item.comments.length}})</span>
                  </v-btn>
                </div>

                <!-- draft correction or alteration -->
                <div v-else-if="isStatusDraft(item) && (isTypeCorrection(item) || isTypeAlteration(item))"
                  class="todo-subtitle"
                >
                  <div>DRAFT</div>
                  <v-btn
                    v-if="item.comments.length > 0"
                    class="expand-btn"
                    outlined
                    color="primary"
                    :ripple=false
                  >
                    <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                    <span>{{item.comments.length > 1 ? "Details" : "Detail"}} ({{item.comments.length}})</span>
                  </v-btn>
                </div>

                <!-- draft with pay error -->
                <div v-else-if="isStatusDraft(item) && isPayError(item)" class="todo-subtitle">
                  <div>PAYMENT INCOMPLETE</div>
                  <v-btn
                    class="expand-btn"
                    outlined
                    color="red darken-4"
                    :ripple=false
                    @click.stop="togglePanel(index)"
                  >
                    <v-icon left>mdi-information-outline</v-icon>
                    <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                  </v-btn>
                </div>

                <!-- draft incorporation -->
                <div v-else-if="isStatusDraft(item) &&
                  (isTypeIncorporationApplication(item) || isTypeRegistrationApplication(item))"
                  class="todo-subtitle"
                >
                  <div>{{ item.subtitle }}</div>
                  <div v-if="item.nameRequest" class="payment-status">
                    <v-btn
                      class="expand-btn"
                      outlined
                      color="blue darken-2"
                      :ripple=false
                      @click.stop="togglePanel(index)"
                    >
                      <v-icon left>mdi-information-outline</v-icon>
                      <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                    </v-btn>
                  </div>
                </div>

                <!-- draft other -->
                <div v-else-if="isStatusDraft(item)" class="todo-subtitle">
                  <div>DRAFT</div>
                </div>

                <!-- pending filing - correction or alteration, or payment incomplete -->
                <div v-else-if="isStatusPending(item)" class="todo-subtitle">
                  <template v-if="isTypeCorrection(item) || isTypeAlteration(item)">
                    <div>FILING PENDING</div>
                    <v-btn
                      v-if="item.comments.length > 0"
                      class="expand-btn"
                      outlined
                      color="primary"
                      :ripple=false
                    >
                      <v-icon small left style="padding-top: 2px">mdi-message-reply</v-icon>
                      <span>{{item.comments.length > 1 ? "Details" : "Detail"}} ({{item.comments.length}})</span>
                    </v-btn>
                  </template>

                  <template v-else>
                    <div>FILING PENDING</div>
                    <div class="vert-pipe"></div>
                    <div class="payment-status" v-if="inProcessFiling === item.filingId">
                      PROCESSING...
                    </div>
                    <div class="payment-status" v-else>
                      <span v-if="isPayMethodOnlineBanking(item)">ONLINE BANKING PAYMENT PENDING</span>
                      <span v-else>PAYMENT INCOMPLETE</span>
                      <v-btn
                        class="expand-btn"
                        outlined
                        color="blue darken-2"
                        :ripple=false
                        @click.stop="togglePanel(index)"
                      >
                        <v-icon left>mdi-information-outline</v-icon>
                        <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                      </v-btn>
                    </div>
                  </template>
                </div>

                <!-- pending filing - payment unsuccessful -->
                <div v-else-if="isStatusError(item)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === item.filingId">
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
                      <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                    </v-btn>
                  </div>
                </div>

                <!-- pending filing - paid -->
                <div v-else-if="isStatusPaid(item)" class="todo-subtitle">
                  <div>FILING PENDING</div>
                  <div class="vert-pipe"></div>
                  <div class="payment-status" v-if="inProcessFiling === item.filingId">
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
                      <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                    </v-btn>
                  </div>
                </div>
              </div> <!-- end of other subtitles -->
            </div> <!-- end of todo label -->

            <div class="list-item__actions">
              <div style="width:100%">
                <!-- BCOMP AR special case -->
                <template v-if="isBComp && item.enabled && isTypeAnnualReport(item) && isStatusNew(item)">
                  <p class="date-subtitle">Due: {{item.arDueDate}}</p>
                </template>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- this loading button pre-empts all buttons below -->
                <template v-if="inProcessFiling === item.filingId">
                  <v-btn text loading disabled />
                </template>

                <template v-else-if="isRoleStaff && (isTypeCorrection(item) || isTypeAlteration(item)) &&
                  isStatusDraft(item)"
                >
                  <v-btn class="btn-corr-draft-resume"
                     color="primary"
                     :disabled="!item.enabled"
                     @click.native.stop="doResumeFiling(item)"
                  >
                    <span>Resume</span>
                  </v-btn>
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="actions__more-actions__btn px-0"
                        v-on="on" id="menu-activator-staff" :disabled="!item.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                        v-if="businessId"
                        id="btn-delete-draft-staff"
                        @click="confirmDeleteDraft(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title>Delete Draft</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-else-if="isTypeCorrection(item)">
                  <!-- no action button in this case -->
                </template>

                <!-- Alteration Actions -->
                <template v-else-if="isTypeAlteration(item) && isStatusDraft(item)">
                  <v-btn class="btn-alt-draft-resume"
                         color="primary"
                         :disabled="!item.enabled"
                         @click.native.stop="doResumeFiling(item)"
                  >
                    <span>{{alterationBtnLabel}}</span>
                  </v-btn>
                  <v-menu v-if="!requiresAlteration" offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="actions__more-actions__btn px-0"
                             v-on="on" id="menu-activator-alt" :disabled="!item.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                              v-if="businessId"
                              id="btn-delete-draft-alt"
                              @click="confirmDeleteDraft(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title>Delete changes to company information</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-else-if="isStatusDraft(item)">
                  <v-btn class="btn-draft-resume"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumeFiling(item)"
                  >
                    <template v-if="isTypeIncorporationApplication(item) && item.isEmptyFiling">
                      <span v-if="nameRequest">Incorporate using this NR</span>
                      <span v-else>Incorporate a Numbered Company</span>
                    </template>
                    <template v-else-if="isTypeRegistrationApplication(item) && item.isEmptyFiling">
                      <span>Register using this NR</span>
                    </template>
                    <span v-else>Resume</span>
                  </v-btn>
                  <!-- dropdown menu -->
                  <v-menu offset-y left>
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="actions__more-actions__btn px-0"
                        v-on="on" id="menu-activator" :disabled="!item.enabled"
                      >
                        <v-icon>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="actions__more-actions">
                      <v-list-item
                        v-if="businessId"
                        id="btn-delete-draft"
                        @click="confirmDeleteDraft(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <template v-if="isTypeDissolution(item)">
                          <v-list-item-title>Delete Dissolution</v-list-item-title>
                        </template>
                        <v-list-item-title v-else>Delete Draft</v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        v-if="tempRegNumber"
                        id="btn-delete-application"
                        @click="confirmDeleteApplication(item)"
                      >
                        <v-icon class="pr-1" color="primary" size="18px">mdi-delete-forever</v-icon>
                        <v-list-item-title>Delete {{filingTypeToName(item.name)}}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

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
                      <v-btn color="primary"
                        v-on="on" id="pending-item-menu-activator"
                        :disabled="!item.enabled"
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
                        @click="confirmCancelPayment(item)"
                      >
                        <v-list-item-title>Cancel Payment</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-else-if="isStatusError(item)">
                  <v-btn class="btn-retry-payment"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Retry Payment</span>
                  </v-btn>
                </template>

                <template v-else-if="isStatusPaid(item)">
                  <!-- no action button in this case -->
                </template>

                <template v-else-if="isStatusNew(item) && isTypeAnnualReport(item)">
                  <v-btn class="btn-file-now"
                    color="primary"
                    :disabled="isFileAnnualReportDisabled(item, index)"
                    @click.native.stop="doFileNow(item)"
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

          <template v-if="isStatusDraft(item) && isPayError(item)">
            <PaymentIncomplete :filing=item />
          </template>

          <template v-else-if="isTypeCorrection(item)">
            <div v-if="isStatusDraft(item)" data-test-class="correction-draft" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is in review and has been saved as a draft.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6"></v-divider>
              <!-- the detail comments section -->
              <DetailsList
                :filing=item
                :isTask="true"
                @showCommentDialog="showCommentDialog($event)"
              />
            </div>

            <div v-else data-test-class="correction-pending" class="todo-list-detail body-2">
              <p class="list-item__subtitle">This filing is pending review by Registry Staff.<br />
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6"></v-divider>
              <!-- the detail comments section -->
              <DetailsList
                :filing=item
                :isTask="true"
                @showCommentDialog="showCommentDialog($event)"
              />
            </div>
          </template>

          <template v-else-if="isStatusPending(item)">
            <PaymentPendingOnlineBanking v-if="isPayMethodOnlineBanking(item)" :filing=item class="mb-6" />
            <PaymentPending v-else />
          </template>

          <template v-else-if="isStatusError(item)">
            <PaymentUnsuccessful />
          </template>

          <template v-else-if="isStatusPaid(item)">
            <PaymentPaid />
          </template>

          <template v-else-if="isStatusDraft(item) &&
            (isTypeIncorporationApplication(item) || isTypeRegistrationApplication(item))">
            <NameRequestInfo :nameRequest="item.nameRequest" />
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
// Libraries
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'
import axios from '@/axios-auth'
import Vue2Filters from 'vue2-filters' // needed for orderBy
import { navigate } from '@/utils'

// Dialogs and Components
import { AddCommentDialog, CancelPaymentErrorDialog, ConfirmDialog, DeleteErrorDialog } from '@/components/dialogs'
import { DetailsList, NameRequestInfo, ContactInfo } from '@/components/common'
import PaymentIncomplete from './TodoList/PaymentIncomplete.vue'
import PaymentPaid from './TodoList/PaymentPaid.vue'
import PaymentPending from './TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from './TodoList/PaymentPendingOnlineBanking.vue'
import PaymentUnsuccessful from './TodoList/PaymentUnsuccessful.vue'

// Mixins, Enums and Interfaces
import { AllowableActionsMixin, DateMixin, EnumMixin, FilingMixin, LegalApiMixin, PayApiMixin } from '@/mixins'
import { AllowableActions, CorpTypeCd, FilingNames, FilingStatus, FilingTypes, Routes } from '@/enums'
import { ActionBindingIF, ApiTaskIF, BusinessIF, ConfirmDialogType, TodoItemIF, TodoListResourceIF } from '@/interfaces'

@Component({
  components: {
    // dialogs
    AddCommentDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    // components
    DetailsList,
    NameRequestInfo,
    ContactInfo,
    PaymentIncomplete,
    PaymentPaid,
    PaymentPending,
    PaymentPendingOnlineBanking,
    PaymentUnsuccessful
  },
  mixins: [
    Vue2Filters.mixin
  ]
})
export default class TodoList extends Mixins(
  AllowableActionsMixin, DateMixin, EnumMixin, FilingMixin, LegalApiMixin, PayApiMixin
) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType
  }

  // local properties
  protected addCommentDialog = false
  protected todoItems: Array<TodoItemIF> = []
  protected deleteErrors: Array<any> = []
  protected deleteWarnings: Array<any> = []
  protected deleteErrorDialog = false
  protected cancelPaymentErrors: Array<any> = []
  protected cancelPaymentErrorDialog = false
  protected enableCheckbox: Array<any> = []
  protected confirmEnabled = false
  protected currentFiling: TodoItemIF = null
  protected panel: number = null // currently expanded panel
  protected checkTimer: number = null
  protected inProcessFiling: number = null

  @Prop({ default: null }) readonly highlightId: number

  @Getter isCoop!: boolean
  @Getter getCurrentYear!: number
  @Getter getTasks!: Array<ApiTaskIF>
  @Getter isGoodStanding!: boolean
  @Getter getEntityName!: string
  @Getter isCoaPending!: boolean
  @Getter getTodoListResource!: TodoListResourceIF

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

  /** The Manage Businesses URL string. */
  get manageBusinessesUrl (): string {
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

  /** Whether filing an Alteration is required (ie, there is a Todo filing). */
  get requiresAlteration (): boolean {
    if (this.isBcCompany || this.isUlc) {
      return this.getTasks.some(task => task.task?.filing?.header?.name === FilingTypes.ALTERATION)
    }
    return false
  }

  /** Alteration action button label. */
  get alterationBtnLabel (): string {
    return this.requiresAlteration ? 'Alter Now' : 'Resume'
  }

  /** Whether the File Annual Report button should be disabled. */
  protected isFileAnnualReportDisabled (item: TodoItemIF, index: number): boolean {
    return (
      !item.enabled ||
      (this.isBComp && !this.enableCheckbox[index]) ||
      !this.isAllowed(AllowableActions.FILE_ANNUAL_REPORT)
    )
  }

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
    const blockerTask = this.todoItems.find(task => {
      return (this.isStatusDraft(task) || this.isStatusPending(task) || this.isStatusError(task) ||
        this.isStatusPaid(task) || this.isTypeCorrection(task) || this.isTypeAlteration(task))
    })
    this.setHasBlockerTask(!!blockerTask)

    // if needed, highlight a specific task
    if (this.highlightId) this.highlightTask(this.highlightId)
  }

  /**
   * Identifies the specified task as "in progress" and starts a
   * process to check if the task changes to a completed filing.
   */
  private highlightTask (id: number): void {
    const index = this.todoItems.findIndex(h => h.filingId === id)
    if (index >= 0) {
      this.inProcessFiling = id

      // start check process
      this.checkIfCompleted(id, 0)
    }
  }

  /**
   * Checks whether the subject filing is now Completed.
   * Retries after 1 second for up to 10 iterations.
   */
  private checkIfCompleted (id: number, count: number): void {
    // stop this cycle after 10 iterations
    if (++count > 10) {
      this.inProcessFiling = null
      return
    }

    // get filing's status
    let url = `businesses/${this.getIdentifier}/filings/${id}`
    this.fetchFiling(url).then(filing => {
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

  private loadTodoItem (task: ApiTaskIF): void {
    const todo = task.task.todo
    const header = todo.header

    if (header) {
      switch (header.name) {
        case FilingTypes.ANNUAL_REPORT:
          this.loadAnnualReportTodo(task)
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

  /** Loads a NEW Annual Report todo. */
  private loadAnnualReportTodo (task: ApiTaskIF): void {
    const todo = task.task.todo
    const business = todo.business as BusinessIF
    const header = todo.header

    if (business && header) {
      const ARFilingYear = header.ARFilingYear
      const subtitle: string = (task.enabled && !this.isBComp) ? '(including Address and/or Director Change)' : null

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
        nextArDate: this.apiToYyyyMmDd(business.nextAnnualReport), // BCOMP only
        arDueDate: this.formatYyyyMmDd(header.arMaxDate),
        commentsLink: null // cannot add comments to Todo item
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in todo =', todo)
    }
  }

  private async loadFilingItem (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
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
      if (!this.isGoodStanding && this.isStatusDraft(header)) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode ? await this.getPayErrorObj(paymentStatusCode) : null

      const item: TodoItemIF = {
        name: FilingTypes.DISSOLUTION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        title: this.getTodoListResource?.title,
        draftTitle: this.filingTypeToName(FilingTypes.DISSOLUTION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        goodStanding: this.isGoodStanding,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        comments: this.flattenAndSortComments(header.comments),
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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
      if (!this.isGoodStanding && this.isStatusDraft(header)) {
        task.enabled = false
      }

      const corpTypeDescription = this.getCorpTypeDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode ? await this.getPayErrorObj(paymentStatusCode) : null

      const item: TodoItemIF = {
        name: FilingTypes.ALTERATION,
        filingId: header.filingId,
        legalType: corpTypeDescription,
        title: this.alterationTitle(header.priority, corpTypeDescription),
        draftTitle: this.filingTypeToName(FilingTypes.ALTERATION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        goodStanding: this.isGoodStanding,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        comments: this.flattenAndSortComments(header.comments),
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`

      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or alteration or business in task =', task)
    }
  }

  /**
   * Loads a DRAFT/PENDING/ERROR/PAID Annual Report filing.
   * (Currently used for Coop ARs only, as BComps can't save draft ARs.)
   */
  private async loadAnnualReport (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const annualReport = filing.annualReport
    const business = filing.business
    const header = filing.header

    if (annualReport && business && header) {
      // FUTURE: delete fallback when all draft ARs contain ARFilingYear
      const ARFilingYear = header.ARFilingYear || this.getArFilingYear(annualReport)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode ? await this.getPayErrorObj(paymentStatusCode) : null

      const item: TodoItemIF = {
        name: FilingTypes.ANNUAL_REPORT,
        filingId: header.filingId,
        title: `File ${ARFilingYear} Annual Report`,
        draftTitle: `${ARFilingYear} Annual Report`,
        ARFilingYear,
        // FUTURE: delete fallbacks when all draft ARs contain arMinDate and arMaxDate
        arMinDate: header.arMinDate || this.getArMinDate(ARFilingYear), // COOP only
        arMaxDate: header.arMaxDate || this.getArMaxDate(ARFilingYear), // COOP only
        status: header.status || FilingStatus.NEW,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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
    const changeOfDirectors = filing.changeOfDirectors
    const header = filing.header

    // NB: don't check "changeOfDirectors" as it may be empty
    if (business && header) {
      const paymentStatusCode = header.paymentStatusCode || null
      const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

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
        payErrorObj,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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
      const paymentStatusCode = header.paymentStatusCode || null
      const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

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
        payErrorObj,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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
      const payErrorObj = paymentStatusCode ? await this.getPayErrorObj(paymentStatusCode) : null

      const item: TodoItemIF = {
        name: FilingTypes.CORRECTION,
        filingId: header.filingId,
        // this is only used for internal corrections (not IA):
        correctedFilingId: correction.correctedFilingId,
        // this is only used for external corrections (IA):
        correctedFilingType: this.filingTypeToName(correction.correctedFilingType as FilingTypes),
        title: (this.priorityCorrectionTitle(header.priority) + ' - ' +
          this.filingTypeToName(correction.correctedFilingType as FilingTypes)),
        draftTitle: this.filingTypeToName(FilingTypes.CORRECTION),
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        comments: this.flattenAndSortComments(header.comments),
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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

      const paymentStatusCode = header.paymentStatusCode || null
      const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

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
        nameRequest: this.nameRequest,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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

      const paymentStatusCode = header.paymentStatusCode || null
      const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

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
        nameRequest: this.nameRequest,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
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

      const paymentStatusCode = header.paymentStatusCode || null
      const payErrorObj = paymentStatusCode && await this.getPayErrorObj(paymentStatusCode)

      const draft = changeOfRegistration
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
        nameRequest: this.nameRequest,
        commentsLink: `businesses/${this.getIdentifier}/filings/${header.filingId}/comments`
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  /** Files a new filing (todo). */
  protected doFileNow (item: TodoItemIF): void {
    switch (item.name) {
      case FilingTypes.ANNUAL_REPORT:
        // file the subject Annual Report
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BCOMP only
        this.setCurrentFilingStatus(FilingStatus.NEW)
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: '0' } }) // 0 means "new AR"
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
        // resume this Annual Report
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BCOMP only
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_DIRECTORS:
        // resume this Change Of Directors
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_ADDRESS:
        // resume this Change Of Address
        this.setCurrentFilingStatus(FilingStatus.DRAFT)
        this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CORRECTION:
        if (item.correctedFilingType === FilingNames.INCORPORATION_APPLICATION) {
          // navigate to Edit web app to correct this Incorporation Application
          const correctionUrl = `${this.editUrl}${this.getIdentifier}/correction/?correction-id=${item.filingId}`
          navigate(correctionUrl)
        } else {
          // resume this Correction Filing
          this.setCurrentFilingStatus(FilingStatus.DRAFT)
          this.$router.push({ name: Routes.CORRECTION,
            params: { filingId: item.filingId.toString(), correctedFilingId: item.correctedFilingId.toString() }
          })
        }
        break

      case FilingTypes.INCORPORATION_APPLICATION:
        // navigate to Create web app to resume this Incorporation Application
        const incorpAppUrl = `${this.createUrl}?id=${this.tempRegNumber}`
        navigate(incorpAppUrl)
        break

      case FilingTypes.REGISTRATION:
        // navigate to Create web app to resume this registration
        const registrationAppUrl = `${this.createUrl}define-registration?id=${this.tempRegNumber}`
        navigate(registrationAppUrl)
        break

      case FilingTypes.ALTERATION:
        // navigate to Edit web app to alter this company
        const alterationUrl = `${this.editUrl}${this.getIdentifier}/alteration/?alteration-id=${item.filingId}`
        navigate(alterationUrl)
        break

      case FilingTypes.DISSOLUTION:
        // navigate to Create web app to dissolve this company
        const dissolutionUrl = `${this.createUrl}define-dissolution?id=${this.getIdentifier}`
        navigate(dissolutionUrl)
        break

      case FilingTypes.CHANGE_OF_REGISTRATION:
        // navigate to Edit web app to alter this firm
        const editUrl = `${this.editUrl}${this.getIdentifier}/change/?change-id=${item.filingId}`
        navigate(editUrl)
        break

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
          // go to Manage Businesses page
          navigate(this.manageBusinessesUrl)
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

  private async doDeleteDraft (item: TodoItemIF, refreshDashboard: boolean = true): Promise<void> {
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

  protected showCommentDialog (filing: TodoItemIF): void {
    this.currentFiling = filing
    this.addCommentDialog = true
  }

  protected hideCommentDialog (needReload: boolean): void {
    this.addCommentDialog = false
    if (needReload) {
      // emit event to reload all data
      this.$root.$emit('reloadData')
    }
  }

  protected isPayError (item: TodoItemIF): boolean {
    return !!item.payErrorObj
  }

  private alterationTitle (priority: boolean, fromLegalType: string): string {
    let title = priority ? 'Priority ' : ''
    if (this.requiresAlteration) {
      title += this.filingTypeToName(FilingTypes.ALTERATION, null, true)
      title += ` - ${fromLegalType} to a BC Benefit Company`
    } else {
      title += this.filingTypeToName(FilingTypes.ALTERATION)
    }
    return title
  }

  private priorityCorrectionTitle (priority: boolean): string {
    let title = priority ? 'Priority ' : ''
    title += this.filingTypeToName(FilingTypes.CORRECTION)
    return title
  }

  /** Closes current panel or opens new panel. */
  protected togglePanel (index: number): void {
    this.panel = (this.panel === index) ? null : index
  }

  /**
   * Returns AR Filing Year in case a draft filing doesn't contain it.
   * FUTURE: Delete this when all draft ARs contain new ARFilingYear.
   */
  getArFilingYear (annualReport: any): number {
    return +annualReport.annualReportDate?.substring(0, 4)
  }

  /**
   * Returns AR Min Date in case a draft filing doesn't contain it.
   * FUTURE: Delete this when all draft ARs contain new arMinDate.
   * @returns date as "YYYY-MM-DD"
   */
  private getArMinDate (ARFilingYear: number): string {
    // min date is the AR year on Jan 1
    // or the date of the previous AR (in case of 2 ARs held in the same year)
    // whichever is latest
    return this.latestYyyyMmDd(`${ARFilingYear}-01-01`, this.lastAnnualReportDate)
  }

  /**
   * Returns AR Max Date in case a draft filing doesn't contain it.
   * FUTURE: Delete this when all draft ARs contain new arMaxDate.
   * @returns date as "YYYY-MM-DD"
   */
  private getArMaxDate (ARFilingYear: number): string {
    if (ARFilingYear === 2020) {
      // special case for 2020 ARs!
      // max date is _today_ or Oct 31, 2021, whichever is earliest
      return this.earliestYyyyMmDd(this.getCurrentDate, '2021-10-31')
    } else if (ARFilingYear < this.getCurrentYear) {
      // for past ARs, max date is the following year on Apr 30
      return `${ARFilingYear + 1}-04-30`
    } else {
      // for current ARs, max date is today
      return this.getCurrentDate
    }
  }

  @Watch('getTasks', { immediate: true })
  private async onTasksChanged (): Promise<void> {
    // load data initially and when tasks list changes
    await this.loadData()
  }

  /** Called when this component is destroyed */
  destroyed (): void {
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

  .bcorps-ar-subtitle {
    padding: 1rem 0 .5rem 0;
  }
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
  padding: 0;

  .v-list-item {
    min-width: 140px;
  }

  .v-list-item__title {
    font-size: $px-14;
    color: $app-blue;
  }
}

.expand-btn {
  margin-left: 0.25rem;
  border: none;
}

.todo-subtitle {
  color: $gray7;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 2.25rem; // for consistent height with and without icon button
  margin-bottom: -0.5rem; // remove extra space when subtitle displays
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

.v-expansion-panel-header:before {
  background-color: white !important;
}

::v-deep .v-expansion-panel-content__wrap {
  padding: 0;
}

.pay-error {
  border-top: solid #a94442 3px;
}
</style>
