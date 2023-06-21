<template>
  <div id="annual-report">
    <ConfirmDialog
      ref="confirm"
      attach="#annual-report"
    />

    <FetchErrorDialog
      attach="#annual-report"
      :dialog="fetchErrorDialog"
      @exit="goToDashboard(true)"
    />

    <PaymentErrorDialog
      attach="#annual-report"
      filingName="Annual Report"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="onPaymentErrorDialogExit()"
    />

    <ResumeErrorDialog
      attach="#annual-report"
      :dialog="resumeErrorDialog"
      @exit="goToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#annual-report"
      filingName="Annual Report"
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
      attach="#annual-report"
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

    <!-- Main Body -->
    <v-container
      id="annual-report-container"
      class="view-container"
    >
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <section id="annual-report-main-section">
            <!-- COOPs only: -->
            <article
              v-if="isCoop"
              class="annual-report-article"
            >
              <!-- Page Title -->
              <header>
                <h1 id="annual-report-header">
                  File {{ ARFilingYear }} Annual Report
                  <span
                    v-if="getReportState"
                    class="font-italic"
                  > &mdash; {{ getReportState }}</span>
                </h1>
                <p>
                  Select your Annual General Meeting date, then verify or change your Office Addresses
                  and Directors
                </p>
              </header>

              <!-- Annual General Meeting Date -->
              <section>
                <header>
                  <h2 id="agm-date-header">
                    1. Annual General Meeting Date
                  </h2>
                  <p>Select your Annual General Meeting (AGM) date</p>
                </header>
                <AgmDate
                  :newAgmDate="newAgmDate"
                  :newAgmExtension="newAgmExtension"
                  :newNoAgm="newNoAgm"
                  :allowCoa="allowChange('coa')"
                  :allowCod="allowChange('cod')"
                  @agmDate="onAgmDateChange($event)"
                  @agmExtension="onAgmExtensionChange($event)"
                  @noAgm="onNoAgmChange($event)"
                  @valid="onAgmDateValidChange($event)"
                />
              </section>

              <!-- Registered Office Addresses -->
              <section v-show="agmDateValid">
                <header>
                  <h2 id="addresses-header">
                    2. Registered Office Addresses
                    <span
                      v-if="agmDate"
                      class="as-of-date"
                    >(as of {{ ARFilingYear }} Annual General Meeting)</span>
                    <span
                      v-else
                      class="as-of-date"
                    >(as of {{ asOfDate }})</span>
                  </h2>
                  <p>Verify or change your Registered Office Addresses</p>
                </header>
                <OfficeAddresses
                  ref="officeAddressesComponent"
                  :addresses.sync="updatedAddresses"
                  :componentEnabled="allowChange('coa')"
                  @original="originalAddresses=$event"
                  @modified="officeModifiedEventHandler($event)"
                  @valid="addressesFormValid=$event"
                />
              </section>

              <!-- Directors -->
              <section v-show="agmDateValid">
                <header>
                  <h2 id="directors-header">
                    3. Directors
                  </h2>
                  <p v-if="allowChange('cod')">
                    Tell us who was elected or appointed and who ceased to be
                    a director at your {{ ARFilingYear }} AGM
                  </p>
                  <p v-else>
                    This is your list of directors active as of {{ asOfDate }}, including
                    directors that were ceased at a later date
                  </p>
                </header>
                <Directors
                  ref="directorsComponent"
                  :directors.sync="updatedDirectors"
                  :componentEnabled="allowChange('cod')"
                  @original="originalDirectors=$event"
                  @directorsPaidChange="directorsPaidChange"
                  @directorsFreeChange="directorsFreeChange"
                  @directorFormValid="directorFormValid=$event"
                  @directorEditAction="directorEditInProgress=$event"
                />
              </section>
            </article>

            <!-- BEN/BC/CCC/ULC only: -->
            <article
              v-else-if="isBenBcCccUlc"
              class="annual-report-article"
            >
              <!-- Page Title -->
              <header>
                <h1 id="annual-report-header-BC">
                  File {{ ARFilingYear }} Annual Report
                  <span
                    v-if="getReportState"
                    style="font-style: italic"
                  > &mdash; {{ getReportState }}</span>
                </h1>
                <p>Please review all the information before you file and pay</p>
              </header>

              <!-- these components are needed for fetching original office addresses and directors -->
              <!-- but don't show them -->
              <div class="d-none">
                <OfficeAddresses
                  ref="officeAddressesComponent"
                  @original="originalAddresses=$event"
                />
                <Directors
                  ref="directorsComponent"
                  @original="originalDirectors=$event"
                />
              </div>

              <!-- Business Details -->
              <section>
                <header>
                  <h2 id="business-details-header">
                    1. Business Details
                  </h2>
                </header>
                <ArDate />
                <br>
                <SummaryOfficeAddresses
                  :registeredAddress="originalAddresses.registeredOffice"
                  :recordsAddress="originalAddresses.recordsOffice"
                />
              </section>

              <!-- Directors -->
              <section>
                <header>
                  <h2 id="directors-header-BC">
                    2. Directors
                  </h2>
                </header>
                <SummaryDirectors
                  :directors="originalDirectors"
                />
              </section>
            </article>

            <!-- Certify -->
            <section v-show="isBenBcCccUlc || agmDateValid">
              <header>
                <h2
                  v-if="isCoop"
                  id="certify-header"
                >
                  4. Certify
                </h2>
                <h2
                  v-else-if="isBenBcCccUlc"
                  id="certify-header"
                >
                  3. Certify
                </h2>
                <p>Enter the legal name of the person authorized to complete and submit this Annual Report</p>
              </header>
              <Certify
                :isCertified.sync="isCertified"
                :certifiedBy.sync="certifiedBy"
                :entityDisplay="displayName()"
                :message="certifyMessage"
                @valid="certifyFormValid=$event"
              />
            </section>
          </section>
        </v-col>

        <v-col
          cols="12"
          lg="3"
          style="position: relative"
        >
          <aside>
            <affix
              relative-element-selector="#annual-report-main-section"
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

    <!-- Buttons ( COOP only ) -->
    <v-container
      v-if="isCoop"
      id="coop-buttons-container"
      class="list-item"
    >
      <div class="buttons-left">
        <v-btn
          v-if="isCurrentFilingEditable"
          id="ar-save-btn"
          large
          :disabled="busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn
          v-if="isCurrentFilingEditable"
          id="ar-save-resume-btn"
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
          color="#3b6cff"
          content-class="top-tooltip"
        >
          <template #activator="{ on }">
            <div
              class="d-inline"
              v-on="on"
            >
              <v-btn
                v-if="isCurrentFilingEditable"
                id="ar-file-pay-btn"
                color="primary"
                large
                :disabled="!isPageValid || busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                {{ isPayRequired ? "File and Pay" : "File Now (no fee)" }}
              </v-btn>
            </div>
          </template>
          Ensure all of your information is entered correctly before you File.<br>
          There is no opportunity to change information beyond this point.
        </v-tooltip>

        <v-btn
          id="ar-cancel-btn"
          large
          :disabled="busySaving"
          @click="goToDashboard()"
        >
          <span>Cancel</span>
        </v-btn>
      </div>
    </v-container>

    <!-- Buttons ( BEN/BC/CCC/ULC only ) -->
    <v-container
      v-else-if="isBenBcCccUlc"
      id="bcorp-buttons-container"
      class="list-item"
    >
      <div class="buttons-left" />

      <div class="buttons-right">
        <v-tooltip
          top
          color="#3b6cff"
          content-class="top-tooltip"
        >
          <template #activator="{ on }">
            <div
              class="d-inline"
              v-on="on"
            >
              <v-btn
                id="ar-file-pay-bc-btn"
                color="primary"
                large
                :disabled="!isPageValid || busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                File and Pay
              </v-btn>
            </div>
          </template>
          Ensure all of your information is entered correctly before you File.<br>
          There is no opportunity to change information beyond this point.
        </v-tooltip>

        <v-btn
          id="ar-cancel-btn"
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
import { isEmpty } from 'lodash'
import { navigate } from '@/utils'
import AgmDate from '@/components/AnnualReport/AGMDate.vue'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, OfficeAddresses, SummaryDirectors, SummaryOfficeAddresses } from '@/components/common'
import { ConfirmDialog, FetchErrorDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog,
  StaffPaymentDialog } from '@/components/dialogs'
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { LegalServices } from '@/services/'
import { FilingCodes, FilingStatus, FilingTypes, Routes, SaveErrorReasons, StaffPaymentOptions }
  from '@/enums'
