<template>
  <div id="agm-extension">
    <ConfirmDialog
      ref="confirm"
      attach="#agm-extension"
    />
    <AuthErrorDialog
      attach="#agm-extension"
      :dialog="authErrorDialog"
      :title="'Access Restricted'"
      :text="`You are not authorized to complete this action.`"
      @exit="goToDashboard(true)"
    />

    <PaymentErrorDialog
      attach="#agm-extension"
      filingName="AGM Extension"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="onPaymentErrorDialogExit()"
    />

    <NotEligibleExtensionDialog
      attach="#agm-extension"
      :dialog="notEligibleExtensionDialog"
      @okay="notEligibleExtensionDialog = false"
    />

    <!-- Main Body -->
    <v-container class="view-container">
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <article id="main-article">
            <!-- Page Title -->
            <h1>AGM Extension</h1>

            <ExpandableHelp helpLabel="Help with Annual General Meeting Extension">
              <template #content>
                <AgmExtensionHelp />
              </template>
            </ExpandableHelp>

            <header>
              <h2>Extension Detail</h2>
              <p class="grey-text">
                Enter the details about the extension request to evaluate the eligibility.
              </p>
            </header>

            <!-- About the Business -->
            <AboutTheBusiness
              class="mt-6"
              :data.sync="data"
            />

            <!-- Extension Request -->
            <ExtensionRequest
              class="mt-8"
              :data.sync="data"
              :showErrors="showErrors"
              @valid="extensionRequestValid=$event"
            />

            <!-- AGM Extension Evaluation -->
            <AgmExtensionEvaluation
              class="mt-8"
              :data.sync="data"
              :evaluateResult="extensionRequestValid"
            />

            <!-- Folio Number -->
            <section
              v-if="!IsAuthorized(AuthorizedActions.STAFF_PAYMENT)"
            >
              <header>
                <h2 id="folio-number-header">
                  Folio or Reference Number (Optional)
                </h2>
                <p>
                  This is meant for your own tracking purposes and will appear on your receipt.
                </p>
              </header>
              <div
                id="folio-number-section"
                :class="{ 'invalid-section': !folioNumberValid && showErrors }"
              >
                <TransactionalFolioNumber
                  :accountFolioNumber="getFolioNumber"
                  :transactionalFolioNumber="getTransactionalFolioNumber"
                  @update:transactionalFolioNumber="onTransactionalFolioNumberChange"
                  @valid="folioNumberValid = $event"
                />
              </div>
            </section>

            <!-- Certify -->
            <section class="mt-8">
              <header>
                <h2>Certify</h2>
                <p class="grey-text">
                  Enter the legal name of the person authorized to complete and submit this filing.
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
                  :message="certifyText(FilingCodes.AGM_EXTENSION)"
                  @valid="certifyFormValid=$event"
                />
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
              relative-element-selector="#main-article"
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
      id="buttons-container"
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
                id="file-pay-btn"
                color="primary"
                large
                :disabled="busySaving || !IsAuthorized(AuthorizedActions.FILE_AND_PAY)"
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

        <v-btn
          id="cancel-btn"
          class="ml-2"
          large
          :disabled="busySaving"
          @click="goToDashboard()"
        >
          <span>Cancel</span>
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { StatusCodes } from 'http-status-codes'
import { IsAuthorized, navigate } from '@/utils'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { ExpandableHelp } from '@bcrs-shared-components/expandable-help'
import { Certify, TransactionalFolioNumber } from '@/components/common'
import {
  AuthErrorDialog, ConfirmDialog, NotEligibleExtensionDialog, PaymentErrorDialog
} from '@/components/dialogs'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'
import AgmExtensionHelp from '@/components/AgmExtension/AgmExtensionHelp.vue'
import ExtensionRequest from '@/components/AgmExtension/ExtensionRequest.vue'
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { LegalServices } from '@/services/'
import { AuthorizedActions, SaveErrorReasons } from '@/enums'
import { FilingCodes, FilingTypes } from '@bcrs-shared-components/enums'
import { AgmExtEvalIF, ConfirmDialogType, EmptyAgmExtEval } from '@/interfaces'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({
  components: {
    AboutTheBusiness,
    AgmExtensionEvaluation,
    AgmExtensionHelp,
    AuthErrorDialog,
    Certify,
    ConfirmDialog,
    ExpandableHelp,
    ExtensionRequest,
    NotEligibleExtensionDialog,
    PaymentErrorDialog,
    SbcFeeSummary,
    TransactionalFolioNumber
  }
})
export default class AgmExtension extends Mixins(CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType,
    certifyRef: Certify
  }

  @Action(useRootStore) setTransactionalFolioNumber!: (x: string) => void

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useRootStore) getFolioNumber!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) getTransactionalFolioNumber!: string
  @Getter(useRootStore) getUserInfo!: any
  @Getter(useBusinessStore) isGoodStanding!: boolean
  @Getter(useFilingHistoryListStore) getTotalAgmExtensionDuration!: (year: number) => number;

  // enum for template
  readonly FilingCodes = FilingCodes
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  // evaluation object
  data = { ...EmptyAgmExtEval } as AgmExtEvalIF

  // variables for Certify component
  certifiedBy = ''
  isCertified = false
  certifyFormValid = false

  // variables for Extension Request section
  extensionRequestValid = false

  // variables for Folio Number section
  folioNumberValid = true

  // variables for displaying dialogs
  saveErrorReason: SaveErrorReasons = null
  paymentErrorDialog = false
  authErrorDialog = false

  // other variables
  totalFee = 0
  filingId = 0 // id of this agm extension filing
  savedFiling: any = null // filing during save
  showErrors = false // true when we press on File and Pay (trigger validation)
  filingPaying = false // true only when filing and paying
  haveChanges = false
  saveErrors = []
  saveWarnings = []
  notEligibleExtensionDialog = false

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** True if page is valid, else False. */
  get isPageValid (): boolean {
    return (this.extensionRequestValid && this.certifyFormValid && this.folioNumberValid)
  }

  /** True when filing and paying. */
  get busySaving (): boolean {
    return (this.filingPaying)
  }

  /** True if payment is required, else False. */
  get isPayRequired (): boolean {
    // FUTURE: modify rule here as needed
    return (this.totalFee > 0)
  }

  /** Called when component is created. */
  created (): void {
    if (!IsAuthorized(AuthorizedActions.AGM_EXTENSION_FILING)) {
      // user is not authorized to access AGM extensions, so route to dashboard
      this.authErrorDialog = true
      return
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

    // this is the id of THIS filing
    // it must be 0 (meaning new filing) -- we do not support resuming a draft filing
    // otherwise, go back to dashboard
    this.filingId = +this.$route.query.filingId // number or NaN
    if (this.filingId !== 0) {
      this.navigateToBusinessDashboard(this.getIdentifier)
    }
  }

  /** Called when component is mounted. */
  mounted (): void {
    this.data.currentDate = this.getCurrentDate
    this.data.isGoodStanding = this.isGoodStanding
    this.data.incorporationDate = this.getFoundingDate

    // Pre-populate the certified block with the logged in user's name (if no permission for blank certificate)
    if (!IsAuthorized(AuthorizedActions.BLANK_CERTIFY_STATE) && this.getUserInfo) {
      this.certifiedBy = this.getUserInfo.firstname + ' ' + this.getUserInfo.lastname
    }

    // always include agm extension code
    // (no Priority flag and no Waive Fees flag)
    this.updateFilingData('add', FilingCodes.AGM_EXTENSION, undefined, undefined)
  }

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // remove event handler
    window.onbeforeunload = null
  }

  onTransactionalFolioNumberChange (newFolioNumber: string): void {
    this.setTransactionalFolioNumber(newFolioNumber)
  }

  /**
   * Called when user clicks File and Pay button
   * or when user retries from Save Error dialog.
   */
  async onClickFilePay (): Promise<void> {
    // if there is an invalid component, scroll to it
    if (!this.isPageValid) {
      this.showErrors = true
      //
      // FUTURE: check for section errors here
      //
      if (!this.extensionRequestValid) {
        // nothing to do here -- "showErrors" will do it all
      }
      if (!this.certifyFormValid) {
        // Show error message of legal name text field if invalid
        this.$refs.certifyRef.$refs.certifyTextfieldRef.error = true
      }
      await this.validateAndScroll(this.validFlags, this.validComponents)
      return
    }

    // if not eligible, display dialog
    if (!this.data.isEligible) {
      this.notEligibleExtensionDialog = true
      return
    }

    // prevent double saving
    if (this.busySaving) return

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
        navigate(payUrl)
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
      const hasPendingTasks = await LegalServices.hasPendingTasks(this.getIdentifier)
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
        name: FilingTypes.AGM_EXTENSION,
        certifiedBy: this.certifiedBy || '',
        date: this.getCurrentDate, // NB: API will reassign this date according to its clock
        folioNumber: this.getTransactionalFolioNumber || this.getFolioNumber || ''
      }
    }

    const business: any = {
      business: {
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.getLegalName,
        legalType: this.getLegalType
      }
    }

    const data: any = {
      [FilingTypes.AGM_EXTENSION]: {
        // convert local properties into API/schema properties
        year: this.data.agmYear,
        isFirstAgm: this.data.isFirstAgm,
        extReqForAgmYear: this.data.isPrevExtension,
        totalApprovedExt: this.getTotalAgmExtensionDuration(Number(this.data.agmYear)) + this.data.extensionDuration,
        expireDateApprovedExt: this.data.agmDueDate,
        // conditionally add properties if not null
        ...(this.data.prevAgmDate && { prevAgmRefDate: this.data.prevAgmDate }),
        ...(this.data.prevExpiryDate && {
          expireDateCurrExt: this.data.prevExpiryDate
        }),
        // add in remaining local properties for future auditing
        ...this.data
      }
    }

    // build filing
    const filing = Object.assign({}, header, business, data)
    try {
      let ret
      if (this.filingId > 0) {
        // we have a filing id, so update an existing filing
        ret = await LegalServices.updateFiling(this.getIdentifier, filing, this.filingId, isDraft)
      } else {
        // filing id is 0, so create a new filing
        ret = await LegalServices.createFiling(this.getIdentifier, filing, isDraft)
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
      'You have unsaved changes in your AGM Extension. Do you want to exit your filing?',
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

  /** Array of valid components. Must match validFlags. */
  readonly validComponents = [
    'extension-request',
    'certify-form-section',
    'folio-number-section'
  ]

  /** Object of valid flags. Must match validComponents. */
  get validFlags (): object {
    return {
      extensionEligibility: this.extensionRequestValid,
      certifyForm: this.certifyFormValid,
      folioNumber: this.folioNumberValid
    }
  }

  /** Watches all data properties to keep track of changes. */
  @Watch('data.isFirstAgm')
  @Watch('data.agmYear')
  @Watch('data.prevAgmDate')
  @Watch('data.isPrevExtension')
  @Watch('data.prevExpiryDate')
  private onHaveChanges (): void {
    this.haveChanges = true
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#agm-extension {
  /* Set "header-counter" to 0 */
  counter-reset: header-counter;
}

h2::before {
  /* Increment "header-counter" by 1 */
  counter-increment: header-counter;
  content: counter(header-counter) '. ';
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
#buttons-container {
  padding-top: 2rem;
  border-top: 1px solid $gray5;

  .buttons-right {
    margin-left: auto;
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
}
</style>
