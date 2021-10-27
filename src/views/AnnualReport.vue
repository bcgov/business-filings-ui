<template>
  <div id="annual-report">
    <ConfirmDialog
      ref="confirm"
      attach="#annual-report"
    />

    <FetchErrorDialog
      attach="#annual-report"
      :dialog="fetchErrorDialog"
      @exit="navigateToDashboard(true)"
    />

    <ResumeErrorDialog
      attach="#annual-report"
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#annual-report"
      filingName="Annual Report"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
    />

    <PaymentErrorDialog
      attach="#annual-report"
      filingName="Annual Report"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
    />

    <!-- Initial Page Load Transition -->
    <v-fade-transition>
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" :size="50" indeterminate></v-progress-circular>
          <div class="loading-msg">{{loadingMessage}}</div>
        </div>
      </div>
    </v-fade-transition>

    <!-- Alternate Loading Spinner -->
    <v-fade-transition>
      <div class="loading-container grayed-out" v-show="isFetching">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg white--text">Fetching updated data</div>
        </div>
      </div>
    </v-fade-transition>

    <v-container id="annual-report-container" class="view-container">
      <v-row>
        <v-col cols="12" lg="9">
          <section id="annual-report-main-section">
            <!-- COOPs only: -->
            <article
              v-if="isCoop"
              class="annual-report-article"
            >
              <!-- Page Title -->
              <header>
                <h1 id="AR-header">File {{ARFilingYear}} Annual Report
                  <span class="font-italic" v-if="getReportState"> &mdash; {{getReportState}}</span>
                </h1>
                <p>Select your Annual General Meeting date, then verify or change your Office Addresses
                  and Directors</p>
              </header>

              <!-- Annual General Meeting Date -->
              <section>
                <header>
                  <h2 id="AR-step-1-header">1. Annual General Meeting Date</h2>
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
                  <h2 id="AR-step-2-header">2. Registered Office Addresses
                    <span class="as-of-date" v-if="agmDate">(as of {{ARFilingYear}} Annual General Meeting)</span>
                    <span class="as-of-date" v-else>(as of {{asOfDate}})</span>
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
                  <h2 id="AR-step-3-header">3. Directors</h2>
                  <p v-if="allowChange('cod')">Tell us who was elected or appointed and who ceased to be
                    a director at your {{ARFilingYear}} AGM</p>
                  <p v-else>This is your list of directors active as of {{asOfDate}}, including
                    directors that were ceased at a later date</p>
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

            <!-- BCOMPs only: -->
            <article
              v-if="isBComp"
              class="annual-report-article"
            >
              <!-- Page Title -->
              <header>
                <h1 id="AR-header-BC">File {{ARFilingYear}} Annual Report
                  <span style="font-style: italic" v-if="getReportState"> &mdash; {{getReportState}}</span>
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
                  <h2 id="AR-header-1-BC">1. Business Details</h2>
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
                  <h2 id="AR-header-2-BC">2. Directors</h2>
                </header>
                <SummaryDirectors
                  :directors="originalDirectors"
                />
              </section>
            </article>

            <!-- Both COOP and BCOMP: -->

            <!-- Certify -->
            <section v-show="isBComp || agmDateValid">
              <header>
                <h2 id="AR-step-4-header" v-if="isBComp">3. Certify</h2>
                <h2 id="AR-step-4-header" v-else>4. Certify</h2>
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

            <!-- Staff Payment -->
            <section v-if="isRoleStaff" v-show="isBComp || agmDateValid">
              <header>
                <h2 id="AR-step-5-header">5. Staff Payment</h2>
              </header>
              <StaffPayment
                :staffPaymentData.sync="staffPaymentData"
                @valid="staffPaymentFormValid=$event"
              />
            </section>
          </section>
        </v-col>

        <v-col cols="12" lg="3" style="position: relative">
          <aside>
            <affix
              relative-element-selector="#annual-report-main-section"
              :offset="{ top: 120, bottom: 40 }"
            >
              <SbcFeeSummary
                :filingData="filingData"
                :payURL="payApiUrl"
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
      class="list-item"
      id="coop-buttons-container"
    >
      <div class="buttons-left">
        <v-btn id="ar-save-btn" large
          v-if="isCurrentFilingEditable"
          :disabled="busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn id="ar-save-resume-btn" large
          v-if="isCurrentFilingEditable"
          :disabled="busySaving"
          :loading="savingResuming"
          @click="onClickSaveResume()"
        >
          <span>Save and Resume Later</span>
        </v-btn>
      </div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff" content-class="top-tooltip">
          <template v-slot:activator="{ on }">
            <div v-on="on" class="d-inline">
              <v-btn
                v-if="isCurrentFilingEditable"
                id="ar-file-pay-btn"
                color="primary"
                large
                :disabled="!validated || busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                {{isPayRequired ? "File and Pay" : "File"}}
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
          @click="navigateToDashboard()"
        >
          <span>Cancel</span>
        </v-btn>
      </div>
    </v-container>

    <!-- Buttons ( BCOMP only ) -->
    <v-container
      v-if="isBComp"
      class="list-item"
      id="bcorp-buttons-container"
    >
      <div class="buttons-left"></div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff" content-class="top-tooltip">
          <template v-slot:activator="{ on }">
            <div v-on="on" class="d-inline">
              <v-btn
                id="ar-file-pay-bc-btn"
                color="primary"
                large
                :disabled="!validated || busySaving"
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
          @click="navigateToDashboard()"
        >
          <span>Cancel</span>
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
// Libraries
import axios from '@/axios-auth'
import { mapActions, mapState, mapGetters } from 'vuex'
import { PAYMENT_REQUIRED } from 'http-status-codes'
import { isEmpty } from 'lodash'