import { ConfirmDialogType, StaffPaymentIF } from '@/interfaces'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

@Component({
  components: {
    AgmDate,
    ArDate,
    Certify,
    ConfirmDialog,
    Directors,
    FetchErrorDialog,
    OfficeAddresses,
    PaymentErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog,
    SbcFeeSummary,
    StaffPaymentDialog,
    SummaryDirectors,
    SummaryOfficeAddresses
  }
})
export default class AnnualReport extends Mixins(CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType,
    directorsComponent: Directors,
    officeAddressesComponent: OfficeAddresses
  }

  // FUTURE: change these to getters
  @Getter(useRootStore) ARFilingYear!: number
  @Getter(useRootStore) arMinDate!: string
  @Getter(useRootStore) arMaxDate!: string
  @Getter(useRootStore) nextARDate!: string
  @Getter(useRootStore) getCurrentYear!: number
  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useBusinessStore) getLastAddressChangeDate!: string
  @Getter(useBusinessStore) getLastAnnualReportDate!: string
  @Getter(useBusinessStore) getLastDirectorChangeDate!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) getReportState!: string
  @Getter(useBusinessStore) isCoop!: boolean
  @Getter(useRootStore) isCurrentFilingEditable!: boolean
  @Getter(useRootStore) isRoleStaff!: boolean

  // variables for AgmDate component
  newAgmDate = null // for resuming draft
  newAgmExtension = null // for resuming draft
  newNoAgm = null // for resuming draft
  agmDate = null
  agmExtension = null
  noAgm = null
  agmDateValid = false

  // variables for OfficeAddresses component
  originalAddresses: any = { registeredOffice: {}, recordsOffice: {} }
  updatedAddresses: any = { registeredOffice: {}, recordsOffice: {} }
  addressesFormValid: boolean = null

  // variables for Directors component
  originalDirectors = []
  updatedDirectors = []
  directorFormValid = true
  directorEditInProgress = false

  // variables for Certify component
  certifiedBy = ''
  isCertified = false
  certifyFormValid = null

  // variables for staff payment
  staffPaymentData = { option: StaffPaymentOptions.NONE } as StaffPaymentIF
  staffPaymentDialog = false

  // variables for displaying dialogs
  fetchErrorDialog = false
  resumeErrorDialog = false
  saveErrorReason: SaveErrorReasons = null
  paymentErrorDialog = false

  // other variables
  totalFee = 0
  filingId: number = null
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

  /** True if loading container should be shown, else False. */
  get showLoadingContainer (): boolean {
    // show loading container when data isn't yet loaded and when
    // no dialogs are displayed (otherwise dialogs may be hidden)
    return (!this.dataLoaded && !this.fetchErrorDialog && !this.resumeErrorDialog &&
      !this.saveErrorReason && !this.paymentErrorDialog)
  }

  /**
   * The As Of date, used to query data, as Effective Date, and as Annual Report Date.
   * (Depends on whether entity is a Coop or BComp.)
   * @returns date as "YYYY-MM-DD"
   */
  get asOfDate (): string {
    if (this.isCoop) {
      // if AGM Date is set then use it
      if (this.agmDate) return this.agmDate
      // if filing is in past year then use last day in that year
      if (this.ARFilingYear < this.getCurrentYear) return `${this.ARFilingYear}-12-31`
    }
    if (this.isBenBcCccUlc) {
      return this.nextARDate
    }
    // should never get here
    return this.getCurrentDate
  }

  get certifyMessage (): string {
    if (this.isBenBcCccUlc) {
      return this.certifyText(FilingCodes.ANNUAL_REPORT_BC)
    }
    return this.certifyText(FilingCodes.ANNUAL_REPORT_OT)
  }

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** True if page is valid, else False. */
  get isPageValid (): boolean {
    if (this.isCoop) {
      return (this.agmDateValid && this.addressesFormValid && this.directorFormValid &&
        this.certifyFormValid && !this.directorEditInProgress)
    }
    return this.certifyFormValid
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
    this.filingId = +this.$route.params.filingId
  }

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // if tombstone data isn't set, go to dashboard
    if (!this.getIdentifier || !this.ARFilingYear || isNaN(this.filingId)) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing Entity Inc No, AR Filing Year, or Filing ID!')
      this.goToDashboard(true)
      return // don't continue
    }
    if (this.isCoop && (!this.arMinDate || !this.arMaxDate)) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing AR Min Date or AR Max Date!')
      this.goToDashboard(true)
      return // don't continue
    }
    if (this.isBenBcCccUlc && !this.nextARDate) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing Next AR Date!')
      this.goToDashboard(true)
      return // don't continue
    }

    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    await this.$nextTick()

    if (this.filingId > 0) {
      // resume draft filing
      this.loadingMessage = `Resuming Your ${this.ARFilingYear} Annual Report`
      await this.fetchDraftFiling()
      // fetch original office addresses and directors
      // update working data only if it wasn't in the draft
      if (!this.isJestRunning) {
        const isEmptyAddresses =
          (isEmpty(this.updatedAddresses.recordsOffice) && isEmpty(this.updatedAddresses.registeredOffice))
        await this.$refs.officeAddressesComponent.getOrigAddresses(this.asOfDate, isEmptyAddresses)
        await this.$refs.directorsComponent.getOrigDirectors(this.asOfDate, isEmpty(this.updatedDirectors))
      }
    } else {
      // this is a new filing
      this.loadingMessage = `Preparing Your ${this.ARFilingYear} Annual Report`
      // fetch original office addresses and directors + update working data
      if (!this.isJestRunning) {
        await this.$refs.officeAddressesComponent.getOrigAddresses(this.asOfDate, true)
        await this.$refs.directorsComponent.getOrigDirectors(this.asOfDate, true)
      }
    }

    this.dataLoaded = true

    // for BComp, add AR filing code now
    // for Coop, code is added when AGM Date becomes valid
    // use existing Priority and Waive Fees flags
    if (this.isBenBcCccUlc) {
      this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_BC, this.staffPaymentData.isPriority,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    }
  }

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // stop listening for custom events
    this.$root.$off('fetch-error-event')
  }

  async fetchDraftFiling (): Promise<void> {
    const url = `businesses/${this.getIdentifier}/filings/${this.filingId}`
    await LegalServices.fetchFiling(url).then(filing => {
      // verify data
      if (!filing) throw new Error('Missing filing')

      const header = filing.header
      if (!header) throw new Error('Missing header')

      const business = filing.business
      if (!business) throw new Error('Missing business')

      const annualReport = filing.annualReport
      if (!annualReport) throw new Error('Missing annual report')

      if (header.name !== FilingTypes.ANNUAL_REPORT) throw new Error('Invalid filing type')
      if (header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
      if (business.identifier !== this.getIdentifier) throw new Error('Invalid business identifier')
      if (business.legalName !== this.getLegalName) throw new Error('Invalid business legal name')

      // restore Certified By (but not Date)
      this.certifiedBy = header.certifiedBy

      // restore Staff Payment data
      if (header.routingSlipNumber) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.FAS,
          routingSlipNumber: header.routingSlipNumber,
          isPriority: header.priority
        } as StaffPaymentIF
      } else if (header.bcolAccountNumber) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.BCOL,
          bcolAccountNumber: header.bcolAccountNumber,
          datNumber: header.datNumber,
          folioNumber: header.folioNumber,
          isPriority: header.priority
        } as StaffPaymentIF
      } else if (header.waiveFees) {
        this.staffPaymentData = {
          option: StaffPaymentOptions.NO_FEE
        } as StaffPaymentIF
      } else {
        this.staffPaymentData = {
          option: StaffPaymentOptions.NONE
        } as StaffPaymentIF
      }

      // NB: ARFilingYear, arMaxDate and arMinDate were set in the store by the TodoList component

      // restore AGM Date
      if (this.isCoop) {
        // set the new AGM date in the AGM Date component (may be null or empty)
        this.newAgmDate = annualReport.annualGeneralMeetingDate || ''
        // set the new No AGM flag in the AGM Date component (may be undefined)
        this.newNoAgm = annualReport.didNotHoldAgm || false
      } else {
        // otherwise asOfDate will be calculated some other way (see getter)
      }

      // restore AGM Extension flag
      this.newAgmExtension = annualReport.agmExtension || false

      // restore Change of Directors data (if it was saved)
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

      // restore Change of Address data (if it was saved)
      const changeOfAddress = filing.changeOfAddress
      if (changeOfAddress) {
        // registered office is required
        // records office is required for BCOMP only
        const registeredOffice = changeOfAddress.offices?.registeredOffice
        const recordsOffice = changeOfAddress.offices?.recordsOffice
        if (this.isBenBcCccUlc && registeredOffice && recordsOffice) {
          this.updatedAddresses = { registeredOffice, recordsOffice }
        } else if (!this.isBenBcCccUlc && registeredOffice) {
          this.updatedAddresses = { registeredOffice }
        } else {
          throw new Error('Invalid change of address object')
        }

        // update filing data
        // always set Priority flag to false
        // use existing Waive Fees flag
        this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, false,
          (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
      } else {
        // changeOfAddress is optional
        // leave existing office addresses intact
      }
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.log('fetchDraftFiling() error =', error)
      this.resumeErrorDialog = true
    })
  }

  /**
   * Callback method for the "modified" event from OfficeAddress.
   * @param modified a boolean indicating whether or not the office address(es) have been modified from their
   * original values.
   */
  officeModifiedEventHandler (modified: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    // when office addresses change, update filing data
    // always set Priority flag to false
    // use existing Waive Fees flag
    this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.ADDRESS_CHANGE_OT, false,
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }

  directorsPaidChange (modified: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    // when there is a directors paid change, update filing data
    // always set Priority flag to false
    // use existing Waive Fees flag
    this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.DIRECTOR_CHANGE_OT, false,
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }

  directorsFreeChange (modified: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    // when there is a directors free change, update filing data
    // always set Priority flag to false
    // use existing Waive Fees flag
    this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.FREE_DIRECTOR_CHANGE_OT, false,
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
  }

  onAgmDateChange (val: string): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    this.agmDate = val
  }

  onAgmExtensionChange (val: boolean): void {
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    this.agmExtension = val
  }

  onNoAgmChange (val: boolean): void {
    // either this property is True, or else AGM Date must be set
    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
    this.noAgm = val
  }

  async onAgmDateValidChange (val: boolean): Promise<void> {
    this.agmDateValid = val
    // when validity changes, update filing data
    // use existing Priority and Waive Fees flags
    this.updateFilingData(val ? 'add' : 'remove', FilingCodes.ANNUAL_REPORT_OT, this.staffPaymentData.isPriority,
      (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
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
  async onClickFilePay (fromStaffPayment = false): Promise<void> {
    // prevent double saving
    if (this.busySaving) return

    // if this is a staff user clicking File and Pay (not Submit)
    // then detour via Staff Payment dialog
    if (this.isRoleStaff && !fromStaffPayment) {
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

    let annualReport = null
    let changeOfDirectors = null
    let changeOfAddress = null

    const header: any = {
      header: {
        name: FilingTypes.ANNUAL_REPORT,
        certifiedBy: this.certifiedBy || '',
        email: 'no_one@never.get',
        date: this.getCurrentDate, // NB: API will reassign this date according to its clock
        ARFilingYear: this.ARFilingYear, // NB: used by TodoList when loading draft AR
        effectiveDate: this.yyyyMmDdToApi(this.asOfDate)
      }
    }

    // save AR min and max dates (COOP only)
    // NB: save in local tz
    // NB: used by TodoList when loading draft AR
    if (this.isCoop) {
      header.header['arMinDate'] = this.arMinDate
      header.header['arMaxDate'] = this.arMaxDate
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

    if (this.isCoop) {
      annualReport = {
        [FilingTypes.ANNUAL_REPORT]: {
          annualGeneralMeetingDate: this.agmDate || null, // API doesn't validate empty string
          // save AGM Extension as false if No AGM is true
          agmExtension: (!this.noAgm && this.agmExtension) || false,
          didNotHoldAgm: this.noAgm || false,
          annualReportDate: this.asOfDate, // use by COOP only
          // NB: there was an enrichment ticket to populate offices and directors here
          offices: {
            registeredOffice: this.updatedAddresses.registeredOffice
          },
          directors: this.updatedDirectors.filter(el => el.cessationDate === null)
        }
      }
    }

    if (this.isBenBcCccUlc) {
      annualReport = {
        [FilingTypes.ANNUAL_REPORT]: {
          annualReportDate: this.asOfDate,
          nextARDate: this.nextARDate, // used by BEN/BC/CCC/ULC only
          // NB: there was an enrichment ticket to populate offices and directors here
          offices: {
            registeredOffice: this.originalAddresses.registeredOffice,
            recordsOffice: this.originalAddresses.recordsOffice
          },
          directors: this.originalDirectors
        }
      }
    }

    // non-BCOMP only
    if (
      this.hasFilingCode(FilingCodes.DIRECTOR_CHANGE_OT) ||
      this.hasFilingCode(FilingCodes.FREE_DIRECTOR_CHANGE_OT)
    ) {
      changeOfDirectors = {
        [FilingTypes.CHANGE_OF_DIRECTORS]: {
          directors: this.updatedDirectors
        }
      }
    }

    // non-BCOMP only
    if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT)) {
      changeOfAddress = {
        [FilingTypes.CHANGE_OF_ADDRESS]: {
          legalType: this.getLegalType,
          offices: {
            registeredOffice: this.updatedAddresses.registeredOffice
          }
        }
      }
    }

    // build filing
    const filing = Object.assign({}, header, business, annualReport, changeOfAddress, changeOfDirectors)

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
    } catch (error) {
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
      'You have unsaved changes in your Annual Report. Do you want to exit your filing?',
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

  /**
   * Returns True if the selected AGM Date is >= the earliest allowed date.
   * Used for Coops only.
   */
  allowChange (type): boolean {
    let earliestAllowedDate: string = null

    if (type === 'coa') {
      if (this.getLastAddressChangeDate || this.getLastAnnualReportDate) {
        earliestAllowedDate = this.latestYyyyMmDd(this.getLastAddressChangeDate, this.getLastAnnualReportDate)
      } else {
        earliestAllowedDate = this.dateToYyyyMmDd(this.getFoundingDate)
      }
    }
    if (type === 'cod') {
      if (this.getLastDirectorChangeDate || this.getLastAnnualReportDate) {
        earliestAllowedDate = this.latestYyyyMmDd(this.getLastDirectorChangeDate, this.getLastAnnualReportDate)
      } else {
        earliestAllowedDate = this.dateToYyyyMmDd(this.getFoundingDate)
      }
    }

    return (!!this.agmDate && this.compareYyyyMmDd(this.agmDate, earliestAllowedDate, '>='))
  }

  hasAction (director, action): boolean {
    return (director.actions.indexOf(action) >= 0)
  }

  /** Handles Exit event from Payment Error dialog. */
  onPaymentErrorDialogExit (): void {
    if (this.isRoleStaff) {
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

  @Watch('asOfDate')
  async onAsOfDateChanged (): Promise<void> {
    // ignore changes before data is loaded
    if (!this.dataLoaded) return null

    // fetch original office addresses and directors with new date + update working data
    // (this will overwrite the current data)
    this.isFetching = true
    if (!this.isJestRunning) {
      await this.$refs.officeAddressesComponent.getOrigAddresses(this.asOfDate, true)
      await this.$refs.directorsComponent.getOrigDirectors(this.asOfDate, true)
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

    // apply Priority flag to AR filing code only
    // simply re-add the AR code with the updated Priority flag and existing Waive Fees flag
    if (this.isBenBcCccUlc) {
      this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_BC, val.isPriority, waiveFees)
    } else if (this.isCoop) {
      this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_OT, val.isPriority, waiveFees)
    }

    // add/remove Waive Fees flag to all filing codes
    this.updateFilingData(waiveFees ? 'add' : 'remove', undefined, undefined, true)

    // only record changes once the initial data is loaded
    this.haveChanges = this.dataLoaded
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

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

.as-of-date {
  margin-left: 0.25rem;
  font-weight: 300;
}

// Save & Filing Buttons
#coop-buttons-container,
#bcorp-buttons-container {
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

  #ar-cancel-btn {
    margin-left: 0.5rem;
  }
}

.loading-container.grayed-out {
  // these are the same styles as dialog overlay:
  opacity: 0.46;
  background-color: rgb(33, 33, 33); // grey darken-4
  border-color: rgb(33, 33, 33); // grey darken-4
}
</style>
