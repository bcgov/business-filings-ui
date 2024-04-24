<template>
  <div id="continuation-out">
    <ConfirmDialog
      ref="confirm"
      attach="#continuation-out"
    />

    <ResumeErrorDialog
      attach="#continuation-out"
      :dialog="resumeErrorDialog"
      @exit="goToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#continuation-out"
      filingName="Continuation Out"
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
      id="continue-out-container"
      class="view-container"
    >
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <article id="continue-out-article">
            <!-- Page Title -->
            <header>
              <h1 id="continue-out-header">
                Continuation Out
              </h1>
            </header>

            <!-- Ledger Detail -->
            <section v-if="isRoleStaff">
              <header>
                <h2>Ledger Detail</h2>
                <p class="grey-text">
                  Enter a detail that will appear on the ledger for this entity.
                </p>
              </header>
              <div
                id="detail-comment-section"
                :class="{ 'invalid-section': !detailCommentValid && showErrors }"
              >
                <v-card
                  flat
                  class="py-8 px-5"
                >
                  <v-row no-gutters>
                    <v-col
                      cols="12"
                      sm="3"
                      class="pr-4"
                    >
                      <strong :class="{ 'app-red': !detailCommentValid && showErrors }">Detail</strong>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="9"
                    >
                      <p class="grey-text font-weight-bold">
                        {{ defaultComment }}
                      </p>
                      <DetailComment
                        ref="detailCommentRef"
                        v-model="detailComment"
                        placeholder="Add a Detail that will appear on the ledger for this entity."
                        :maxLength="maxDetailCommentLength"
                        :isRoleStaff="isRoleStaff"
                        :isContinuationOutDetailComment="true"
                        @valid="detailCommentValid=$event"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </section>

            <!-- Effective Date of Continuation -->
            <section>
              <header>
                <h2>Effective Date of Continuation</h2>
              </header>
              <div
                id="effective-date-section"
                :class="{ 'invalid-section': !effectiveDateValid && showErrors }"
              >
                <EffectiveDate
                  ref="effectiveDateRef"
                  :class="{ 'invalid-component': !effectiveDateValid && showErrors }"
                  class="pt-6 px-4"
                  :initialEffectiveDate="initialEffectiveDate"
                  :validateForm="showErrors"
                  @update:effectiveDate="effectiveDate=$event"
                  @valid="effectiveDateValid=$event"
                />
              </div>
            </section>

            <!-- Jurisdiction Information -->
            <section>
              <header>
                <h2>Jurisdiction Information</h2>
              </header>
              <div
                id="jurisdiction-information-section"
                :class="{ 'invalid-section': !foreignJurisdictionValid && showErrors }"
              >
                <ForeignJurisdiction
                  ref="foreignJurisdictionRef"
                  :class="{ 'invalid-component': !foreignJurisdictionValid && showErrors }"
                  class="pt-6 px-4"
                  :draftCountry="initialCountry"
                  :draftRegion="initialRegion"
                  :validateForm="showErrors"
                  @update:country="selectedCountry=$event"
                  @update:region="selectedRegion=$event"
                  @valid="foreignJurisdictionValid=$event"
                />
              </div>
            </section>

            <!-- Business Information -->
            <section>
              <header>
                <h2>Business Information</h2>
              </header>
              <div
                id="business-information-section"
                :class="{ 'invalid-section': !businessNameValid && showErrors }"
              >
                <BusinessNameForeign
                  ref="businessNameForeignRef"
                  :class="{ 'invalid-component': !businessNameValid && showErrors }"
                  class="pt-6 px-4"
                  :draftBusinessName="initialBusinessName"
                  :validateForm="showErrors"
                  @update:businessName="businessName=$event"
                  @valid="businessNameValid=$event"
                />
              </div>
            </section>

            <!-- Documents Delivery -->
            <section>
              <header>
                <h2>Documents Delivery</h2>
                <p class="grey-text">
                  Copies of the continue out documents will be sent to the email addresses listed below.
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
                    :editableCompletingParty="isRoleStaff"
                    :contactValue="getBusinessEmail"
                    contactLabel="Business Office"
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
                  :class="{ 'invalid-component': !certifyFormValid && showErrors }"
                  :entityDisplay="displayName()"
                  :message="certifyText(FilingCodes.CONTINUATION_OUT)"
                  @valid="certifyFormValid=$event"
                />
              </div>
            </section>

            <!-- Court Order and Plan of Arrangement -->
            <section>
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
                    :draftCourtOrderNumber="fileNumber"
                    :hasDraftPlanOfArrangement="hasPlanOfArrangement"
                    @emitCourtNumber="fileNumber=$event"
                    @emitPoa="hasPlanOfArrangement=$event"
                    @emitValid="courtOrderValid=$event"
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
              relative-element-selector="#continue-out-article"
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
      id="continue-out-buttons-container"
      class="list-item"
    >
      <div class="buttons-left">
        <v-btn
          id="continue-out-save-btn"
          large
          :disabled="busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn
          id="continue-out-save-resume-btn"
          large
          :disabled="busySaving"
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
                id="continue-out-file-pay-btn"
                color="primary"
                large
                :disabled="busySaving"
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
          id="continue-out-cancel-btn"
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
import { Getter } from 'pinia-class'
import { StatusCodes } from 'http-status-codes'
import { navigate } from '@/utils'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { BusinessNameForeign, Certify, DetailComment, EffectiveDate, ForeignJurisdiction } from '@/components/common'
import { ConfirmDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'
import { CommonMixin, DateMixin, EnumMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { EnumUtilities, LegalServices } from '@/services/'
import { EffectOfOrderTypes, FilingStatus, Routes, SaveErrorReasons } from '@/enums'
import { FilingCodes, FilingTypes } from '@bcrs-shared-components/enums'
import { ConfirmDialogType } from '@/interfaces'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

@Component({
  components: {
    BusinessNameForeign,
    Certify,
    ConfirmDialog,
    CourtOrderPoa,
    DetailComment,
    DocumentDelivery,
    EffectiveDate,
    ForeignJurisdiction,
    ResumeErrorDialog,
    SaveErrorDialog,
    SbcFeeSummary
  }
})
export default class ContinuationOut extends Mixins(CommonMixin, DateMixin,
  EnumMixin, FilingMixin, ResourceLookupMixin) {
  // Refs
  $refs!: {
    businessNameForeignRef: BusinessNameForeign,
    confirm: ConfirmDialogType,
    certifyRef: Certify,
    detailCommentRef: DetailComment,
    effectiveDateRef: EffectiveDate,
    foreignJurisdictionRef: ForeignJurisdiction,
  }

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useRootStore) getBusinessEmail!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) isRoleStaff!: boolean

  // enum for template
  readonly FilingCodes = FilingCodes

  // variables for DetailComment component
  detailComment = null
  detailCommentValid = false

  // variables for EffectiveDate component
  initialEffectiveDate = ''
  effectiveDate = ''
  effectiveDateValid = false

  // variables for ForeignJurisdiction component
  initialCountry = ''
  initialRegion = ''
  selectedCountry = ''
  selectedRegion = ''
  foreignJurisdictionValid = false

  // variables for BusinessNameForeign component
  initialBusinessName = ''
  businessName = ''
  businessNameValid = false

  // variables for Certify component
  certifiedBy = ''
  isCertified = false
  certifyFormValid = false

  // variables for Courder Order POA component
  fileNumber = ''
  hasPlanOfArrangement = false
  courtOrderValid = true

  // variables for Document Delivery component
  documentDeliveryValid = true
  documentOptionalEmail = ''

  // variables for displaying dialogs
  resumeErrorDialog = false
  saveErrorReason: SaveErrorReasons = null

  // other variables
  totalFee = 0
  dataLoaded = false
  loadingMessage = ''
  filingId = 0 // id of this Continuation Out filing
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
    return (!this.dataLoaded && !this.saveErrorReason)
  }

  /** Default comment (ie, the first line of the detail comment). */
  get defaultComment (): string {
    return 'Continuation Out'
  }

  /** Maximum length of detail comment. */
  get maxDetailCommentLength (): number {
    // = (max size in db) - (default comment length) - (Carriage Return)
    return 2000 - this.defaultComment.length - 1
  }

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** True if page is valid, else False. */
  get isPageValid (): boolean {
    return (this.detailCommentValid && this.effectiveDateValid &&
      this.foreignJurisdictionValid && this.businessNameValid &&
      this.documentDeliveryValid && this.courtOrderValid &&
      this.certifyFormValid)
  }

  /** True when saving, saving and resuming, or filing and paying. */
  get busySaving (): boolean {
    return (this.saving || this.savingResuming || this.filingPaying)
  }

  /** True if payment is required, else False. */
  get isPayRequired (): boolean {
    // FUTURE: modify rule here as needed
    return (this.totalFee > 0)
  }

  /** Called when component is created. */
  created (): void {
    // Safety check to make sure Staff is filing the Continuation Out.
    if (!this.isRoleStaff) {
      this.resumeErrorDialog = true
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

    // this is the id of THIS filing
    // if 0, this is a new filing
    // otherwise it's a draft filing
    this.filingId = +this.$route.params.filingId // number or NaN

    // if required data isn't set, go back to dashboard
    if (!this.getIdentifier || isNaN(this.filingId)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    await this.$nextTick()

    if (this.filingId > 0) {
      this.loadingMessage = 'Resuming Your Continuation Out'
    } else {
      this.loadingMessage = 'Preparing Your Continuation Out'
      this.initialBusinessName = this.getLegalName
    }

    // fetch draft (which may overwrite some properties)
    if (this.filingId > 0) {
      await this.fetchDraftFiling()
    }

    this.dataLoaded = true

    // always include continue out code
    // clear Priority flag and set the Waive Fees flag to true
    this.updateFilingData('add', FilingCodes.CONTINUATION_OUT, undefined, true)
  }

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // remove event handler
    window.onbeforeunload = null
  }

  /** Fetches the draft continuation out filing. */
  async fetchDraftFiling (): Promise<void> {
    const url = `businesses/${this.getIdentifier}/filings/${this.filingId}`
    await LegalServices.fetchFiling(url).then(filing => {
      // verify data
      if (!filing) throw new Error('Missing filing')
      if (!filing.header) throw new Error('Missing header')
      if (!filing.business) throw new Error('Missing business')
      if (!filing.continuationOut) throw new Error('Missing continuation out object')
      if (filing.header.name !== FilingTypes.CONTINUATION_OUT) throw new Error('Invalid filing type')
      if (filing.header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
      if (filing.business.identifier !== this.getIdentifier) throw new Error('Invalid business identifier')
      if (filing.business.legalName !== this.getLegalName) throw new Error('Invalid business legal name')

      // load Certified By (but not Date)
      this.certifiedBy = filing.header.certifiedBy

      // load Detail Comment, removing the first line (default comment)
      const comment: string = filing.continuationOut.details || ''
      this.detailComment = comment.split('\n').slice(1).join('\n')

      const courtOrder = filing.continuationOut.courtOrder
      if (courtOrder) {
        this.fileNumber = courtOrder.fileNumber
        this.hasPlanOfArrangement = EnumUtilities.isEffectOfOrderPlanOfArrangement(courtOrder.effectOfOrder)
      }

      const continuationOutDate = filing.continuationOut.continuationOutDate
      if (continuationOutDate) {
        this.initialEffectiveDate = continuationOutDate
      }

      const foreignJurisdiction = filing.continuationOut.foreignJurisdiction
      if (foreignJurisdiction) {
        this.initialCountry = foreignJurisdiction.country
        if (foreignJurisdiction.region) {
          this.initialRegion = foreignJurisdiction.region
        }
      }

      const legalName = filing.continuationOut.legalName
      if (legalName) {
        this.initialBusinessName = legalName
      }

      if (filing.header.documentOptionalEmail) {
        this.documentOptionalEmail = filing.header.documentOptionalEmail
      }
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchDraftFiling() error =', error)
      this.resumeErrorDialog = true
    })
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onClickFilePay (staffPayment = false): Promise<void> {
    // if there is an invalid component, scroll to it
    if (!this.isPageValid) {
      this.showErrors = true

      // Show error messages of components if invalid
      if (!this.detailCommentValid) {
        this.$refs.detailCommentRef.$refs.textarea.error = true
      }
      if (!this.certifyFormValid) {
        this.$refs.certifyRef.$refs.certifyTextfieldRef.error = true
      }

      await this.validateAndScroll(this.validFlags, this.validComponents)
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
    if (!this.saveErrorReason) this.onClickFilePayFinish()

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
        this.$router.push({ name: Routes.DASHBOARD, query: { filing_id: this.filingId.toString() } })
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
        name: FilingTypes.CONTINUATION_OUT,
        certifiedBy: this.certifiedBy || '',
        email: this.getBusinessEmail || '',
        date: this.getCurrentDate // NB: API will reassign this date according to its clock
      }
    }

    if (this.documentOptionalEmail !== '') {
      header.header.documentOptionalEmail = this.documentOptionalEmail
    }

    header.header['waiveFees'] = true

    const business: any = {
      business: {
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.getLegalName,
        legalType: this.getLegalType
      }
    }

    const data: any = {
      [FilingTypes.CONTINUATION_OUT]: {
        details: `${this.defaultComment}\n${this.detailComment}`,
        continuationOutDate: this.effectiveDate,
        foreignJurisdiction: {
          country: this.selectedCountry,
          region: this.selectedRegion
        },
        legalName: this.businessName
      }
    }

    if (this.fileNumber !== '') {
      data[FilingTypes.CONTINUATION_OUT].courtOrder = {
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
      this.$router.push({ name: Routes.DASHBOARD })
        .catch(() => {}) // ignore error in case navigation was aborted
      return
    }

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Unsaved Changes',
      'You have unsaved changes in your Continue Out. Do you want to exit your filing?',
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
      this.$router.push({ name: Routes.DASHBOARD })
        .catch(() => {}) // ignore error in case navigation was aborted
    })
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
        if (this.isRoleStaff) await this.onClickFilePay(true)
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

  /** Array of valid components. Must match validFlags. */
  readonly validComponents = [
    'detail-comment-section',
    'effective-date-section',
    'jurisdiction-information-section',
    'business-information-section',
    'document-delivery-section',
    'certify-form-section',
    'court-order-section'
  ]

  /** Object of valid flags. Must match validComponents. */
  get validFlags (): object {
    return {
      detailComment: this.detailCommentValid,
      effectiveDate: this.effectiveDateValid,
      foreignJurisdiction: this.foreignJurisdictionValid,
      businessInformation: this.businessNameValid,
      documentDelivery: this.documentDeliveryValid,
      certifyForm: this.certifyFormValid,
      courtOrder: this.courtOrderValid
    }
  }

  @Watch('certifyFormValid')
  @Watch('courtOrderValid')
  @Watch('detailCommentValid')
  @Watch('documentDeliveryValid')
  onHaveChanges (): void {
    this.haveChanges = true
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#continuation-out {
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
#continue-out-buttons-container {
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
}

// Fix font size and color to stay consistent.
:deep() {
  #document-delivery, #court-order-label, #poa-label {
    font-size: $px-14;
  }

  .certify-clause, .certify-stmt, .grey-text {
    color: $gray7;
  }

  .invalid-component {
    .certify-stmt, .title-label {
      color: $app-red;
    }
  }
}
</style>
