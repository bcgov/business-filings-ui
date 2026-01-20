<template>
  <div id="notice-of-withdrawal">
    <ConfirmDialog
      ref="confirm"
      attach="#notice-of-withdrawal"
    />

    <StaffRoleErrorDialog
      attach="#notice-of-withdrawal"
      :dialog="staffRoleErrorDialog"
      :title="'Access Restricted'"
      :text="`Only BC Registries staff can access this information.`"
      @exit="goToDashboard(true)"
    />

    <PaymentErrorDialog
      attach="#notice-of-withdrawal"
      filingName="Notice of Withdrawal"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="onPaymentErrorDialogExit()"
    />

    <ResumeErrorDialog
      attach="#notice-of-withdrawal"
      :dialog="resumeErrorDialog"
      @exit="goToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#notice-of-withdrawal"
      filingName="Notice of Withdrawal"
      :dialog="!!saveErrorReason"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="saveErrorReason=null"
      @retry="onSaveErrorDialogRetry()"
      @okay="onSaveErrorDialogOkay()"
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

    <!-- Main Body -->
    <v-container
      v-if="dataLoaded"
      class="view-container"
    >
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <article id="withdrawal-article">
            <!-- Page Title -->
            <header>
              <h1 id="withdrawal-header">
                Notice of Withdrawal
              </h1>
            </header>

            <!-- Record To Be Withdrawn -->
            <RecordToBeWithdrawn
              class="mt-6"
              :filingToBeWithdrawn="filingToBeWithdrawn"
              @partOfPoa="partOfPoa=$event"
              @hasTakenEffect="hasTakenEffect=$event"
            />

            <!-- Documents Delivery -->
            <section>
              <header>
                <h2>Document Delivery</h2>
                <p class="grey-text">
                  Copies of the withdrawal documents will be sent to the email addresses listed below.
                </p>
              </header>
              <div
                id="document-delivery-section"
                :class="{ 'invalid-section': !documentDeliveryValid && showErrors }"
              >
                <v-card
                  flat
                  class="py-8 px-5"
                >
                  <DocumentDelivery
                    :editableCompletingParty="IsAuthorized(AuthorizedActions.EDITABLE_COMPLETING_PARTY)"
                    :contactValue="getBusinessEmail"
                    contactLabel="Registered Office"
                    :documentOptionalEmail="documentOptionalEmail"
                    @update:optionalEmail="documentOptionalEmail=$event"
                    @valid="documentDeliveryValid=$event"
                  />
                </v-card>
              </div>
            </section>

            <!-- Certify -->
            <section>
              <header>
                <h2>Certify</h2>
                <p class="grey-text">
                  Confirm the legal name of the person authorized to complete and submit this withdrawal.
                </p>
              </header>
              <div
                id="certify-form-section"
                :class="{ 'invalid-section': !certifyFormValid && showErrors }"
              >
                <Certify
                  ref="certifyRef"
                  :isCertified.sync="isCertified"
                  :certifiedBy.sync="certifiedBy"
                  :class="{ 'invalid-certify': !certifyFormValid && showErrors }"
                  :disableEdit="!IsAuthorized(AuthorizedActions.EDITABLE_CERTIFY_NAME)"
                  :entityDisplay="displayName()"
                  :message="certifyText(FilingCodes.NOTICE_OF_WITHDRAWAL)"
                  @valid="certifyFormValid=$event"
                />
              </div>
            </section>

            <!-- Court Order and Plan of Arrangement -->
            <section v-if="IsAuthorized(AuthorizedActions.COURT_ORDER_POA)">
              <header>
                <h2>Court Order and Plan of Arrangement</h2>
                <p class="grey-text">
                  If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant
                  to a plan of arrangement, enter the court order number and select Plan of Arrangement.
                </p>
              </header>
              <div
                id="court-order-section"
                :class="{ 'invalid-section': !courtOrderValid && showErrors }"
              >
                <v-card
                  flat
                  class="py-8 px-5"
                >
                  <CourtOrderPoa
                    :autoValidation="showErrors"
                    :courtOrderNumberRequired="false"
                    @emitCourtNumber="fileNumber=$event"
                    @emitPoa="hasPlanOfArrangement=$event"
                    @emitValid="courtOrderValid=$event"
                  />
                </v-card>
              </div>
            </section>

            <!-- Staff Payment -->
            <section v-if="IsAuthorized(AuthorizedActions.STAFF_PAYMENT)">
              <header class="pb-3">
                <h2>Staff Payment</h2>
              </header>
              <div
                id="staff-payment-section"
                :class="{ 'invalid-section': !staffPaymentValid && showErrors }"
              >
                <v-card
                  flat
                  class="py-8 px-5"
                >
                  <StaffPayment
                    :staffPaymentData.sync="staffPaymentData"
                    @staffPaymentFormValid="staffPaymentValid=$event"
                  />
                </v-card>
              </div>
            </section>
          </article>
        </v-col>

        <v-col
          cols="12"
          lg="3"
          style="position: relative"
        >
          <aside>
            <affix
              relative-element-selector="#withdrawal-article"
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

    <!-- Buttons -->
    <v-container
      id="withdrawal-buttons-container"
      class="list-item"
    >
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
                id="withdrawal-file-pay-btn"
                color="primary"
                large
                class="mr-2"
                :disabled="busySaving || hasTakenEffect || !IsAuthorized(AuthorizedActions.FILE_AND_PAY)"
                :loading="filingPaying"
                @click="onClickSubmit()"
              >
                <span>Submit <v-icon right>mdi-chevron-right</v-icon> </span>
              </v-btn>
              <v-btn
                id="withdrawal-cancel-btn"
                large
                outlined
                color="primary"
                :disabled="busySaving"
                @click="goToDashboard()"
              >
                <span>Cancel</span>
              </v-btn>
            </div>
          </template>
          Ensure all of your information is entered correctly before you File.<br>
          There is no opportunity to change information beyond this point.
        </v-tooltip>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { StatusCodes } from 'http-status-codes'
