<template>
  <div id="todo-list">
    <ConfirmDialog
      ref="confirm"
      attach="#todo-list"
    />

    <AffiliationErrorDialog
      :dialog="fetchAffiliationInvitationsErrorDialog"
      attach="#todo-list"
      icon-color="error"
      summary="Error retrieving affiliation invitations."
      @okay="fetchAffiliationInvitationsErrorDialog=false"
    >
      <template #description>
        <div class="text-center">
          There was an error retrieving pending affiliation invitations.
          <br> Please try again later.
        </div>
      </template>
    </AffiliationErrorDialog>

    <AffiliationErrorDialog
      :dialog="authorizeAffiliationInvitationErrorDialog"
      attach="#todo-list"
      icon-color="error"
      summary="Error updating affiliation invitation."
      @okay="authorizeAffiliationInvitationErrorDialog=false"
    >
      <template #description>
        <div class="text-center">
          An error happened while updating affiliation invitation.
          <br> Please try again later.
        </div>
      </template>
    </AffiliationErrorDialog>

    <DeleteErrorDialog
      :dialog="deleteErrorDialog"
      :errors="deleteErrors"
      :warnings="deleteWarnings"
      attach="#todo-list"
      @okay="resetErrors()"
    />

    <CancelPaymentErrorDialog
      :dialog="cancelPaymentErrorDialog"
      :errors="cancelPaymentErrors"
      attach="#todo-list"
      @okay="resetCancelPaymentErrors()"
    />

    <v-expansion-panels
      v-if="showTodoPanel"
      v-model="panel"
      accordion
    >
      <v-expansion-panel
        v-for="(item, index) in orderedTodoItems"
        :key="index"
        class="align-items-top todo-item px-6 py-5"
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
                <v-btn
                  v-if="showDetailsBtnRed(item)"
                  class="expand-btn ml-1"
                  text
                  color="error"
                  :ripple="false"
                >
                  <v-icon>mdi-information-outline</v-icon>
                  <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                </v-btn>

                <!-- blue details button -->
                <v-btn
                  v-else-if="showDetailsBtnBlue(item)"
                  class="expand-btn ml-1"
                  text
                  color="primary"
                  :ripple="false"
                >
                  <v-icon>mdi-information-outline</v-icon>
                  <span>{{ (panel === index) ? "Hide Details" : "View Details" }}</span>
                </v-btn>
              </h3>

              <!-- Annual Report verify checkbox -->
              <div
                v-if="showAnnualReportCheckbox(item)"
                class="list-item__subtitle pt-4"
              >
                <p>Verify your Office Address and Current Directors before filing your Annual Report.</p>
                <v-checkbox
                  id="enable-checkbox"
                  v-model="enableCheckbox[index]"
                  class="todo-list-checkbox"
                  label="All information about the Office Addresses and Current Directors is correct."
                  :disabled="!item.enabled || isCoaPending || !isAllowed(AllowableActions.ANNUAL_REPORT)"
                  @click.stop
                />
              </div>

              <div
                v-else
                class="list-item__subtitle"
              >
                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- affiliation invitation todo task -->
                <!-- new todo task -->
                <div
                  v-if="isStatusNew(item) || isAffiliationInvitation(item)"
                  class="todo-subtitle"
                >
                  <span v-if="!!item.subtitle">{{ item.subtitle }}</span>
                </div>

                <!-- draft with pay error -->
                <div
                  v-else-if="isStatusDraft(item) && isPayError(item)"
                  class="todo-subtitle"
                >
                  <span>PAYMENT INCOMPLETE</span>
                </div>

                <!-- draft alteration to a BEN not in good standing -->
                <div
                  v-else-if="isStatusDraft(item) && item.isAlteringToBen && !isGoodStanding"
                  class="todo-subtitle mt-4 flex-column align-start"
                >
                  <p class="app-red font-weight-bold">
                    <v-icon
                      small
                      color="error"
                    >
                      mdi-alert
                    </v-icon>
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

                <!-- draft amalgamation -->
                <div
                  v-else-if="isStatusDraft(item) && isTypeAmalgamation(item)"
                  class="todo-subtitle"
                >
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft incorporation -->
                <div
                  v-else-if="isStatusDraft(item) && isTypeIncorporationApplication(item)"
                  class="todo-subtitle"
                >
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft registration -->
                <div
                  v-else-if="isStatusDraft(item) && isTypeRegistration(item)"
                  class="todo-subtitle"
                >
                  <span>{{ item.subtitle }}</span>
                </div>

                <!-- draft other -->
                <div
                  v-else-if="isStatusDraft(item)"
                  class="todo-subtitle"
                >
                  <span>DRAFT</span>
                </div>

                <!-- pending filing -->
                <div
                  v-else-if="isStatusPending(item) || isStatusPendingCorrection(item)"
                  class="todo-subtitle"
                >
                  <template v-if="isTypeCorrection(item) || isTypeAlteration(item)">
                    <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                    <span v-else>FILING PENDING</span>
                  </template>

                  <template v-else>
                    <span>FILING PENDING</span>
                    <span class="vert-pipe" />
                    <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                    <span v-else-if="EnumUtilities.isPayMethodOnlineBanking(item)">ONLINE BANKING PAYMENT PENDING</span>
                    <span v-else>PAYMENT INCOMPLETE</span>
                  </template>
                </div>

                <!-- error filing -->
                <div
                  v-else-if="isStatusError(item)"
                  class="todo-subtitle"
                >
                  <span>FILING PENDING</span>
                  <span class="vert-pipe" />
                  <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                  <span v-else>PAYMENT UNSUCCESSFUL</span>
                </div>

                <!-- paid filing -->
                <div
                  v-else-if="isStatusPaid(item)"
                  class="todo-subtitle"
                >
                  <span>FILING PENDING</span>
                  <span class="vert-pipe" />
                  <span v-if="inProcessFiling === item.filingId">PROCESSING...</span>
                  <span v-else>PAID</span>
                </div>
              </div> <!-- end of other subtitles -->
            </div> <!-- end of todo label -->

            <!-- Affiliation invite todo actions -->
            <div
              v-if="isAffiliationInvitation(item)"
              class="list-item__actions"
              style="flex: 1"
            >
              <v-btn
                class="ma-1 affiliation-invitation-action-button"
                color="primary"
                @click.native.stop="authorizeAffiliationInvitation(true, item)"
              >
                <span>Authorize</span>
              </v-btn>
              <v-btn
                class="ma-1 affiliation-invitation-action-button"
                outlined
                color="primary"
                @click.native.stop="authorizeAffiliationInvitation(false, item)"
              >
                <span>Do not authorize</span>
              </v-btn>
            </div>

            <div
              v-else
              class="list-item__actions"
            >
              <div style="width:100%">
                <!-- BEN/BC/CCC/ULC AR special case -->
                <template v-if="isBenBcCccUlc && item.enabled && isTypeAnnualReport(item) && isStatusNew(item)">
                  <p class="date-subtitle">
                    Due: {{ item.arDueDate }}
                  </p>
                </template>

                <!-- NB: blocks below are mutually exclusive, and order is important -->

                <!-- this loading button pre-empts all buttons below -->
                <template v-if="inProcessFiling === item.filingId">
                  <v-btn
                    text
                    loading
                    disabled
                  />
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

                <!-- non-staff see no buttons for these filings (these are staff-only filings) -->
                <template
                  v-else-if="!isRoleStaff && (
                    EnumUtilities.isTypeCorrection(item) ||
                    EnumUtilities.isTypeConversion(item) ||
                    EnumUtilities.isTypeRestoration(item) ||
                    EnumUtilities.isTypeContinuationOut(item)
                  )"
                >
                  <!-- no action button in this case -->
                </template>

                <!-- draft filing - show Delete only -->
                <template v-else-if="isStatusDraft(item) && showDeleteOnly(item)">
                  <v-btn
                    class="btn-draft-delete"
                    color="primary"
                    @click.native.stop="confirmDeleteDraft(item)"
                  >
                    <span>Delete draft</span>
                  </v-btn>
                </template>

                <!-- draft filing - other -->
                <template v-else-if="isStatusDraft(item)">
                  <v-btn
                    class="btn-draft-resume"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumeFiling(item)"
                  >
                    <template v-if="isTypeAmalgamation(item) && item.isEmptyFiling">
                      <span>Fill out Amalgamation Application</span>
                    </template>
                    <template v-else-if="isTypeIncorporationApplication(item) && item.isEmptyFiling">
                      <span v-if="getNameRequest">Incorporate using this NR</span>
                      <span v-else>Incorporate a Numbered Company</span>
                    </template>
                    <template v-else-if="isTypeRegistration(item) && item.isEmptyFiling">
                      <span>Register using this NR</span>
                    </template>
                    <span v-else>Resume</span>
                  </v-btn>

                  <!-- dropdown menu -->
                  <v-menu
                    offset-y
                    left
                  >
                    <template #activator="{ on }">
                      <v-btn
                        id="menu-activator"
                        class="actions__more-actions__btn px-0"
                        color="primary"
                        :disabled="!item.enabled"
                        v-on="on"
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
                        <v-icon
                          class="pr-1"
                          color="primary"
                          size="18px"
                        >
                          mdi-delete-forever
                        </v-icon>
                        <v-list-item-title v-if="EnumUtilities.isTypeDissolutionVoluntary(item)">
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
                        <v-icon
                          class="pr-1"
                          color="primary"
                          size="18px"
                        >
                          mdi-delete-forever
                        </v-icon>
                        <v-list-item-title>
                          Delete {{ EnumUtilities.filingTypeToName(item.name) }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <!-- pending filing -->
                <template v-else-if="isStatusPending(item)">
                  <v-btn
                    v-if="EnumUtilities.isPayMethodOnlineBanking(item)"
                    class="btn-change-payment-type"
                    :class="{ 'cancellable' : isCancellableTodoItem(item) }"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Change Payment Type</span>
                  </v-btn>
                  <v-btn
                    v-else
                    class="btn-resume-payment"
                    :class="{ 'cancellable' : isCancellableTodoItem(item) }"
                    color="primary"
                    :disabled="!item.enabled"
                    @click.native.stop="doResumePayment(item)"
                  >
                    <span>Resume Payment</span>
                  </v-btn>

                  <!-- dropdown menu -->
                  <v-menu
                    v-if="isCancellableTodoItem(item)"
                    offset-y
                    left
                  >
                    <template #activator="{ on }">
                      <v-btn
                        id="menu-activator"
                        class="actions__more-actions__btn px-0"
                        color="primary"
                        :disabled="!item.enabled"
                        v-on="on"
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

          <!-- affiliation invitation todo details -->
          <template v-if="isAffiliationInvitation(item)">
            <AffiliationInvitationDetails :affiliationInvitationTodo="item" />
          </template>

          <!-- does this item have an incomplete payment? -->
          <template v-if="isStatusDraft(item) && isPayError(item)">
            <PaymentIncomplete :filing="item" />
          </template>

          <!-- is this a conversion in any status? -->
          <template v-else-if="isTypeConversion(item)">
            <ConversionDetails
              :filing="item"
              class="mb-4"
            />
          </template>

          <!-- is this a draft correction? -->
          <template v-else-if="isStatusDraft(item) && isTypeCorrection(item)">
            <div
              data-test-class="correction-draft"
              class="todo-list-detail body-2"
            >
              <p class="list-item__subtitle">
                This filing is in review and has been saved as a draft.<br>
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6" />
              <!-- the correction comment -->
              <CorrectionComment :comment="item.comment" />
            </div>
          </template>

          <!-- is this a correction in any other status? -->
          <template v-else-if="isTypeCorrection(item)">
            <div
              data-test-class="correction-pending"
              class="todo-list-detail body-2"
            >
              <p class="list-item__subtitle">
                This filing is pending review by Registry Staff.<br>
                Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
              </p>
              <v-divider class="my-6" />
              <!-- the correction comment -->
              <CorrectionComment :comment="item.comment" />
            </div>
          </template>

          <!-- is this a draft Amalgamation or IA or Registration? -->
          <template
            v-else-if="isStatusDraft(item) && (isTypeAmalgamation(item) || isTypeIncorporationApplication(item) ||
              isTypeRegistration(item))"
          >
            <NameRequestInfo :nameRequest="item.nameRequest" />
          </template>

          <!-- does this item have a pending payment? -->
          <template v-else-if="isStatusPending(item)">
            <PaymentPendingOnlineBanking
              v-if="EnumUtilities.isPayMethodOnlineBanking(item)"
              :filing="item"
              :payApiUrl="getPayApiUrl"
              :accountId="accountId"
              class="mb-6"
            />
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
    <v-card
      v-if="!showTodoPanel"
      class="no-results"
      flat
    >
      <v-card-text>
        <div class="no-results__title">
          You don't have anything to do yet
        </div>
        <div class="no-results__subtitle">
          Filings that require your attention will appear here
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import axios from '@/axios-auth'
import { GetFeatureFlag, navigate } from '@/utils'
import { AffiliationErrorDialog, CancelPaymentErrorDialog, ConfirmDialog, DeleteErrorDialog }
  from '@/components/dialogs'