// Components
import AgmDate from '@/components/AnnualReport/AGMDate.vue'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, OfficeAddresses, StaffPayment, SummaryDirectors, SummaryOfficeAddresses }
  from '@/components/common'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, FetchErrorDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'

// Enums and Interfaces
import { FilingCodes, FilingStatus, FilingTypes, Routes, StaffPaymentOptions } from '@/enums'
import { StaffPaymentIF } from '@/interfaces'

export default {
  name: 'AnnualReport',

  mixins: [CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin],

  components: {
    ArDate,
    AgmDate,
    OfficeAddresses,
    Directors,
    Certify,
    StaffPayment,
    SbcFeeSummary,
    SummaryOfficeAddresses,
    SummaryDirectors,
    ConfirmDialog,
    PaymentErrorDialog,
    FetchErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog
  },

  data () {
    return {
      // properties for AgmDate component
      newAgmDate: null, // for resuming draft
      newAgmExtension: null, // for resuming draft
      newNoAgm: null, // for resuming draft
      agmDate: null,
      agmExtension: null,
      noAgm: null,
      agmDateValid: false,

      // properties for OfficeAddresses component
      originalAddresses: { registeredOffice: {}, recordsOffice: {} },
      updatedAddresses: { registeredOffice: {}, recordsOffice: {} },
      addressesFormValid: null as boolean,

      // properties for Directors component
      originalDirectors: [],
      updatedDirectors: [],
      directorFormValid: true,
      directorEditInProgress: false,

      // properties for Certify component
      certifiedBy: '',
      isCertified: false,
      certifyFormValid: null,

      // properties for StaffPayment component
      staffPaymentData: { option: StaffPaymentOptions.NONE } as StaffPaymentIF,
      staffPaymentFormValid: null,

      // flags for displaying dialogs
      fetchErrorDialog: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,

      // other local properties
      totalFee: 0,
      filingId: null,
      loadingMessage: '',
      dataLoaded: false,
      isFetching: false,
      saving: false as boolean, // true only when saving
      savingResuming: false as boolean, // true only when saving and resuming
      filingPaying: false as boolean, // true only when filing and paying
      haveChanges: false,
      saveErrors: [],
      saveWarnings: [],

      // enum in template
      FilingTypes
    }
  },

  computed: {
    ...mapState(['ARFilingYear', 'arMinDate', 'arMaxDate', 'nextARDate', 'entityFoundingDate', 'directors',
      'filingData', 'lastAddressChangeDate', 'lastDirectorChangeDate', 'lastAnnualReportDate']),

    ...mapGetters(['isBComp', 'isCoop', 'isRoleStaff', 'isCurrentFilingEditable', 'getReportState',
      'getCurrentYear', 'getCurrentDate', 'getEntityType', 'getEntityName', 'getEntityIncNo']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded && !this.fetchErrorDialog && !this.resumeErrorDialog &&
        !this.saveErrorDialog && !this.paymentErrorDialog)
    },

    /**
     * The As Of date, used to query data, as Effective Date, and as Annual Report Date.
     * (Depends on whether entity is a Coop or BComp.)
     * @returns date as "YYYY-MM-DD"
     */
    asOfDate (): string {
      if (this.isCoop) {
        // if AGM Date is set then use it
        if (this.agmDate) return this.agmDate
        // if filing is in past year then use last day in that year
        if (this.ARFilingYear < this.getCurrentYear) return `${this.ARFilingYear}-12-31`
      }
      if (this.isBComp) {
        return this.nextARDate
      }
      // should never get here
      return this.getCurrentDate
    },

    certifyMessage (): string {
      if (this.isBComp) {
        return this.certifyText(FilingCodes.ANNUAL_REPORT_BC)
      }
      return this.certifyText(FilingCodes.ANNUAL_REPORT_OT)
    },

    /** The Pay API URL string. */
    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    /** The Auth URL string. */
    authUrl (): string {
      return sessionStorage.getItem('AUTH_WEB_URL')
    },

    /** The Base URL string. */
    baseUrl (): string {
      return sessionStorage.getItem('BASE_URL')
    },

    validated (): boolean {
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)

      if (this.isCoop) {
        return (staffPaymentValid && this.agmDateValid && this.addressesFormValid && this.directorFormValid &&
          this.certifyFormValid && !this.directorEditInProgress)
      }
      return (staffPaymentValid && this.certifyFormValid)
    },

    /** True when saving, saving and resuming, or filing and paying. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    isPayRequired (): boolean {
      // FUTURE: modify rule here as needed
      return (this.totalFee > 0)
    }
  },

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

    // Filing ID may be 0, N or NaN
    this.filingId = +this.$route.params.filingId
  },

  mounted (): void {
    // if tombstone data isn't set, go back to dashboard
    if (!this.getEntityIncNo || !this.ARFilingYear || isNaN(this.filingId)) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing Entity Inc No, AR Filing Year, or Filing ID!')
      this.$router.push({ name: Routes.DASHBOARD })
      return // don't continue
    }
    if (this.isCoop && (!this.arMinDate || !this.arMaxDate)) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing AR Min Date or AR Max Date!')
      this.$router.push({ name: Routes.DASHBOARD })
      return // don't continue
    }
    if (this.isBComp && !this.nextARDate) {
      // eslint-disable-next-line no-console
      console.log('Annual Report error - missing Next AR Date!')
      this.$router.push({ name: Routes.DASHBOARD })
      return // don't continue
    }

    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    this.$nextTick(async () => {
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
      if (this.isBComp) {
        this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_BC, this.staffPaymentData.isPriority,
          (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
      }
    })
  },

  destroyed (): void {
    // stop listening for custom events
    this.$root.$off('fetch-error-event')
  },

  beforeRouteLeave (to, from, next) {
    if (!this.haveChanges) {
      // no changes -- resolve promise right away
      next()
      return
    }

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Unsaved Changes',
      'You have unsaved changes in your Annual Report. Do you want to exit your filing?',
      {
        width: '40rem',
        persistent: true,
        yes: 'Return to my filing',
        no: null,
        cancel: 'Exit without saving'
      }
    ).then(async (confirm) => {
      // if we get here, Yes was clicked
      if (confirm) {
        next(false)
      }
    }).catch(() => {
      // if we get here, Cancel was clicked
      this.haveChanges = false
      next()
    })
  },

  methods: {
    ...mapActions(['setFilingData']),

    async fetchDraftFiling (): Promise<void> {
      const url = `businesses/${this.getEntityIncNo}/filings/${this.filingId}`
      await axios.get(url).then(async response => {
        // verify data
        const filing: any = response?.data?.filing
        if (!filing) throw new Error('Missing filing')

        const header = filing.header
        if (!header) throw new Error('Missing header')

        const business = filing.business
        if (!business) throw new Error('Missing business')

        const annualReport = filing.annualReport
        if (!annualReport) throw new Error('Missing annual report')

        if (header.name !== FilingTypes.ANNUAL_REPORT) throw new Error('Invalid filing type')
        if (header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
        if (business.identifier !== this.getEntityIncNo) throw new Error('Invalid business identifier')
        if (business.legalName !== this.getEntityName) throw new Error('Invalid business legal name')

        // restore Certified By (but not Date)
        this.certifiedBy = header.certifiedBy

        // restore Staff Payment data
        if (header.routingSlipNumber) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.FAS,
            routingSlipNumber: header.routingSlipNumber,
            isPriority: header.priority
          }
        } else if (header.bcolAccountNumber) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.BCOL,
            bcolAccountNumber: header.bcolAccountNumber,
            datNumber: header.datNumber,
            folioNumber: header.folioNumber,
            isPriority: header.priority
          }
        } else if (header.waiveFees) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.NO_FEE
          }
        } else {
          this.staffPaymentData = {
            option: StaffPaymentOptions.NONE
          }
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
          if (this.isBComp && registeredOffice && recordsOffice) {
            this.updatedAddresses = { registeredOffice, recordsOffice }
          } else if (!this.isBComp && registeredOffice) {
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
    },

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
    },

    directorsPaidChange (modified: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      // when there is a directors paid change, update filing data
      // always set Priority flag to false
      // use existing Waive Fees flag
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.DIRECTOR_CHANGE_OT, false,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    },

    directorsFreeChange (modified: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      // when there is a directors free change, update filing data
      // always set Priority flag to false
      // use existing Waive Fees flag
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.FREE_DIRECTOR_CHANGE_OT, false,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    },

    onAgmDateChange (val: string) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      this.agmDate = val
    },

    onAgmExtensionChange (val: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      this.agmExtension = val
    },

    onNoAgmChange (val: boolean) {
      // either this property is True, or else AGM Date must be set
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      this.noAgm = val
    },

    async onAgmDateValidChange (val: boolean): Promise<void> {
      this.agmDateValid = val
      // when validity changes, update filing data
      // use existing Priority and Waive Fees flags
      this.updateFilingData(val ? 'add' : 'remove', FilingCodes.ANNUAL_REPORT_OT, this.staffPaymentData.isPriority,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    },

    async onClickSave () {
      // prevent double saving
      if (this.busySaving) return

      this.saving = true
      const filing = await this.saveFiling(true)
      if (filing) {
        // save Filing ID for future PUTs
        this.filingId = +filing.header.filingId // number
      }
      this.saving = false
    },

    async onClickSaveResume () {
      // prevent double saving
      if (this.busySaving) return

      this.savingResuming = true
      const filing = await this.saveFiling(true)
      // on success, go to dashboard
      if (filing) {
        this.$router.push({ name: Routes.DASHBOARD })
      }
      this.savingResuming = false
    },

    async onClickFilePay () {
      // prevent double saving
      if (this.busySaving) return

      this.filingPaying = true
      const filing = await this.saveFiling(false) // not a draft

      // on success, redirect to Pay URL
      if (filing && filing.header) {
        const filingId: number = +filing.header.filingId
        const isPaymentActionRequired: boolean = filing.header?.isPaymentActionRequired || false

        // if payment action is required, redirect to Pay URL
        if (isPaymentActionRequired) {
          const paymentToken = filing.header.paymentToken
          const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + filingId)
          const payUrl = this.authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

          // assume Pay URL is always reachable
          // otherwise, user will have to retry payment later
          window.location.assign(payUrl)
        } else {
          // route directly to dashboard
          this.$router.push({ name: Routes.DASHBOARD, query: { filing_id: filingId } })
        }
      }
      this.filingPaying = false
    },

    async saveFiling (isDraft) {
      this.resetErrors()

      const hasPendingFilings = await this.hasTasks(this.getEntityIncNo)
      if (hasPendingFilings) {
        this.saveErrors = [
          { error: 'Another draft filing already exists. Please complete it before creating a new filing.' }
        ]
        this.saveErrorDialog = true
        return null
      }

      let annualReport = null
      let changeOfDirectors = null
      let changeOfAddress = null

      const header = {
        header: {
          name: FilingTypes.ANNUAL_REPORT,
          certifiedBy: this.certifiedBy || '',
          email: 'no_one@never.get',
          date: this.getCurrentDate, // NB: API will reassign this date according to its clock
          ARFilingYear: this.ARFilingYear, // NB: used by TodoList when loading draft AR
          effectiveDate: this.dateStringToApi(this.asOfDate)
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

      const business = {
        business: {
          foundingDate: this.dateToApi(this.entityFoundingDate),
          identifier: this.getEntityIncNo,
          legalName: this.getEntityName,
          legalType: this.getEntityType
        }
      }

      if (this.isCoop) {
        annualReport = {
          annualReport: {
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

      if (this.isBComp) {
        annualReport = {
          annualReport: {
            annualReportDate: this.asOfDate,
            nextARDate: this.nextARDate, // used by BCOMP only
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
          changeOfDirectors: {
            directors: this.updatedDirectors
          }
        }
      }

      // non-BCOMP only
      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT)) {
        changeOfAddress = {
          changeOfAddress: {
            legalType: this.getEntityType,
            offices: {
              registeredOffice: this.updatedAddresses.registeredOffice
            }
          }
        }
      }

      const data = {
        filing: Object.assign(
          {},
          header,
          business,
          annualReport,
          changeOfAddress,
          changeOfDirectors
        )
      }

      try {
        let response

        if (this.filingId > 0) {
          // we have a filing id, so update (put) an existing filing
          let url = `businesses/${this.getEntityIncNo}/filings/${this.filingId}`
          if (isDraft) { url += '?draft=true' }
          response = await axios.put(url, data)
        } else {
          // filing id is 0, so create (post) a new filing
          let url = `businesses/${this.getEntityIncNo}/filings`
          if (isDraft) { url += '?draft=true' }
          response = await axios.post(url, data)
        }

        const filing = response?.data?.filing
        if (!filing) {
          throw new Error('Invalid API response')
        }

        // clear flag
        this.haveChanges = false
        return filing
      } catch (error) {
        this.saveErrors = error?.response?.data?.errors || []
        this.saveWarnings = error?.response?.data?.warnings || []

        if (error?.response?.status === PAYMENT_REQUIRED) {
          // changes were saved if a 402 is received, so clear flag
          this.haveChanges = false
          this.paymentErrorDialog = true
          // save succeeded, so return filing
          return error?.response?.data?.filing
        } else {
          if (!this.isJestRunning) {
            // eslint-disable-next-line no-console
            console.log('saveFiling() error =', error)
          }
          this.saveErrorDialog = true
          // save failed, so return null
          return null
        }
      }
    },

    navigateToDashboard (ignoreChanges: boolean = false) {
      if (ignoreChanges) this.haveChanges = false
      this.$router.push({ name: Routes.DASHBOARD })
        .catch(() => {}) // ignore error in case navigation was aborted
    },

    resetErrors () {
      this.paymentErrorDialog = false
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    /**
     * Returns True if the selected AGM Date is >= the earliest allowed date.
     * Used for Coops only.
     */
    allowChange (type): boolean {
      let earliestAllowedDate: string = null

      if (type === 'coa') {
        if (this.lastAddressChangeDate || this.lastAnnualReportDate) {
          earliestAllowedDate = this.latestDate(this.lastAddressChangeDate, this.lastAnnualReportDate)
        } else {
          earliestAllowedDate = this.dateToYyyyMmDd(this.entityFoundingDate)
        }
      }
      if (type === 'cod') {
        if (this.lastDirectorChangeDate || this.lastAnnualReportDate) {
          earliestAllowedDate = this.latestDate(this.lastDirectorChangeDate, this.lastAnnualReportDate)
        } else {
          earliestAllowedDate = this.dateToYyyyMmDd(this.entityFoundingDate)
        }
      }

      return (!!this.agmDate && this.compareDates(this.agmDate, earliestAllowedDate, '>='))
    },

    hasAction (director, action): boolean {
      return (director.actions.indexOf(action) >= 0)
    },

    /** Returns True if the specified business has any pending tasks, else False. */
    // FUTURE move this to Legal API mixin
    async hasTasks (businessId): Promise<boolean> {
      let hasPendingItems = false
      if (this.filingId === 0) {
        const url = `businesses/${businessId}/tasks`
        await axios.get(url)
          .then(response => {
            if (response?.data?.tasks) {
              // FUTURE: use find() or some() so this doesn't iterate over all tasks
              response.data.tasks.forEach(task => {
                if (task?.task?.filing?.header) {
                  if (task.task.filing.header.status !== FilingStatus.NEW) {
                    hasPendingItems = true
                  }
                }
              })
            }
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.log('hasTasks() error =', error)
            this.saveErrorDialog = true
          })
      }
      return hasPendingItems
    }
  },

  watch: {
    async asOfDate () {
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
    },

    /** Called when Is Certified changes. */
    isCertified (val: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
    },

    /** Called when Certified By changes. */
    certifiedBy (val: string) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
    },

    /** Called when Staff Payment Data changes. */
    staffPaymentData (val: StaffPaymentIF) {
      const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

      // apply Priority flag to AR filing code only
      // simply re-add the AR code with the updated Priority flag and existing Waive Fees flag
      if (this.isBComp) {
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
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

article {
  .v-card {
    line-height: 1.2rem;
    font-size: 0.875rem;
  }
}

header p,
section p {
  color: $gray6;
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
