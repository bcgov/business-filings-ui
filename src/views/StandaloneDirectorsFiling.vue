<template>
  <div id="standalone-directors">
    <AuthErrorDialog
      attach="#standalone-directors"
      :dialog="authErrorDialog"
      :title="'Access Restricted'"
      :text="`You are not authorized to complete this action.`"
      @exit="goToDashboard(true)"
    />

    <ConfirmDialog
      ref="confirm"
      attach="#standalone-directors"
    />

    <FetchErrorDialog
      attach="#standalone-directors"
      :dialog="fetchErrorDialog"
      @exit="goToDashboard(true)"
    />

    <PaymentErrorDialog
      attach="#standalone-directors"
      filingName="Change of Directors"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="onPaymentErrorDialogExit()"
    />

    <ResumeErrorDialog
      attach="#standalone-directors"
      :dialog="resumeErrorDialog"
      @exit="goToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#standalone-directors"
      filingName="Change of Directors"
      :dialog="!!saveErrorReason"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="saveErrorReason=null"
      @retry="onSaveErrorDialogRetry()"
      @okay="onSaveErrorDialogOkay()"
    />

    <StaffPaymentDialog
      :staffPaymentData.sync="staffPaymentData"
      attach="#standalone-directors"
      :dialog="staffPaymentDialog"
      :loading="filingPaying"
      @exit="staffPaymentDialog=false"
      @submit="onClickFilePay(true)"
    />

    <!-- Initial Page Load Transition -->
    <v-fade-transition>
      <div
        v-show="showLoadingContainer"
        class="loading-container"
      >
        <div class="loading__content">
          <v-progress-circular
            color="primary"
            :size="50"
            indeterminate
          />
          <div class="loading-msg">
            {{ loadingMessage }}
          </div>
        </div>
      </div>
    </v-fade-transition>

    <!-- Alternate Loading Spinner -->
    <v-fade-transition>
      <div
        v-show="isFetching"
        class="loading-container grayed-out"
      >
        <div class="loading__content">
          <v-progress-circular
            color="primary"
            size="50"
            indeterminate
          />
          <div class="loading-msg white--text">
            Fetching updated data
          </div>
        </div>
      </div>
    </v-fade-transition>

    <!-- Director Change Edit Page -->
    <v-fade-transition hide-on-leave>
      <div v-show="!inFilingReview">
        <v-container
          id="standalone-directors-container"
          class="view-container"
        >
          <v-row>
            <v-col
              cols="12"
              lg="9"
            >
              <article id="standalone-directors-article">
                <header>
                  <h1 id="director-change-header">
                    Director Change
                  </h1>
                  <p>
                    Select the date of your director changes. If you have director changes that occurred on
                    different dates, you will need to perform multiple Director Change filings &mdash;
                    one for each unique date.
                  </p>

                  <v-alert
                    v-if="!isBaseCompany"
                    type="info"
                    outlined
                    icon="mdi-information"
                    class="white-background"
                  >
                    <span>Director changes can be made as far back as {{ earliestDateToSet }}.</span>
                  </v-alert>
                </header>

                <section>
                  <CodDate
                    :initialCodDate="initialCodDate"
                    @codDate="codDate=$event"
                    @valid="codDateValid=$event"
                  />
                </section>

                <!-- Director Information -->
                <section>
                  <Directors
                    ref="directorsComponent"
                    :directors.sync="updatedDirectors"
                    @directorsPaidChange="onDirectorsPaidChange($event)"
                    @directorsFreeChange="onDirectorsFreeChange($event)"
                    @directorFormValid="directorFormValid=$event"
                    @directorEditAction="directorEditInProgress=$event"
                    @earliestDateToSet="earliestDateToSet=$event"
                    @complianceDialogMsg="complianceDialogMsg=$event"
                  />
                </section>
              </article>
            </v-col>

            <!-- Fee Summary -->
            <v-col
              cols="12"
              lg="3"
              style="position: relative"
            >
              <aside>
                <affix
                  relative-element-selector="#standalone-directors-article"
                  :offset="{ top: 120, bottom: 40 }"
                >
                  <SbcFeeSummary
                    :filingData="filingData"
                    :payURL="getPayApiUrl"
                    @total-fee="totalFee=$event"
                  />
                </affix>
              </aside>
            </v-col>
          </v-row>
        </v-container>

        <v-container
          id="standalone-directors-buttons-container"
          class="list-item"
        >
          <div class="buttons-left">
            <v-btn
              id="cod-save-btn"
              large
              :disabled="busySaving || !IsAuthorized(AuthorizedActions.SAVE_DRAFT)"
              :loading="saving"
              @click="onClickSave()"
            >
              <span>Save</span>
            </v-btn>
            <v-btn
              id="cod-save-resume-btn"
              large
              :disabled="busySaving || !IsAuthorized(AuthorizedActions.SAVE_DRAFT)"
              :loading="savingResuming"
              @click="onClickSaveResume()"
            >
              <span>Save and Resume Later</span>
            </v-btn>
          </div>

          <div class="buttons-right">
            <v-btn
              id="cod-review-confirm-btn"
              color="primary"
              large
              :disabled="!isEditPageValid || busySaving"
              @click="showReviewPage()"
            >
              <span>Review and Confirm</span>
            </v-btn>

            <v-btn
              id="cod-cancel-btn"
              large
              :disabled="busySaving"
              @click="goToDashboard()"
            >
              <span>Cancel</span>
            </v-btn>
          </div>
        </v-container>
      </div>
    </v-fade-transition>

    <!-- Director Change Review Page -->
    <v-fade-transition hide-on-leave>
      <div v-show="inFilingReview">
        <v-container
          id="standalone-directors-container-review"
          class="view-container"
        >
          <v-row>
            <v-col
              cols="12"
              lg="9"
            >
              <article id="standalone-directors-article-review">
                <header>
                  <h1 id="review-director-change-header">
                    Review: Director Change
                  </h1>
                </header>

                <section v-if="complianceDialogMsg">
                  <v-alert
                    type="info"
                    outlined
                    icon="mdi-information"
                    class="white-background"
                  >
                    <p class="complianceDialogMsg mb-0">
                      {{ complianceDialogMsg.msg }}
                    </p>
                  </v-alert>
                </section>

                <!-- Director Information -->
                <section>
                  <header>
                    <h2 id="summary-director-header">
                      Review and Confirm
                    </h2>
                  </header>
                  <SummaryDirectors
                    :directors="updatedDirectors"
                  />
                </section>

                <!-- Folio Number -->
                <section v-if="!IsAuthorized(AuthorizedActions.STAFF_PAYMENT)">
                  <TransactionalFolioNumber
                    :transactionalFolioNumber="getTransactionalFolioNumber"
                    @change="onTransactionalFolioNumberChange"
                    @valid="folioNumberValid = $event"
                  />
                </section>

                <!-- Certify -->
                <section>
                  <header>
                    <h2 id="certify-header">
                      Certify
                    </h2>
                    <p>
                      Enter the legal name of the person authorized to complete and submit this
                      Director Change.
                    </p>
                  </header>
                  <Certify
                    :isCertified.sync="isCertified"
                    :certifiedBy.sync="certifiedBy"
                    :entityDisplay="displayName()"
                    :message="certifyText(feeCode)"
                    @valid="certifyFormValid=$event"
                  />
                </section>
              </article>
            </v-col>

            <!-- Fee Summary -->
            <v-col
              cols="12"
              lg="3"
              style="position: relative"
            >
              <aside>
                <affix
                  relative-element-selector="#standalone-directors-article-review"
                  :offset="{ top: 120, bottom: 40 }"
                >
                  <SbcFeeSummary
                    :filingData="filingData"
                    :payURL="getPayApiUrl"
                  />
                </affix>
              </aside>
            </v-col>
          </v-row>
        </v-container>

        <v-container
          id="standalone-directors-buttons-container-review"
          class="list-item"
        >
          <div class="buttons-left">
            <v-btn
              id="cod-back-btn"
              large
              :disabled="busySaving"
              @click="showEditPage()"
            >
              <span>Back</span>
            </v-btn>
            <v-btn
              id="cod-save-resume-btn"
              large
              :disabled="busySaving || !IsAuthorized(AuthorizedActions.SAVE_DRAFT)"
              :loading="savingResuming"
              @click="onClickSaveResume()"
            >
              <span>Save and Resume Later</span>
            </v-btn>
          </div>

          <div class="buttons-right">
            <v-tooltip
              top
              color="tooltipColor"
              content-class="top-tooltip"
            >
              <template #activator="{ on }">
                <div
                  class="d-inline"
                  v-on="on"
                >
                  <v-btn
                    id="cod-file-pay-btn"
                    color="primary"
                    large
                    :disabled="!isReviewPageValid || busySaving || !IsAuthorized(AuthorizedActions.FILE_AND_PAY)"
                    :loading="filingPaying"
                    @click="onClickFilePay()"
                  >
                    <span>{{ isPayRequired ? "File and Pay" : "File Now (no fee)" }}</span>
                  </v-btn>
                </div>
              </template>
              Ensure all of your information is entered correctly before you File.<br>
              There is no opportunity to change information beyond this point.
            </v-tooltip>
          </div>

          <v-btn
            id="cod-cancel-btn"
            large
            :disabled="busySaving"
            @click="goToDashboard()"
          >
            <span>Cancel</span>
          </v-btn>
        </v-container>
      </div>
    </v-fade-transition>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { StatusCodes } from 'http-status-codes'