import { IsAuthorized, Navigate } from '@/utils'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify } from '@/components/common'
import RecordToBeWithdrawn from '@/components/NoticeOfWithdrawal/RecordToBeWithdrawn.vue'
import StaffPayment from '@/components/NoticeOfWithdrawal/StaffPayment.vue'
import { ConfirmDialog, StaffRoleErrorDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { BusinessServices } from '@/services'
import { AuthorizedActions, EffectOfOrderTypes, SaveErrorReasons } from '@/enums'
import { FilingCodes, FilingTypes, StaffPaymentOptions } from '@bcrs-shared-components/enums'
import { ConfirmDialogType, StaffPaymentIF, UserInfoIF } from '@/interfaces'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

  @Component({
    components: {
      Certify,
      ConfirmDialog,
      CourtOrderPoa,
      DocumentDelivery,
      StaffRoleErrorDialog,
      PaymentErrorDialog,
      ResumeErrorDialog,
      RecordToBeWithdrawn,
      StaffPayment,
      SaveErrorDialog,
      SbcFeeSummary
    }
  })
export default class NoticeOfWithdrawal extends Mixins(CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin) {
    // Refs
    $refs!: {
      confirm: ConfirmDialogType,
      certifyRef: Certify
    }

    @Getter(useConfigurationStore) getAuthWebUrl!: string
    @Getter(useRootStore) getBusinessEmail!: string
    @Getter(useBusinessStore) getLegalName!: string
    @Getter(useConfigurationStore) getPayApiUrl!: string
    @Getter(useRootStore) getUserInfo!: UserInfoIF

    // enum for template
    readonly FilingCodes = FilingCodes
    readonly AuthorizedActions = AuthorizedActions
    readonly IsAuthorized = IsAuthorized

    // variables for POA arrangement checkboxes
    partOfPoa = false
    hasTakenEffect = false

    // variables for Certify component
    certifiedBy = ''
    isCertified = false
    certifyFormValid = false

    // variables for Court Order component
    courtOrderValid = true
    fileNumber = ''
    hasPlanOfArrangement = false

    // variables for Document Delivery component
    documentDeliveryValid = true
    documentOptionalEmail = ''

    // variables for staff payment
    staffPaymentValid = false
    staffPaymentData = { option: StaffPaymentOptions.NONE } as StaffPaymentIF

    // variables for displaying dialogs
    staffRoleErrorDialog = false
    resumeErrorDialog = false
    saveErrorReason = null as SaveErrorReasons
    paymentErrorDialog = false

    // other variables
    totalFee = 0
    dataLoaded = false
    loadingMessage = ''
    filingId = 0 // id of this Notice if Withdrawal filing
    filingToBeWithdrawn: number = null // id of filing to be withdrawn
    savedFiling: any = null // filing during save
    saving = false // true only when saving
    savingResuming = false // true only when saving and resuming
    showErrors = false // true when we press on File and Pay (trigger validation)
    filingPaying = false // true only when filing and paying
    haveChanges = false
    saveErrors = []
    saveWarnings = []

    /** True if loading container should be shown, else False. */
    get showLoadingContainer (): boolean {
      // show loading container when data isn't yet loaded and when
      // no dialogs are displayed (otherwise dialogs may be hidden)
      return (!this.dataLoaded && !this.saveErrorReason && !this.paymentErrorDialog)
    }

    /** The Base URL string. */
    get baseUrl (): string {
      return sessionStorage.getItem('BASE_URL')
    }

    /** True if page is valid, else False. */
    get isPageValid (): boolean {
      return (
        this.certifyFormValid &&
        this.documentDeliveryValid &&
        this.courtOrderValid &&
        this.staffPaymentValid
      )
    }

    /** True when saving, saving and resuming, or filing and paying. */
    get busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    }

    /** Called when component is created. */
    created (): void {
      // do not proceed if user is does not have required permissions
      if (!IsAuthorized(AuthorizedActions.NOTICE_WITHDRAWAL_FILING)) {
        this.staffRoleErrorDialog = true
        throw new Error('This is a Staff only Filing.')
      }

      // init
      this.setFilingData([])

      // before unloading this page, if there are changes then prompt user
      window.onbeforeunload = (event) => {
        if (this.haveChanges) {
          event.preventDefault()
          // NB: custom text is not supported in all browsers
          event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        }
      }

      // this is the id of filing being withdrawn, it should always be a new filing
      // the filingID is 0
      this.filingToBeWithdrawn = +this.$route.query.filingToBeWithdrawn
      this.filingId = +this.$route.query.filingId // number or NaN

      // if required data isn't set, go back to dashboard
      if (isNaN(this.filingId) || isNaN(this.filingToBeWithdrawn)) {
        this.navigateToBusinessDashboard(this.getIdentifier)
      }
    }

    /** Called when component is mounted. */
    async mounted (): Promise<void> {
      // wait until entire view is rendered (including all child components)
      // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
      await this.$nextTick()

      // safety check, should never happen as NoW doesn't have draft filing
      if (this.filingId > 0) {
        this.navigateToBusinessDashboard(this.getIdentifier)
      }

      this.dataLoaded = true

      // Pre-populate the certified block with the logged in user's name unless they have proper permissions.
      if (!IsAuthorized(AuthorizedActions.BLANK_CERTIFY_STATE) && this.getUserInfo) {
        this.certifiedBy = this.getUserInfo.firstname + ' ' + this.getUserInfo.lastname
      }

      // always include NOW out code
      // use existing Priority and Waive Fees flags
      this.updateFilingData('add', FilingCodes.NOTICE_OF_WITHDRAWAL, this.staffPaymentData.isPriority,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    }

    /** Called just before this component is destroyed. */
    beforeDestroy (): void {
      // remove event handler
      window.onbeforeunload = null
    }

    /**
     * Called when user clicks Submit button
     * or when user retries from Save Error dialog
     */
    async onClickSubmit (): Promise<void> {
      // if there is an invalid component, scroll to it
      if (!this.isPageValid) {
        this.showErrors = true
        if (!this.certifyFormValid) {
          // Show error message of legal name text field if invalid
          this.$refs.certifyRef.$refs.certifyTextfieldRef.error = true
        }
        await this.validateAndScroll(this.validFlags, this.validComponents)
        return
      }

      // prevent double saving
      if (this.busySaving) return

      // prevent submit when POA is part of the filing and has taken effect
      if (this.hasTakenEffect) return

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

      const header: any = {
        header: {
          name: FilingTypes.NOTICE_OF_WITHDRAWAL,
          certifiedBy: this.certifiedBy || '',
          email: this.getBusinessEmail || undefined,
          date: this.getCurrentDate // NB: API will reassign this date according to its clock
        }
      }

      if (this.documentOptionalEmail !== '') {
        header.header.documentOptionalEmail = this.documentOptionalEmail
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
          foundingDate: this.dateToApi(this.getFoundingDate) || undefined,
          identifier: this.getIdentifier,
          legalName: this.getLegalName,
          legalType: this.getLegalType
        }
      }

      const data: any = {
        noticeOfWithdrawal: {
          filingId: this.filingToBeWithdrawn,
          partOfPoa: this.partOfPoa,
          hasTakenEffect: this.hasTakenEffect
        }
      }

      if (this.fileNumber !== '') {
        data.noticeOfWithdrawal.courtOrder = {
          fileNumber: this.fileNumber,
          effectOfOrder: (this.hasPlanOfArrangement ? EffectOfOrderTypes.PLAN_OF_ARRANGEMENT : '') as string
        }
      }
      // build filing
      const filing = Object.assign({}, header, business, data)
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
        'You have unsaved changes in your Notice of Withdrawal. Do you want to exit your filing?',
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
      if (this.saveErrorReason === SaveErrorReasons.FILE_PAY) {
        // close the dialog and retry file-pay
        this.saveErrorReason = null
        await this.onClickSubmit()
      }
    }

    /** Handles Okay events from Save Error dialog. */
    onSaveErrorDialogOkay (): void {
      if (this.saveErrorReason === SaveErrorReasons.FILE_PAY) {
        // close the dialog and finish file-pay process
        this.saveErrorReason = null
        this.onClickFilePayFinish()
      }
    }

    /** Array of valid components. Must match validFlags. */
    readonly validComponents = [
      'document-delivery-section',
      'certify-form-section',
      'court-order-section',
      'staff-payment-section'
    ]

    /** Object of valid flags. Must match validComponents. */
    get validFlags (): object {
      return {
        documentDelivery: this.documentDeliveryValid,
        certifyForm: this.certifyFormValid,
        courtOrder: this.courtOrderValid,
        staffPayment: this.staffPaymentValid
      }
    }

    @Watch('partOfPoa')
    @Watch('hasTakenEffect')
    @Watch('documentOptionalEmail')
    @Watch('certifiedBy')
    @Watch('isCertified')
    @Watch('fileNumber')
    @Watch('hasPlanOfArrangement')
    onHaveChanges (): void {
      this.haveChanges = true
    }

    @Watch('staffPaymentData')
    onStaffPaymentDataChanged (val: StaffPaymentIF): void {
      const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

      // add Waive Fees flag to all filing codes
      this.updateFilingData('add', FilingCodes.NOTICE_OF_WITHDRAWAL, val.isPriority, waiveFees)

      this.haveChanges = true
    }
}
</script>

  <style lang="scss" scoped>
  @import '@/assets/styles/theme.scss';

  #notice-of-withdrawal {
    /* Set "header-counter" to 0 */
    counter-reset: header-counter;
  }

  h2::before {
    /* Increment "header-counter" by 1 */
    counter-increment: header-counter;
    content: counter(header-counter) '. ';
  }

  article {
    .v-card {
      line-height: 1.2rem;
      font-size: $px-16;
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
  #withdrawal-buttons-container {
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

    #withdrawal-cancel-btn {
      margin-left: 0.5rem;
    }
  }

  // Fix font size and color to stay consistent.
  :deep() {
    .certify-clause, .certify-stmt, .grey-text {
      color: $gray7;
    }

    .invalid-certify {
      .certify-stmt, .title-label {
        color: $app-red;
      }
    }
    .invalid-foreign-jurisdiction {
      .title-label {
        color: $app-red;
      }
    }
  }
  </style>