import { ContactInfo, NameRequestInfo } from '@/components/common'
import AffiliationInvitationDetails from './TodoList/AffiliationInvitationDetails.vue'
import ConversionDetails from './TodoList/ConversionDetails.vue'
import CorrectionComment from './TodoList/CorrectionComment.vue'
import PaymentIncomplete from './TodoList/PaymentIncomplete.vue'
import PaymentPaid from './TodoList/PaymentPaid.vue'
import PaymentPending from './TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from './TodoList/PaymentPendingOnlineBanking.vue'
import PaymentUnsuccessful from './TodoList/PaymentUnsuccessful.vue'
import VueRouter from 'vue-router'
import { AllowableActionsMixin, DateMixin, EnumMixin } from '@/mixins'
import { AuthServices, EnumUtilities, LegalServices, PayServices } from '@/services/'
import {
  AffiliationInvitationStatus,
  AffiliationInvitationType,
  AllowableActions,
  CorpTypeCd,
  FilingNames,
  FilingStatus,
  FilingSubTypes,
  FilingTypes,
  Routes
} from '@/enums'
import {
  AffiliationInvitationIF,
  ApiFilingIF,
  ApiTaskIF,
  BusinessWarningIF,
  ConfirmDialogType,
  TodoItemIF,
  TodoListResourceIF
} from '@/interfaces'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({
  components: {
    // dialogs
    AffiliationErrorDialog,
    CancelPaymentErrorDialog,
    ConfirmDialog,
    DeleteErrorDialog,
    // components
    AffiliationInvitationDetails,
    ConversionDetails,
    CorrectionComment,
    NameRequestInfo,
    ContactInfo,
    PaymentIncomplete,
    PaymentPaid,
    PaymentPending,
    PaymentPendingOnlineBanking,
    PaymentUnsuccessful
  }
})
export default class TodoList extends Mixins(AllowableActionsMixin, DateMixin, EnumMixin) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType
  }

  // local properties
  todoItems: Array<TodoItemIF> = []
  deleteErrors: Array<any> = []
  deleteWarnings: Array<any> = []
  deleteErrorDialog = false
  cancelPaymentErrors: Array<any> = []
  cancelPaymentErrorDialog = false
  enableCheckbox: Array<any> = []
  confirmEnabled = false
  panel: number = null // currently expanded panel
  checkTimer = null // may be type number or NodeJS.Timeout
  inProcessFiling: number = null
  fetchAffiliationInvitationsErrorDialog = false
  authorizeAffiliationInvitationErrorDialog = false
  accountId: number = null

  @Prop({ default: null }) readonly highlightId!: number

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useConfigurationStore) getBusinessesUrl!: string
  @Getter(useConfigurationStore) getAuthApiUrl!: string
  @Getter(useBusinessStore) getBusinessWarnings!: Array<BusinessWarningIF>
  @Getter(useConfigurationStore) getCreateUrl!: string
  @Getter(useConfigurationStore) getEditUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useRootStore) getNameRequest!: any
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useFilingHistoryListStore) getPendingCoa!: ApiFilingIF
  @Getter(useRootStore) getTasks!: Array<ApiTaskIF>
  @Getter(useRootStore) getTodoListResource!: TodoListResourceIF
  @Getter(useBusinessStore) isBenBcCccUlc!: boolean
  // @Getter(useAuthenticationStore) isRoleStaff!: boolean

  @Action(useRootStore) setARFilingYear!: (x: number) => void
  @Action(useRootStore) setArMinDate!: (x: string) => void
  @Action(useRootStore) setArMaxDate!: (x: string) => void
  @Action(useRootStore) setNextARDate!: (x: string) => void

  // for template
  readonly AllowableActions = AllowableActions
  readonly EnumUtilities = EnumUtilities
  readonly FilingStatus = FilingStatus

  /** Whether a COA is pending. */
  get isCoaPending (): boolean {
    return !!this.getPendingCoa
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
  showInvalidSection (item: TodoItemIF): boolean {
    if (item.isAlteringToBen && !this.isGoodStanding) return true
    return false
  }

  /** Whether to show the Annual Report verify checkbox. */
  showAnnualReportCheckbox (item: TodoItemIF): boolean {
    return (
      item.enabled &&
      this.businessId &&
      this.isBenBcCccUlc &&
      this.isTypeAnnualReport(item) &&
      this.isStatusNew(item)
    )
  }

  /** Whether the File Annual Report button should be disabled. */
  isFileAnnualReportDisabled (item: TodoItemIF, index: number): boolean {
    return (
      !item.enabled ||
      (this.isBenBcCccUlc && !this.enableCheckbox[index]) ||
      !this.isAllowed(AllowableActions.ANNUAL_REPORT)
    )
  }

  /** Whether to show the details button with blue color. */
  showDetailsBtnBlue (item: TodoItemIF): boolean {
    if (this.isStatusNew(item) && this.isTypeConversion(item)) return true
    if (this.isStatusDraft(item) && this.isTypeConversion(item)) return true
    if (this.isStatusDraft(item) && this.isTypeAmalgamation(item) &&
      item.nameRequest) return true
    if (this.isStatusDraft(item) && this.isTypeIncorporationApplication(item) &&
      item.nameRequest) return true
    if (this.isStatusDraft(item) && this.isTypeRegistration(item) &&
      item.nameRequest) return true
    if (this.isStatusPending(item)) return true
    if (this.isAffiliationInvitation(item)) return true
    return false
  }

  /** Whether to show the details button with red color. */
  showDetailsBtnRed (item: TodoItemIF): boolean {
    if (this.isStatusDraft(item) && this.isTypeCorrection(item)) return true
    if (this.isStatusDraft(item) && this.isPayError(item)) return true
    if (this.isStatusError(item) && (this.inProcessFiling !== item.filingId)) return true
    if (this.isStatusPaid(item) && (this.inProcessFiling !== item.filingId)) return true
    return false
  }

  /** Whether to show the Delete button only for a draft item. */
  showDeleteOnly (item: TodoItemIF): boolean {
    switch (item.name) {
      case FilingTypes.ALTERATION:
      case FilingTypes.DISSOLUTION:
      case FilingTypes.SPECIAL_RESOLUTION:
        // when NIGS, non-staff can only delete item (staff can resume, etc)
        return (!this.isGoodStanding && !this.isRoleStaff)
      default:
        return false
    }
  }

  /** Loads list of tasks from the API into Todo Items array. */
  async loadData (): Promise<void> {
    this.todoItems = []

    await this.loadAffiliationInvitationsTodo()

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

    // if needed, highlight a specific task
    if (this.highlightId) this.highlightTask(this.highlightId)
  }

  /**
   * Identifies the specified task as "in progress" and starts a
   * process to check if the task changes to a completed filing.
   */
  highlightTask (id: number): void {
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
  checkIfCompleted (id: number, count: number): void {
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

  /** Check if task item is cancellable (has a draft). */
  isCancellableTodoItem (item: TodoItemIF): boolean {
    return (
      (item.name !== FilingTypes.AGM_EXTENSION) &&
      (item.name !== FilingTypes.AGM_LOCATION_CHANGE)
    )
  }

  /** Loads a todo item into the Todo Items array. */
  loadTodoItem (task: ApiTaskIF): void {
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
  loadAnnualReportTodo (task: ApiTaskIF): void {
    const todo = task.task.todo
    const business = todo.business
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

  /** check if the item is actually affiliation invite todo; (not a regular filing item). */
  isAffiliationInvitation (item): boolean {
    // check that affiliation invitation details are set
    return !!item.affiliationInvitationDetails
  }

  async authorizeAffiliationInvitation (isAuthorized: boolean, affiliationInvitationTodo: TodoItemIF) {
    const response = await AuthServices.authorizeAffiliationInvitation(
      this.getAuthApiUrl,
      affiliationInvitationTodo.affiliationInvitationDetails.id,
      isAuthorized
    ).catch(err => {
      // eslint-disable-line no-console
      console.log('failed the call for authorization of affiliation invitation', err)
      this.authorizeAffiliationInvitationErrorDialog = true
      return null
    })

    const index = this.todoItems.indexOf(affiliationInvitationTodo)
    if (response?.status === 200 && index > -1) {
      this.todoItems.splice(index, 1)
    }
  }

  /** Loads Org Affiliations invitation todo **/
  async loadAffiliationInvitationsTodo () {
    // feature-flag-it
    if (!GetFeatureFlag('enable-affiliation-invitation-request-access')) {
      return
    }

    function buildTodoItemIfFromAffiliationInvitation (affiliationInvitation: AffiliationInvitationIF, order: number) {
      const newTodo: TodoItemIF = {
        draftTitle: null,
        enabled: true,
        filingId: -1, // not a filing
        name: null,
        order: order,
        subtitle: `From: ${affiliationInvitation.fromOrg.name}`,
        status: null,
        title: 'Request for authorization to manage this business',
        affiliationInvitationDetails: {
          id: affiliationInvitation.id,
          fromOrgName: affiliationInvitation.fromOrg.name,
          additionalMessage: affiliationInvitation.additionalMessage || ''
        }
      }

      return newTodo
    }

    // load all the invitations here and push them into todo items
    this.accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const response =
      await AuthServices.fetchAffiliationInvitations(this.getAuthApiUrl, this.getIdentifier, this.accountId)
        .catch((err) => {
          console.log('Error fetching affiliation invitations for todo', err) // eslint-disable-line no-console
          this.fetchAffiliationInvitationsErrorDialog = true
          return null
        })

    const affiliationInvitations: Array<AffiliationInvitationIF> =
      response?.data?.affiliationInvitations ? response.data.affiliationInvitations : []

    affiliationInvitations.forEach(affiliationInvitation => {
      // only active (pending) affiliation invitations are to be converted into todo item for now
      if (affiliationInvitation.type === AffiliationInvitationType.REQUEST &&
        affiliationInvitation.status === AffiliationInvitationStatus.PENDING) {
        const newTodo = buildTodoItemIfFromAffiliationInvitation(affiliationInvitation, this.todoItems.length)
        this.todoItems.push(newTodo)
      }
    })
  }

  /** Loads a NEW Conversion todo. */
  loadConversionTodo (task: ApiTaskIF): void {
    if (!this.isRoleStaff) return // regular users can't file a new conversion

    const todo = task.task.todo
    const business = todo.business
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
  async loadFilingItem (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing // already checked for not falsey in loadData()
    const header = filing.header

    if (header) {
      switch (header.name) {
        case FilingTypes.AGM_EXTENSION:
          await this.loadAgmExtension(task)
          break
        case FilingTypes.AGM_LOCATION_CHANGE:
          await this.loadAgmLocationChange(task)
          break
        case FilingTypes.ALTERATION:
          await this.loadAlteration(task)
          break
        case FilingTypes.AMALGAMATION_APPLICATION:
          await this.loadAmalgamation(task)
          break
        case FilingTypes.ANNUAL_REPORT:
          await this.loadAnnualReport(task)
          break
        case FilingTypes.CHANGE_OF_ADDRESS:
          await this.loadChangeOfAddress(task)
          break
        case FilingTypes.CHANGE_OF_DIRECTORS:
          await this.loadChangeOfDirectors(task)
          break
        case FilingTypes.CHANGE_OF_REGISTRATION:
          await this.loadChangeOfRegistration(task)
          break
        case FilingTypes.CONSENT_CONTINUATION_OUT:
          await this.loadConsentContinuationOut(task)
          break
        case FilingTypes.CONTINUATION_OUT:
          await this.loadContinuationOut(task)
          break
        case FilingTypes.CONVERSION:
          await this.loadConversion(task)
          break
        case FilingTypes.CORRECTION:
          await this.loadCorrection(task)
          break
        case FilingTypes.DISSOLUTION:
          await this.loadDissolution(task)
          break
        case FilingTypes.INCORPORATION_APPLICATION:
          await this.loadIncorporationApplication(task)
          break
        case FilingTypes.REGISTRATION:
          await this.loadRegistration(task)
          break
        case FilingTypes.RESTORATION:
          await this.loadRestoration(task)
          break
        case FilingTypes.SPECIAL_RESOLUTION:
          await this.loadSpecialResolution(task)
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

  async loadDissolution (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const dissolution = filing.dissolution
    const business = filing.business
    const header = filing.header

    if (dissolution && business && header) {
      const corpFullDescription = GetCorpFullDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.DISSOLUTION,
        filingId: header.filingId,
        legalType: corpFullDescription,
        title: this.getTodoListResource?.title,
        draftTitle: EnumUtilities.filingTypeToName(FilingTypes.DISSOLUTION),
        filingSubType: dissolution.dissolutionType,
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

  async loadAlteration (task: ApiTaskIF): Promise<void> {
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

      const corpFullDescription = GetCorpFullDescription(business.legalType)

      let title = header.priority ? 'Priority ' : ''
      if (isAlteringToBen) {
        title += EnumUtilities.filingTypeToName(FilingTypes.CHANGE_OF_COMPANY_INFO)
        title += ` - ${corpFullDescription} to a BC Benefit Company`
      } else {
        title += EnumUtilities.filingTypeToName(FilingTypes.ALTERATION)
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.ALTERATION,
        filingId: header.filingId,
        legalType: corpFullDescription,
        isAlteringToBen,
        title,
        draftTitle: EnumUtilities.filingTypeToName(FilingTypes.ALTERATION),
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
  async loadAnnualReport (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const annualReport = filing.annualReport
    const business = filing.business
    const header = filing.header

    if (annualReport && business && header) {
      const ARFilingYear = header.ARFilingYear
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

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

  async loadChangeOfDirectors (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const header = filing.header

    // NB: don't check "changeOfDirectors" as it may be empty
    if (business && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CHANGE_OF_DIRECTORS,
        filingId: header.filingId,
        title: 'File Director Change',
        draftTitle: 'Director Change',
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

  async loadChangeOfAddress (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const changeOfAddress = filing.changeOfAddress
    const header = filing.header

    if (business && changeOfAddress && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CHANGE_OF_ADDRESS,
        filingId: header.filingId,
        title: 'File Address Change',
        draftTitle: 'Address Change',
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

  async loadCorrection (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const business = filing.business
    const correction = filing.correction
    const header = filing.header

    if (business && correction && header) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.CORRECTION,
        filingId: header.filingId,
        // this is only used for internal corrections (not IA):
        correctedFilingId: correction.correctedFilingId,
        // this is only used for external corrections (IA):
        // Corrections on Alterations always have a correctedFilingType of Alteration -> alterationRequired = true
        correctedFilingType: EnumUtilities.filingTypeToName(correction.correctedFilingType as FilingTypes),
        title: (this.priorityCorrectionTitle(header.priority) + ' - ' +
          EnumUtilities.filingTypeToName(correction.correctedFilingType as FilingTypes)),
        draftTitle: EnumUtilities.filingTypeToName(FilingTypes.CORRECTION),
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

  async loadAmalgamation (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const amalgamation = filing.amalgamationApplication

    if (header && amalgamation) {
      // set subtitle only if DRAFT IA
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.getNameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.getNameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      // NB: amalgamation application may be undefined
      const haveData = Boolean(
        amalgamation?.amalgamatingBusinesses ||
        amalgamation?.offices ||
        amalgamation?.contactPoint ||
        amalgamation?.parties ||
        amalgamation?.shareStructure?.shareClasses
      )

      const item: TodoItemIF = {
        name: FilingTypes.AMALGAMATION_APPLICATION,
        filingId: header.filingId,
        title: filing.displayName,
        subtitle,
        draftTitle: FilingNames.AMALGAMATION_APPLICATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.getNameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or amalgamation in filing =', filing)
    }
  }

  async loadIncorporationApplication (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const incorporationApplication = filing.incorporationApplication

    // NB: don't check "incorporationApplication" as it may be empty
    if (header) {
      // set subtitle only if DRAFT IA
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.getNameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.getNameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      // NB: incorporationApplication may be undefined
      const haveData = Boolean(
        incorporationApplication?.offices ||
        incorporationApplication?.contactPoint ||
        incorporationApplication?.parties ||
        incorporationApplication?.shareClasses
      )

      const item: TodoItemIF = {
        name: FilingTypes.INCORPORATION_APPLICATION,
        filingId: header.filingId,
        title: filing.displayName,
        subtitle,
        draftTitle: FilingNames.INCORPORATION_APPLICATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.getNameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header in filing =', filing)
    }
  }

  async loadRegistration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const registration = filing.registration

    // NB: don't check "registration" as it may be empty
    if (header) {
      // set subtitle only if DRAFT
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.getNameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.getNameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      // NB: registration may be undefined
      const haveData = Boolean(
        registration?.offices ||
        registration?.contactPoint ||
        registration?.parties ||
        registration?.shareClasses
      )

      const item: TodoItemIF = {
        name: FilingTypes.REGISTRATION,
        filingId: header.filingId,
        title: filing.displayName,
        subtitle,
        draftTitle: FilingNames.REGISTRATION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        isEmptyFiling: !haveData,
        nameRequest: this.getNameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  async loadChangeOfRegistration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const changeOfRegistration = filing.changeOfRegistration

    if (header && changeOfRegistration) {
      const title = `Change to ${GetCorpFullDescription(this.getLegalType)} Registration`

      // set subtitle only if DRAFT
      let subtitle: string = null
      if (this.isStatusDraft(header)) {
        if (this.getNameRequest) {
          subtitle = `NR APPROVED - ${this.expiresText(this.getNameRequest)}`
        } else {
          subtitle = 'DRAFT'
        }
      }

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

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
        nameRequest: this.getNameRequest
      }
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  async loadConversion (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const conversion = filing.conversion

    if (header && conversion) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item = {
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
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      } as TodoItemIF
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  async loadConsentContinuationOut (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const consentContinuationOut = filing.consentContinuationOut

    if (header && consentContinuationOut) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item = {
        name: FilingTypes.CONSENT_CONTINUATION_OUT,
        filingId: header.filingId,
        title: FilingNames.CONSENT_CONTINUATION_OUT,
        draftTitle: FilingNames.CONSENT_CONTINUATION_OUT,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      } as TodoItemIF
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  async loadAgmExtension (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const agmExtension = filing.agmExtension

    if (header && agmExtension) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item = {
        name: FilingTypes.AGM_EXTENSION,
        filingId: header.filingId,
        title: FilingNames.AGM_EXTENSION,
        draftTitle: FilingNames.AGM_EXTENSION,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      } as TodoItemIF
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or agmExtension in filing =', filing)
    }
  }

  async loadAgmLocationChange (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const agmLocationChange = filing.agmLocationChange

    if (header && agmLocationChange) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item = {
        name: FilingTypes.AGM_LOCATION_CHANGE,
        filingId: header.filingId,
        title: FilingNames.AGM_LOCATION_CHANGE,
        draftTitle: FilingNames.AGM_LOCATION_CHANGE,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      } as TodoItemIF
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or agmLocationChange in filing =', filing)
    }
  }

  async loadContinuationOut (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const continuationOut = filing.continuationOut

    if (header && continuationOut) {
      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item = {
        name: FilingTypes.CONTINUATION_OUT,
        filingId: header.filingId,
        title: FilingNames.CONTINUATION_OUT,
        draftTitle: FilingNames.CONTINUATION_OUT,
        status: header.status,
        enabled: task.enabled,
        order: task.order,
        paymentMethod: header.paymentMethod || null,
        paymentToken: header.paymentToken || null,
        payErrorObj,
        // FUTURE: ideally, this would come from the filing:
        warnings: this.getBusinessWarnings.map(warning => warning.message)
      } as TodoItemIF
      this.todoItems.push(item)
    } else {
      // eslint-disable-next-line no-console
      console.log('ERROR - invalid header or business in filing =', filing)
    }
  }

  async loadSpecialResolution (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const business = filing.business
    const specialResolution = filing.specialResolution

    if (header && specialResolution) {
      const corpFullDescription = GetCorpFullDescription(business.legalType)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.SPECIAL_RESOLUTION,
        filingId: header.filingId,
        legalType: corpFullDescription,
        title: this.specialResolutionTitle(header.priority),
        draftTitle: EnumUtilities.filingTypeToName(FilingTypes.SPECIAL_RESOLUTION),
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

  async loadRestoration (task: ApiTaskIF): Promise<void> {
    const filing = task.task.filing
    const header = filing.header
    const business = filing.business
    const restoration = filing.restoration

    if (header && restoration) {
      const corpFullDescription = GetCorpFullDescription(business.legalType)

      const title = EnumUtilities.filingTypeToName(FilingTypes.RESTORATION, null, restoration.type)

      const paymentStatusCode = header.paymentStatusCode
      const payErrorObj = paymentStatusCode && await PayServices.getPayErrorObj(this.getPayApiUrl, paymentStatusCode)

      const item: TodoItemIF = {
        name: FilingTypes.RESTORATION,
        filingId: header.filingId,
        legalType: corpFullDescription,
        title,
        draftTitle: title,
        filingSubType: restoration.type,
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

  expiresText (nameRequest: any): string {
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
  doFileNow (item: TodoItemIF): void {
    switch (item.name) {
      case FilingTypes.ANNUAL_REPORT:
        // file the subject Annual Report
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BEN/BC/CCC/ULC only
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: '0' } }) // 0 means "new AR"
        break
      case FilingTypes.CONVERSION: {
        // go to conversion filing
        const url = `${this.getEditUrl}${this.getIdentifier}/conversion`
        navigate(url)
        break
      }
      default:
        // eslint-disable-next-line no-console
        console.log('doFileNow(), invalid type for task =', item)
        break
    }
  }

  /** Resumes a draft filing. */
  doResumeFiling (item: TodoItemIF): void {
    switch (item.name) {
      case FilingTypes.AMALGAMATION_APPLICATION: {
        // navigate to Create UI to resume this Amalgamation
        const amalgamationUrl = `${this.getCreateUrl}?id=${this.tempRegNumber}`
        navigate(amalgamationUrl)
        break
      }

      case FilingTypes.ANNUAL_REPORT:
        // resume this Annual Report locally
        this.setARFilingYear(item.ARFilingYear)
        this.setArMinDate(item.arMinDate) // COOP only
        this.setArMaxDate(item.arMaxDate) // COOP only
        this.setNextARDate(item.nextArDate) // BEN/BC/CCC/ULC only
        this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_DIRECTORS:
        // resume this Change Of Directors locally
        this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CHANGE_OF_ADDRESS:
        // resume this Change Of Address locally
        this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CONSENT_CONTINUATION_OUT:
        // resume this Consent to Continuation Out locally
        this.$router.push({ name: Routes.CONSENT_CONTINUATION_OUT, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CONTINUATION_OUT:
        // resume this Continuation Out locally
        this.$router.push({ name: Routes.CONTINUATION_OUT, params: { filingId: item.filingId.toString() } })
        break

      case FilingTypes.CORRECTION:
        // see also ItemHeaderActions.vue:correctThisFiling()
        switch (item.correctedFilingType) {
          case FilingNames.ALTERATION:
          case FilingNames.CHANGE_OF_REGISTRATION:
          case FilingNames.CORRECTION:
          case FilingNames.INCORPORATION_APPLICATION:
          case FilingNames.REGISTRATION:
          case FilingNames.SPECIAL_RESOLUTION:
            navigateToCorrectionEditUi(this.getEditUrl, this.getIdentifier)
            break

          case FilingNames.CHANGE_OF_ADDRESS:
          case FilingNames.CHANGE_OF_DIRECTORS:
            if (this.isBenBcCccUlc || this.isCoop) {
              navigateToCorrectionEditUi(this.getEditUrl, this.getIdentifier)
              break
            } else {
              routeToLocalCorrection(this.$router)
              break
            }

          case FilingTypes.ANNUAL_REPORT:
          case FilingTypes.CONVERSION:
          default:
            routeToLocalCorrection(this.$router)
            break
        }
        break

      case FilingTypes.INCORPORATION_APPLICATION: {
        // navigate to Create UI to resume this Incorporation Application
        const incorpAppUrl = `${this.getCreateUrl}?id=${this.tempRegNumber}`
        navigate(incorpAppUrl)
        break
      }

      case FilingTypes.REGISTRATION: {
        // navigate to Create UI to resume this Registration
        const registrationAppUrl = `${this.getCreateUrl}define-registration?id=${this.tempRegNumber}`
        navigate(registrationAppUrl)
        break
      }

      case FilingTypes.ALTERATION: {
        // navigate to Edit UI to resume this Alteration
        const alterationUrl = `${this.getEditUrl}${this.getIdentifier}/alteration/?alteration-id=${item.filingId}`
        navigate(alterationUrl)
        break
      }

      case FilingTypes.DISSOLUTION: {
        // navigate to Create UI to resume this Dissolution
        const dissolutionUrl = `${this.getCreateUrl}define-dissolution?id=${this.getIdentifier}`
        navigate(dissolutionUrl)
        break
      }

      case FilingTypes.CHANGE_OF_REGISTRATION: {
        // navigate to Edit UI to resume this Change of Registration
        const changeUrl = `${this.getEditUrl}${this.getIdentifier}/change/?change-id=${item.filingId}`
        navigate(changeUrl)
        break
      }

      case FilingTypes.CONVERSION: {
        // navigate to Edit UI to resume this Conversion
        const conversionUrl = `${this.getEditUrl}${this.getIdentifier}/conversion/?conversion-id=${item.filingId}`
        navigate(conversionUrl)
        break
      }

      case FilingTypes.SPECIAL_RESOLUTION: {
        // navigate to Edit UI to resume this Special Resolution
        const specialResolutionUrl =
          `${this.getEditUrl}${this.getIdentifier}/special-resolution/?special-resolution-id=${item.filingId}`
        navigate(specialResolutionUrl)
        break
      }

      case FilingTypes.RESTORATION:
        this.navigateForResumeRestoration(item)
        break

      default:
        // eslint-disable-next-line no-console
        console.log('doResumeFiling(), invalid type for item =', item)
        break
    }

    function navigateToCorrectionEditUi (editUrl: string, identifier: string): void {
      // resume correction via Edit UI
      const correctionUrl = `${editUrl}${identifier}/correction/?correction-id=${item.filingId}`
      navigate(correctionUrl)
    }

    function routeToLocalCorrection (router: VueRouter): void {
      // resume local correction
      router.push({
        name: Routes.CORRECTION,
        params: { filingId: item.filingId.toString(), correctedFilingId: item.correctedFilingId.toString() }
      })
    }
  }

  /* Handles the restoration flow inside of doResumeFiling */
  navigateForResumeRestoration (item: TodoItemIF): void {
    let restorationType: FilingSubTypes
    /**
     * Type assertion is done to fix TypeScript error.
     * "This condition will always return 'false' since the types
     * 'FilingSubTypes' and 'RestorationTypes' have no overlap."
     */
    if (item.filingSubType === FilingSubTypes.FULL_RESTORATION) {
      restorationType = FilingSubTypes.FULL_RESTORATION
    }

    if (item.filingSubType === FilingSubTypes.LIMITED_RESTORATION) {
      restorationType = FilingSubTypes.LIMITED_RESTORATION
    }

    if (item.filingSubType === FilingSubTypes.LIMITED_RESTORATION_EXTENSION) {
      restorationType = FilingSubTypes.LIMITED_RESTORATION_EXTENSION
    }

    if (item.filingSubType === FilingSubTypes.LIMITED_RESTORATION_TO_FULL) {
      restorationType = FilingSubTypes.LIMITED_RESTORATION_TO_FULL
    }

    navigate(this.buildRestorationUrl(item, restorationType))
  }

  // navigate to Create UI if Full/Limited restoration or to Edit UI if Limited extension/Full to Limited conversion
  buildRestorationUrl (item: TodoItemIF, restorationType: FilingSubTypes): string {
    let url: string

    switch (restorationType) {
      case FilingSubTypes.FULL_RESTORATION:
      case FilingSubTypes.LIMITED_RESTORATION: {
        url = `${this.getCreateUrl}?id=${this.getIdentifier}`
        break
      }
      case FilingSubTypes.LIMITED_RESTORATION_EXTENSION:
      case FilingSubTypes.LIMITED_RESTORATION_TO_FULL: {
        url = `${this.getEditUrl}${this.getIdentifier}/` + restorationType + `?restoration-id=${item.filingId}`
        break
      }
    }

    return url
  }

  // this is called for both Resume Payment and Retry Payment
  doResumePayment (item: TodoItemIF): boolean {
    const paymentToken = item.paymentToken

    const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + item.filingId)
    const payUrl = this.getAuthWebUrl + 'makepayment/' + paymentToken + '/' + returnUrl

    navigate(payUrl)
    return true
  }

  confirmDeleteDraft (item: TodoItemIF): void {
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

  confirmDeleteApplication (item: TodoItemIF): void {
    const line1 = `Deleting this ${item.draftTitle} will remove this application and all information ` +
      'associated with this application.'
    const line2 = this.getNameRequest
      ? 'You will be returned to My Business Registry.'
      : 'You will be returned to the Business Registry page.'

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      `Delete ${EnumUtilities.filingTypeToName(item.name)}?`,
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

        if (this.getNameRequest) {
          // go to My Business Registry page
          navigate(this.getAuthWebUrl)
        } else {
          // go to BCROS home page
          navigate(this.getBusinessesUrl)
        }
      } else {
        // do nothing
      }
    }).catch(() => {
      // if we get here, "Don't Delete" was clicked - do nothing
    })
  }

  async doDeleteDraft (item: TodoItemIF, refreshDashboard = true): Promise<void> {
    const id = this.getIdentifier || this.tempRegNumber
    const url = `businesses/${id}/filings/${item.filingId}`

    await axios.delete(url).then(res => {
      if (!res) {
        throw new Error('Invalid API response')
      }

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

  resetErrors (): void {
    this.deleteErrorDialog = false
    this.deleteErrors = []
    this.deleteWarnings = []
  }

  resetCancelPaymentErrors (): void {
    this.cancelPaymentErrorDialog = false
    this.cancelPaymentErrors = []
  }

  confirmCancelPayment (item: TodoItemIF): void {
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

  async cancelPaymentAndSetToDraft (item: TodoItemIF): Promise<void> {
    const url = `businesses/${this.getIdentifier}/filings/${item.filingId}`

    await axios.patch(url, {}).then(res => {
      if (!res) {
        throw new Error('Invalid API response')
      }

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

  isPayError (item: TodoItemIF): boolean {
    return !!item.payErrorObj
  }

  priorityCorrectionTitle (priority: boolean): string {
    let title = priority ? 'Priority ' : ''
    title += EnumUtilities.filingTypeToName(FilingTypes.CORRECTION)
    return title
  }

  specialResolutionTitle (priority: boolean): string {
    let title = priority ? 'Priority ' : ''
    title += EnumUtilities.filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
    return title
  }

  @Watch('getTasks', { immediate: true })
  async onTasksChanged (): Promise<void> {
    // load data initially and when tasks list changes
    await this.loadData()
  }

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // cancel the check timer if it is running
    clearTimeout(this.checkTimer)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.affiliation-invitation-action-button {
  width: 45%;
  min-width: 120px !important;
  float: right;
}

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

  .btn-change-payment-type.cancellable,
  .btn-resume-payment.cancellable {
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