import { isEmpty } from 'lodash'
import { IsAuthorized, Navigate } from '@/utils'
import CodDate from '@/components/StandaloneDirectorChange/CodDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, SummaryDirectors, TransactionalFolioNumber } from '@/components/common'
import { AuthErrorDialog, ConfirmDialog, FetchErrorDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog,
  StaffPaymentDialog } from '@/components/dialogs'
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { BusinessServices } from '@/services'
import { AuthorizedActions, SaveErrorReasons } from '@/enums'
import { FilingCodes, FilingTypes, StaffPaymentOptions } from '@bcrs-shared-components/enums'
import { ConfirmDialogType, StaffPaymentIF } from '@/interfaces'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

@Component({
  components: {
    AuthErrorDialog,
    CodDate,
    Directors,
    SummaryDirectors,
    SbcFeeSummary,
    Certify,
    ConfirmDialog,
    FetchErrorDialog,
    PaymentErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog,
    StaffPaymentDialog,
    TransactionalFolioNumber
  }
})
export default class StandaloneDirectorsFiling extends Mixins(CommonMixin, DateMixin,
  FilingMixin, ResourceLookupMixin) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType,
    directorsComponent: Directors
  }

  @Action(useRootStore) setTransactionalFolioNumber!: (x: string) => void

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useConfigurationStore) getBusinessApiGwUrl!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) getFolioNumber!: string
  @Getter(useRootStore) getTransactionalFolioNumber!: string

  // variables
  authErrorDialog = false
  updatedDirectors = []
  fetchErrorDialog = false
  resumeErrorDialog = false
  saveErrorReason: SaveErrorReasons = null
  paymentErrorDialog = false
  staffPaymentDialog = false
  earliestDateToSet = 'your last filing' // default
  inFilingReview = false
  isCertified = false
  certifiedBy = ''
  certifyFormValid = false
  directorFormValid = true
  folioNumberValid = true
  directorEditInProgress = false
  filingId = NaN
  savedFiling: any = null // filing during save
  loadingMessage = ''
  dataLoaded = false
  isFetching = false
  saving = false // true only when saving
  savingResuming = false // true only when saving and resuming
  filingPaying = false // true only when filing and paying
  haveChanges = false
  saveErrors = []
  saveWarnings = []
  initialCodDate = ''
  codDate = null
  codDateValid = false
  complianceDialogMsg = null
  totalFee = 0
  staffPaymentData = { option: StaffPaymentOptions.NONE } as StaffPaymentIF

  // For template
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** True if loading container should be shown, else False. */
  get showLoadingContainer (): boolean {
    // show loading container when data isn't yet loaded and when
    // no dialogs are displayed (otherwise dialogs may be hidden)
    return (!this.dataLoaded && !this.fetchErrorDialog && !this.resumeErrorDialog &&
      !this.saveErrorReason && !this.paymentErrorDialog)
  }

  /** True if edit page is valid. */
  get isEditPageValid (): boolean {
    const filingDataValid = (this.filingData.length > 0)
    return (
      this.codDateValid && this.directorFormValid && !this.directorEditInProgress && filingDataValid
    )
  }

  /** True if review page is valid. */
  get isReviewPageValid (): boolean {
    const filingDataValid = (this.filingData.length > 0)
    return (this.certifyFormValid && this.folioNumberValid && filingDataValid)
  }

  /** True when saving, saving and resuming, or filing and paying. */
  get busySaving (): boolean {
    return (this.saving || this.savingResuming || this.filingPaying)
  }

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** True if payment is required, else False. */
  get isPayRequired (): boolean {
    // FUTURE: modify rule here as needed
    return (this.totalFee > 0)
  }

  /** The Director Change fee code based on entity type. */
  get feeCode (): FilingCodes {
    return this.isBaseCompany ? FilingCodes.DIRECTOR_CHANGE_BC : FilingCodes.DIRECTOR_CHANGE_OT
  }

  /** The Free Director Change fee code based on entity type. */
  get freeFeeCode (): FilingCodes {
    return this.isBaseCompany ? FilingCodes.FREE_DIRECTOR_CHANGE_BC : FilingCodes.FREE_DIRECTOR_CHANGE_OT
  }

  /** Called when component is created. */
  created (): void {
    if (!IsAuthorized(AuthorizedActions.DIRECTOR_CHANGE_FILING)) {
      // user is not authorized to access Director change filing, so route to dashboard
      this.authErrorDialog = true
      return
    }

    // init
    this.setFilingData([])

    // listen for fetch error events
    this.$root.$on('fetch-error-event', () => { this.fetchErrorDialog = true })

    // before unloading this page, if there are changes then prompt user
    window.onbeforeunload = (event) => {
      if (this.haveChanges) {
        event.preventDefault()
        // NB: custom text is not supported in all browsers
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    // Filing ID may be 0, a number or NaN
    this.filingId = +this.$route.query.filingId
  }

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // if tombstone data isn't set, go to dashboard
    if (!this.getIdentifier || isNaN(this.filingId)) {
      // eslint-disable-next-line no-console
      console.log('Standalone Directors Filing error - missing Entity Inc No or Filing ID!')
      this.goToDashboard(true)
      return // don't continue
    }

    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    await this.$nextTick()

    // initial value
    // may be overwritten by resumed draft
    this.initialCodDate = this.getCurrentDate

    if (this.filingId > 0) {
      // resume draft filing
      this.loadingMessage = 'Resuming Your Director Change'
      await this.fetchDraftFiling()
      // fetch original directors
      // update working data only if it wasn't in the draft
      if (!this.isVitestRunning) {
        await this.$refs.directorsComponent.getOrigDirectors(this.initialCodDate, isEmpty(this.updatedDirectors))
      }
    } else {
      // this is a new filing
      this.loadingMessage = 'Preparing Your Director Change'
      // fetch original directors + update working data
      if (!this.isVitestRunning) {
        await this.$refs.directorsComponent.getOrigDirectors(this.initialCodDate, true)
      }
    }

    this.dataLoaded = true
  }

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // stop listening for custom events
    this.$root.$off('fetch-error-event')

    // remove event handler
    window.onbeforeunload = null
  }

  async fetchDraftFiling (): Promise<void> {
    const url = `${this.getBusinessApiGwUrl}businesses/${this.getIdentifier}/filings/${this.filingId}`
    await BusinessServices.fetchFiling(url).then(filing => {
      // verify data
      if (!filing) throw new Error('Missing filing')
      if (!filing.header) throw new Error('Missing header')
      if (!filing.business) throw new Error('Missing business')
      if (filing.header.name !== FilingTypes.CHANGE_OF_DIRECTORS) throw new Error('Invalid filing type')
      if (filing.business.identifier !== this.getIdentifier) throw new Error('Invalid business identifier')
      if (filing.business.legalName !== this.getLegalName) throw new Error('Invalid business legal name')

      // restore Certified By (but not Date)
      this.certifiedBy = filing.header.certifiedBy

      // restore Transactional Folio Number
      if (filing.header.isTransactionalFolioNumber && filing.header.folioNumber) {
        this.setTransactionalFolioNumber(filing.header.folioNumber)
      }

      // restore Staff Payment data
      if (filing.header.routingSlipNumber) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.FAS,
          routingSlipNumber: filing.header.routingSlipNumber,
          isPriority: filing.header.priority
        } as StaffPaymentIF
      } else if (filing.header.bcolAccountNumber) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.BCOL,
          bcolAccountNumber: filing.header.bcolAccountNumber,
          datNumber: filing.header.datNumber,
          folioNumber: filing.header.folioNumber,
          isPriority: filing.header.priority
        } as StaffPaymentIF
      } else if (filing.header.waiveFees) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.NO_FEE
        } as StaffPaymentIF
      } else {
        this.staffPaymentData = {
          option: StaffPaymentOptions.NONE
        } as StaffPaymentIF
      }

      // restore COD Date
      if (filing.header.effectiveDate) {
        this.initialCodDate = this.apiToYyyyMmDd(filing.header.effectiveDate)
      } else if (filing.header.date) {
        this.initialCodDate = this.apiToYyyyMmDd(filing.header.date)
      } else {
        throw new Error('Missing effective date')
      }

      // restore Change of Directors data
      const changeOfDirectors = filing.changeOfDirectors
      if (changeOfDirectors) {
        if (changeOfDirectors.directors?.length > 0) {
          this.updatedDirectors = changeOfDirectors.directors
          // NB: filing data will be set by director paid/free events
        } else {
          throw new Error('Invalid change of directors object')
        }
      } else {
        // changeOfDirectors is optional
        // leave existing directors intact
      }
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchDraftFiling() error =', error)
      this.resumeErrorDialog = true
    })
  }

  onDirectorsPaidChange (modified: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    // when directors change, update filing data
    // use existing Priority and Waive Fees flags
    this.updateFilingData(modified ? 'add' : 'remove', this.feeCode, this.staffPaymentData.isPriority,
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }

  onDirectorsFreeChange (modified: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    // when directors change (free filing), update filing data
    // use existing Priority and Waive Fees flags
    this.updateFilingData(modified ? 'add' : 'remove', this.freeFeeCode,
      this.staffPaymentData.isPriority, (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }

  onTransactionalFolioNumberChange (newFolioNumber: string): void {
    this.setTransactionalFolioNumber(newFolioNumber)
  }

  /**
   * Called when user clicks Save button
   * or when user retries from Save Error dialog.
   */
  async onClickSave (): Promise<void> {
    // prevent double saving
    if (this.busySaving) return

    this.saving = true

    // save draft filing
    this.savedFiling = await this.saveFiling(true).catch(error => {
      this.saveErrorReason = SaveErrorReasons.SAVE
      // try to return filing (which may exist depending on save error)
      return error?.response?.data?.filing || null
    })

    const filingId = +this.savedFiling?.header?.filingId || 0
    if (filingId > 0) {
      // save filing ID for possible future updates
      this.filingId = filingId
    }

    // if there was no error, finish save process now
    // otherwise, dialog may finish this later
    if (!this.saveErrorReason) this.onClickSaveFinish()

    this.saving = false
  }

  onClickSaveFinish (): void {
    // safety check
    if (this.filingId > 0) {
      // changes were saved, so clear flag
      this.haveChanges = false
    } else {
      // eslint-disable-next-line no-console
      console.log('onClickSaveFinish(): invalid filing ID, filing =', null)
    }
  }

  /**
   * Called when user clicks Save and Resume later button
   * or when user retries from Save Error dialog.
   */
  async onClickSaveResume (): Promise<void> {
    // prevent double saving
    if (this.busySaving) return

    this.savingResuming = true

    // save draft filing
    this.savedFiling = await this.saveFiling(true).catch(error => {
      this.saveErrorReason = SaveErrorReasons.SAVE_RESUME
      // try to return filing (which may exist depending on save error)
      return error?.response?.data?.filing || null
    })

    const filingId = +this.savedFiling?.header?.filingId || 0
    if (filingId > 0) {
      // save filing ID for possible future updates
      this.filingId = filingId
    }

    // if there was no error, finish save-resume process now
    // otherwise, dialog may finish this later
    if (!this.saveErrorReason) this.onClickSaveResumeFinish()

    this.savingResuming = false
  }

  onClickSaveResumeFinish (): void {
    // safety check
    if (this.filingId > 0) {
      // changes were saved, so clear flag
      this.haveChanges = false
      // changes were saved, so go to dashboard
      this.goToDashboard(true)
    } else {
      // eslint-disable-next-line no-console
      console.log('onClickSaveResumeFinish(): invalid filing ID, filing =', null)
    }
  }

  /**
   * Called when user clicks File and Pay button
   * or when user retries from Save Error dialog
   * or when user submits from Staff Payment dialog.
   */
  async onClickFilePay (fromStaffPayment = false): Promise<void> {
    // prevent double saving
    if (this.busySaving) return

    // if this is a user with STAFF_PAYMENT permissions clicking File and Pay (not Submit)
    // then detour via Staff Payment dialog
    if (IsAuthorized(AuthorizedActions.STAFF_PAYMENT) && !fromStaffPayment) {
      this.staffPaymentDialog = true
      return
    }

    this.filingPaying = true

    // save final filing (not draft)
    this.savedFiling = await this.saveFiling(false).catch(error => {
      if (error?.response?.status === StatusCodes.PAYMENT_REQUIRED) {
        // changes were saved if a 402 is received, so clear flag
        this.haveChanges = false
        // display payment error dialog
        this.paymentErrorDialog = true
        // try to return filing (which should exist in this case)
        return error?.response?.data?.filing || null
      } else {
        this.saveErrorReason = SaveErrorReasons.FILE_PAY
        // try to return filing (which may exist depending on save error)
        return error?.response?.data?.filing || null
      }
    })

    const filingId = +this.savedFiling?.header?.filingId || 0
    if (filingId > 0) {
      // save filing ID for possible future updates
      this.filingId = filingId
    }

    // if there were no errors, finish file-pay process now
    // otherwise, dialogs may finish this later
    if (!this.paymentErrorDialog && !this.saveErrorReason) this.onClickFilePayFinish()

    this.filingPaying = false
  }

  onClickFilePayFinish (): void {
    // safety check
    if (this.filingId > 0) {
      // changes were saved, so clear flag
      this.haveChanges = false

      const isPaymentActionRequired = Boolean(this.savedFiling.header.isPaymentActionRequired)

      // if payment action is required, navigate to Pay URL
      if (isPaymentActionRequired) {
        const paymentToken = this.savedFiling.header.paymentToken
        const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + this.filingId)
        const payUrl = this.getAuthWebUrl + 'makepayment/' + paymentToken + '/' + returnUrl
        // assume Pay URL is always reachable
        // otherwise, user will have to retry payment later
        Navigate(payUrl)
      } else {
        // route to dashboard with filing id parameter
        this.navigateToBusinessDashboard(this.getIdentifier, this.filingId)
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('onClickFilePayFinish(): invalid filing ID, filing =', null)
    }
  }

  /** Builds and saves the filing. NB: Caller needs to catch exceptions. */
  async saveFiling (isDraft): Promise<any> {
    this.saveErrors = []
    this.saveWarnings = []

    // if this is a new filing, ensure there are no pending tasks
    if (this.filingId === 0) {
      const hasPendingTasks = await BusinessServices.hasPendingTasks(this.getIdentifier)
        .catch(() => {
          this.saveErrors = [{ error: 'Unable to check server for pending tasks.' }]
          throw new Error()
        })

      if (hasPendingTasks) {
        this.saveErrors = [
          { error: 'Another draft filing already exists. Please complete it before creating a new filing.' }
        ]
        throw new Error()
      }
    }

    let changeOfDirectors = null

    const header: any = {
      header: {
        name: FilingTypes.CHANGE_OF_DIRECTORS,
        certifiedBy: this.certifiedBy || '',
        email: 'no_one@never.get',
        date: this.getCurrentDate, // NB: API will reassign this date according to its clock
        effectiveDate: this.yyyyMmDdToApi(this.codDate),
        folioNumber: this.getTransactionalFolioNumber || this.getFolioNumber || undefined,
        isTransactionalFolioNumber: !!this.getTransactionalFolioNumber
      }
    }

    switch (this.staffPaymentData.option) {
      case StaffPaymentOptions.FAS:
        header.header['routingSlipNumber'] = this.staffPaymentData.routingSlipNumber
        header.header['priority'] = this.staffPaymentData.isPriority
        break

      case StaffPaymentOptions.BCOL:
        header.header['bcolAccountNumber'] = this.staffPaymentData.bcolAccountNumber
        header.header['datNumber'] = this.staffPaymentData.datNumber
        header.header['folioNumber'] = this.staffPaymentData.folioNumber
        header.header['priority'] = this.staffPaymentData.isPriority
        break

      case StaffPaymentOptions.NO_FEE:
        header.header['waiveFees'] = true
        break

      case StaffPaymentOptions.NONE: // should never happen
        break
    }

    const business: any = {
      business: {
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.getLegalName,
        legalType: this.getLegalType
      }
    }

    if (this.hasFilingCode(this.feeCode) || this.hasFilingCode(this.freeFeeCode)) {
      changeOfDirectors = {
        [FilingTypes.CHANGE_OF_DIRECTORS]: {
          directors: this.updatedDirectors
        }
      }
    }

    // build filing
    const filing = Object.assign({}, header, business, changeOfDirectors)

    try {
      let ret
      if (this.filingId > 0) {
        // we have a filing id, so update an existing filing
        ret = await BusinessServices.updateFiling(this.getIdentifier, filing, this.filingId, isDraft)
      } else {
        // filing id is 0, so create a new filing
        ret = await BusinessServices.createFiling(this.getIdentifier, filing, isDraft)
      }
      return ret
    } catch (error: any) {
      // save errors or warnings, if any
      this.saveErrors = error?.response?.data?.errors || []
      this.saveWarnings = error?.response?.data?.warnings || []
      throw error
    }
  }

  /**
   * Routes to dashboard if there are no outstanding changes,
   * else prompts user before routing.
   */
  goToDashboard (force = false): void {
    // check if there are no data changes
    if (!this.haveChanges || force) {
      // route to dashboard
      this.navigateToBusinessDashboard(this.getIdentifier)
      return
    }
    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Unsaved Changes',
      'You have unsaved changes in your Change of Directors. Do you want to exit your filing?',
      {
        width: '45rem',
        persistent: true,
        yes: 'Return to my filing',
        no: null,
        cancel: 'Exit without saving'
      }
    ).then(() => {
      // if we get here, Yes was clicked
      // nothing to do
    }).catch(() => {
      // if we get here, Cancel was clicked
      // ignore changes
      this.haveChanges = false
      // route to dashboard
      this.navigateToBusinessDashboard(this.getIdentifier)
    })
  }

  hasAction (director, action): boolean {
    return (director.actions.indexOf(action) >= 0)
  }

  /** Shows the review page and scrolls the window to the top. */
  showReviewPage (): void {
    this.inFilingReview = true
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox and IE
  }

  /** Shows the edit page and scrolls the window to the top. */
  showEditPage (): void {
    this.inFilingReview = false
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox and IE
  }

  /** Handles Exit event from Payment Error dialog. */
  onPaymentErrorDialogExit (): void {
    if (IsAuthorized(AuthorizedActions.STAFF_PAYMENT)) {
      // close Payment Error dialog -- this
      // leaves user on Staff Payment dialog
      this.paymentErrorDialog = false
    } else {
      // close the dialog and go to dashboard --
      // user will have to retry payment from there
      this.paymentErrorDialog = false
      this.goToDashboard(true)
    }
  }

  /** Handles Retry events from Save Error dialog. */
  async onSaveErrorDialogRetry (): Promise<void> {
    switch (this.saveErrorReason) {
      case SaveErrorReasons.SAVE:
        // close the dialog and retry save
        this.saveErrorReason = null
        await this.onClickSave()
        break
      case SaveErrorReasons.SAVE_RESUME:
        // close the dialog and retry save-resume
        this.saveErrorReason = null
        await this.onClickSaveResume()
        break
      case SaveErrorReasons.FILE_PAY:
        // close the dialog and retry file-pay
        this.saveErrorReason = null
        if (IsAuthorized(AuthorizedActions.STAFF_PAYMENT)) await this.onClickFilePay(true)
        else await this.onClickFilePay()
        break
    }
  }

  /** Handles Okay events from Save Error dialog. */
  onSaveErrorDialogOkay (): void {
    switch (this.saveErrorReason) {
      case SaveErrorReasons.SAVE:
        // close the dialog and finish save process
        this.saveErrorReason = null
        this.onClickSaveFinish()
        break
      case SaveErrorReasons.SAVE_RESUME:
        // close the dialog and finish save-resume process
        this.saveErrorReason = null
        this.onClickSaveResumeFinish()
        break
      case SaveErrorReasons.FILE_PAY:
        // close the dialog and finish file-pay process
        this.saveErrorReason = null
        this.onClickFilePayFinish()
        break
    }
  }

  @Watch('codDate')
  async onCodDateChanged (): Promise<void> {
    // ignore changes before data is loaded
    if (!this.dataLoaded) return null

    // fetch original directors with new date
    this.isFetching = true
    if (!this.isVitestRunning) {
      await this.$refs.directorsComponent.getOrigDirectors(this.codDate, false)
    }
    this.isFetching = false
  }

  @Watch('isCertified')
  onIsCertifiedChanged (): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
  }

  @Watch('certifiedBy')
  onCertifiedByChanged (): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
  }

  @Watch('staffPaymentData')
  onStaffPaymentDataChanged (val: StaffPaymentIF): void {
    const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

    // apply Priority flag to xxCDR filing code only
    // if xxCDR code exists, simply re-add it with the updated Priority flag and existing Waive Fees flag
    if (this.hasFilingCode(this.feeCode)) {
      this.updateFilingData('add', this.feeCode, val.isPriority, waiveFees)
    }

    // add/remove Waive Fees flag to/from all filing codes
    this.updateFilingData(waiveFees ? 'add' : 'remove', undefined, undefined, true)

    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#standalone-directors {
  counter-reset: header-counter;
}

#standalone-directors ::v-deep(section) h2::before {
  counter-increment: header-counter;
  content: counter(header-counter) '. ';
}

article {
  .v-card {
    line-height: 1.2rem;
    font-size: $px-14;
  }
}

header p,
section p {
  color: $gray7;
}

section + section {
  margin-top: 3rem;
}

h1 {
  margin-bottom: 1.25rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
}

h2 {
  margin-bottom: 0.25rem;
  margin-top: 3rem;
  font-size: 1.125rem;
}

// Save & Filing Buttons
#standalone-directors-buttons-container,
#standalone-directors-buttons-container-review {
  padding-top: 2rem;
  border-top: 1px solid $gray5;

  .buttons-left {
    width: 50%;
  }

  .buttons-right {
    margin-left: auto;
  }

  .v-btn + .v-btn {
    margin-left: 0.5rem;
  }

  #cod-cancel-btn {
    margin-left: 0.5rem;
  }
}

.complianceDialogMsg {
  font-size: $px-16;
  color: $gray7;
}

.loading-container.grayed-out {
  // these are the same styles as dialog overlay:
  opacity: 0.46;
  background-color: rgb(33, 33, 33); // grey darken-4
  border-color: rgb(33, 33, 33); // grey darken-4
}
</style>
