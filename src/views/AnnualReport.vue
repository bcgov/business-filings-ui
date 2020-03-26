<template>
  <div id="annual-report">
    <confirm-dialog
      ref="confirm"
      attach="#annual-report"
    />

    <resume-error-dialog
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#annual-report"
    />

    <save-error-dialog
      filing="Annual Report"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
      attach="#annual-report"
    />

    <payment-error-dialog
      :dialog="paymentErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#annual-report"
    />

    <!-- Initial Page Load Transition -->
    <div class="loading-container fade-out">
      <div class="loading__content">
        <v-progress-circular color="primary" :size="50" indeterminate></v-progress-circular>
        <div class="loading-msg">{{loadingMessage}}</div>
      </div>
    </div>

    <v-container id="annual-report-container" class="view-container">
      <v-row>
        <v-col cols="12" lg="9">
          <section id="annual-report-main-section">
            <!-- COOP only: -->
            <article
              v-if="isCoop()"
              class="annual-report-article"
              :class="agmDate ? 'agm-date-selected' : 'no-agm-date-selected'"
            >
              <!-- Page Title -->
              <header>
                <h1 id="AR-header">File {{ARFilingYear}} Annual Report
                  <span class="font-italic" v-if="reportState"> &mdash; {{reportState}}</span>
                </h1>
                <p>Please verify or change your Office Addresses and Directors.</p>
              </header>

              <template v-if="isAnnualReportEditable">
                <!-- Annual General Meeting Date -->
                <section>
                  <header>
                    <h2 id="AR-step-1-header">1. Annual General Meeting Date</h2>
                    <p>Select your Annual General Meeting (AGM) date.</p>
                  </header>
                  <agm-date
                    :newAgmDate="newAgmDate"
                    :newNoAgm="newNoAgm"
                    :allowCOA="allowChange('coa')"
                    :allowCOD="allowChange('cod')"
                    @agmDate="onAgmDateChange($event)"
                    @noAgm="onNoAgmChange($event)"
                    @valid="onAgmDateValidChange($event)"
                  />
                </section>

                <!-- Registered Office Addresses -->
                <section v-show="agmDate || noAgm">
                  <header>
                    <h2 id="AR-step-2-header">2. Registered Office Addresses
                      <span class="as-of-date" v-if="agmDate">(as of {{ARFilingYear}} Annual General Meeting)</span>
                      <span class="as-of-date" v-else>(as of {{asOfDate}})</span>
                    </h2>
                    <p>Verify or change your Registered Office Addresses.</p>
                  </header>
                  <office-addresses
                    :addresses.sync="addresses"
                    :registeredAddress.sync="registeredAddress"
                    :recordsAddress.sync="recordsAddress"
                    :asOfDate="asOfDate"
                    :componentEnabled="allowChange('coa')"
                    @modified="officeModifiedEventHandler($event)"
                    @valid="addressFormValid = $event"
                  />
                </section>

                <!-- Directors -->
                <section v-show="agmDate || noAgm">
                  <header>
                    <h2 id="AR-step-3-header">3. Directors</h2>
                    <p v-if="allowChange('cod')">Tell us who was elected or appointed and who ceased to be
                      a director at your {{ARFilingYear}} AGM.</p>
                    <p v-else>This is your list of directors active as of {{asOfDate}}, including
                      directors that were ceased at a later date.</p>
                  </header>
                  <directors ref="directorsList"
                    @directorsChange="directorsChange"
                    @directorsFreeChange="directorsFreeChange"
                    @allDirectors="allDirectors=$event"
                    @directorFormValid="directorFormValid=$event"
                    @directorEditAction="directorEditInProgress=$event"
                    :asOfDate="asOfDate"
                    :componentEnabled="allowChange('cod')"
                  />
                </section>
              </template>
            </article>

            <!-- BCOMP only: -->
            <article
              v-if="isBComp()"
              class="annual-report-article"
            >
              <!-- Page Title -->
              <header>
                <h1 id="AR-header-BC">File {{ARFilingYear}} Annual Report
                  <span style="font-style: italic" v-if="reportState"> &mdash; {{reportState}}</span>
                </h1>
                <p>Please review all the information before you file and pay.</p>
              </header>

              <!-- Business Details -->
              <section>
                <header>
                  <h2 id="AR-header-1-BC">1. Business Details</h2>
                </header>
                <ar-date />
                <br>
                <summary-office-addresses
                  :registeredAddress="registeredAddress"
                  :recordsAddress="recordsAddress"
                />
              </section>

              <!-- Directors -->
              <section>
                <header>
                  <h2 id="AR-header-2-BC">2. Directors</h2>
                </header>
                <summary-directors
                  :directors="directors"
                />
              </section>
            </article>

            <!-- Both COOP and BCOMP: -->

            <!-- Certify -->
            <section v-show="isBComp() || agmDate || noAgm">
              <header>
                <h2 id="AR-step-4-header" v-if="isBComp()">3. Certify</h2>
                <h2 id="AR-step-4-header" v-else>4. Certify</h2>
                <p>Enter the legal name of the person authorized to complete and submit this Annual Report.</p>
              </header>
              <certify
                :isCertified.sync="isCertified"
                :certifiedBy.sync="certifiedBy"
                :entityDisplay="displayName()"
                :message="certifyMessage"
                @valid="certifyFormValid=$event"
              />
            </section>

            <!-- Staff Payment -->
            <section v-if="isRoleStaff" v-show="isBComp() || agmDate || noAgm">
              <header>
                <h2 id="AR-step-5-header">5. Staff Payment</h2>
              </header>
              <staff-payment
                :routingSlipNumber.sync="routingSlipNumber"
                :isPriority.sync="isPriority"
                :isWaiveFees.sync="isWaiveFees"
                @valid="staffPaymentFormValid=$event"
              />
            </section>
          </section>
        </v-col>

        <v-col cols="12" lg="3" style="position: relative">
          <aside>
            <affix relative-element-selector="#annual-report-main-section" :offset="{ top: 120, bottom: 40 }">
              <sbc-fee-summary
                v-bind:filingData="[...filingData]"
                v-bind:payURL="payApiUrl"
                @total-fee="totalFee=$event"
              />
            </affix>
          </aside>
        </v-col>
      </v-row>
    </v-container>

    <!-- Buttons ( COOP only ) -->
    <v-container
      v-if="isCoop()"
      class="list-item"
      id="coop-buttons-container"
    >
      <div class="buttons-left">
        <v-btn id="ar-save-btn" large
          v-if="isAnnualReportEditable"
          :disabled="busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn id="ar-save-resume-btn" large
          v-if="isAnnualReportEditable"
          :disabled="busySaving"
          :loading="savingResuming"
          @click="onClickSaveResume()"
        >
          <span>Save &amp; Resume Later</span>
        </v-btn>
      </div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff">
          <template v-slot:activator="{ on }">
            <div v-on="on" class="d-inline">
              <v-btn
                v-if="isAnnualReportEditable"
                id="ar-file-pay-btn"
                color="primary"
                large
                :disabled="!validated || busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                <span>{{isPayRequired ? "File &amp; Pay" : "File"}}</span>
              </v-btn>
            </div>
          </template>
          <span>Ensure all of your information is entered correctly before you File.<br>
            There is no opportunity to change information beyond this point.</span>
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
      v-if="isBComp()"
      class="list-item"
      id="bcorp-buttons-container"
    >
      <div class="buttons-left"></div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff">
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
                <span>File &amp; Pay</span>
              </v-btn>
            </div>
          </template>
          <span>Ensure all of your information is entered correctly before you File.<br>
            There is no opportunity to change information beyond this point.</span>
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
import { BAD_REQUEST, PAYMENT_REQUIRED } from 'http-status-codes'

// Components
import AgmDate from '@/components/AnnualReport/AGMDate.vue'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, OfficeAddresses, StaffPayment, SummaryDirectors, SummaryOfficeAddresses } from '@/components/common'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog } from '@/components/dialogs'

// Mixins
import { DateMixin, CommonMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'

// Enums and Constants
import { EntityTypes, FilingCodes, FilingStatus, FilingTypes } from '@/enums'
import { APPOINTED, CEASED, NAMECHANGED, ADDRESSCHANGED, DASHBOARD } from '@/constants'

export default {
  name: 'AnnualReport',

  mixins: [DateMixin, CommonMixin, FilingMixin, ResourceLookupMixin],

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
    ResumeErrorDialog,
    SaveErrorDialog
  },

  data () {
    return {
      // properties for AgmDate component
      newAgmDate: null, // for resuming draft
      newNoAgm: null, // for resuming draft
      agmDate: null,
      noAgm: null,
      agmDateValid: false,

      // properties for OfficeAddresses component
      addresses: null,
      addressesFormValid: true,

      // properties for Directors component
      allDirectors: [],
      directorFormValid: true,
      directorEditInProgress: false,

      // properties for Certify component
      certifiedBy: '',
      isCertified: false,
      certifyFormValid: null,

      // properties for StaffPayment component
      routingSlipNumber: null,
      isPriority: false,
      isWaiveFees: false,
      staffPaymentFormValid: null,
      totalFee: 0,

      // flags for displaying dialogs
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,

      // other local properties
      filingId: null,
      loadingMessage: 'Loading...', // initial generic message
      saving: false as boolean, // true only when saving
      savingResuming: false as boolean, // true only when saving and resuming
      filingPaying: false as boolean, // true only when filing and paying
      haveChanges: false,
      saveErrors: [],
      saveWarnings: [],

      // enums
      EntityTypes,
      FilingCodes,
      FilingStatus,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'ARFilingYear', 'nextARDate', 'lastAgmDate', 'entityType', 'entityName',
      'entityIncNo', 'entityFoundingDate', 'registeredAddress', 'recordsAddress', 'lastPreLoadFilingDate',
      'directors', 'filingData']),

    ...mapGetters(['isRoleStaff', 'isAnnualReportEditable', 'reportState', 'lastCOAFilingDate', 'lastCODFilingDate']),

    /**
     * The As Of date, used to query data, as Effective Date, and as Annual Report Date.
     */
    asOfDate (): string {
      // if AGM Date is not empty then use it
      if (this.agmDate) return this.agmDate
      // if filing is in past year then use last day in that year
      if (this.ARFilingYear < this.currentYear) return `${this.ARFilingYear}-12-31`
      // otherwise use current date (BCOMP only - should never happen for COOP)
      return this.currentDate
    },

    /**
     * The current year.
     */
    currentYear (): number {
      return this.currentDate ? +this.currentDate.substring(0, 4) : 0
    },

    certifyMessage (): string {
      if (this.isBComp()) {
        return this.certifyText(FilingCodes.ANNUAL_REPORT_BC)
      }
      return this.certifyText(FilingCodes.ANNUAL_REPORT_OT)
    },

    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    validated (): boolean {
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)

      if (this.isCoop()) {
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

    // before unloading this page, if there are changes then prompt user
    window.onbeforeunload = (event) => {
      if (this.haveChanges) {
        event.preventDefault()
        // NB: custom text is not supported in all browsers
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    // NB: filing id of 0 means "new AR"
    // otherwise it's a draft AR filing id
    this.filingId = +this.$route.params.filingId // number (may be NaN)

    // if tombstone data isn't set, go back to dashboard
    if (!this.entityIncNo || !this.ARFilingYear || isNaN(this.filingId)) {
      this.$router.push({ name: DASHBOARD })
    } else if (this.filingId > 0) {
      // resume draft filing
      this.loadingMessage = `Resuming Your ${this.ARFilingYear} Annual Report`
      this.fetchData()
    } else {
      // else just load new page
      this.loadingMessage = `Preparing Your ${this.ARFilingYear} Annual Report`
    }
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

    fetchData () {
      const url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
      axios.get(url).then(response => {
        if (response && response.data) {
          const filing = response.data.filing
          try {
            // verify data
            if (!filing) throw new Error('Missing filing')
            if (!filing.header) throw new Error('Missing header')
            if (!filing.business) throw new Error('Missing business')
            if (filing.header.name !== FilingTypes.ANNUAL_REPORT) throw new Error('Invalid filing type')
            if (filing.header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
            if (filing.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
            if (filing.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

            // load Certified By but not Date
            this.certifiedBy = filing.header.certifiedBy

            // load Staff Payment properties
            this.routingSlipNumber = filing.header.routingSlipNumber
            this.isPriority = filing.header.priority
            this.isWaiveFees = filing.header.waiveFees

            // load Annual Report fields
            const annualReport = filing.annualReport
            if (annualReport) {
              // set the Draft Date in the Directors List component
              // FUTURE: use props instead of $refs (which cause an error in the unit tests)
              if (this.$refs.directorsList && this.$refs.directorsList.setDraftDate) {
                this.$refs.directorsList.setDraftDate(annualReport.annualGeneralMeetingDate)
              }
              if (this.isCoop()) {
                // set the new AGM date in the AGM Date component (may be null or empty)
                this.newAgmDate = annualReport.annualGeneralMeetingDate || ''
                // set the new No AGM flag in the AGM Date component (may be undefined)
                this.newNoAgm = annualReport.didNotHoldAgm || false
              }
            } else {
              throw new Error('Missing annual report')
            }

            // load Change of Directors fields
            const changeOfDirectors = filing.changeOfDirectors
            if (changeOfDirectors) {
              if (changeOfDirectors.directors && changeOfDirectors.directors.length > 0) {
                if (this.$refs.directorsList && this.$refs.directorsList.setAllDirectors) {
                  this.$refs.directorsList.setAllDirectors(changeOfDirectors.directors)
                }

                // add filing code for paid changes
                if (changeOfDirectors.directors.filter(
                  director => this.hasAction(director, CEASED) || this.hasAction(director, APPOINTED)
                ).length > 0) {
                  // always set Priority flag to false
                  // use default Waive Fees flag
                  this.updateFilingData('add', FilingCodes.DIRECTOR_CHANGE_OT, false, this.isWaiveFees)
                }

                // add filing code for free changes
                if (changeOfDirectors.directors.filter(
                  director => this.hasAction(director, NAMECHANGED) || this.hasAction(director, ADDRESSCHANGED)
                ).length > 0) {
                  // always set Priority flag to false
                  // use default Waive Fees flag
                  this.updateFilingData('add', FilingCodes.FREE_DIRECTOR_CHANGE_OT, false, this.isWaiveFees)
                }
              } else {
                throw new Error('Invalid change of directors')
              }
            } else {
              // To handle the condition of save as draft without change of director
              if (this.$refs.directorsList && this.$refs.directorsList.getDirectors) {
                this.$refs.directorsList.getDirectors()
              }
            }

            // load Change of Address fields
            if (filing.changeOfAddress) {
              const offices = filing.changeOfAddress.offices
              if (offices && offices.registeredOffice) {
                this.addresses = {
                  registeredOffice: {
                    deliveryAddress: offices.registeredOffice.deliveryAddress,
                    mailingAddress: offices.registeredOffice.mailingAddress
                  }
                }
                // always set Priority flag to false
                // use default Waive Fees flag
                this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, false, this.isWaiveFees)
              } else {
                throw new Error('Invalid change of address')
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchData() error - ${err.message}, filing = ${filing}`)
            this.resumeErrorDialog = true
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('fetchData() error - invalid response =', response)
          this.resumeErrorDialog = true
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.error('fetchData() error =', error)
        this.resumeErrorDialog = true
      })
    },

    /**
     * Callback method for the "modified" event from OfficeAddress.
     *
     * @param modified a boolean indicating whether or not the office address(es) have been modified from their
     * original values.
     */
    officeModifiedEventHandler (modified: boolean): void {
      this.haveChanges = true
      // when addresses change, update filing data
      // always set Priority flag to false
      // use default Waive Fees flag
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.ADDRESS_CHANGE_OT, false, this.isWaiveFees)
    },

    directorsChange (modified: boolean) {
      this.haveChanges = true
      // when directors change, update filing data
      // always set Priority flag to false
      // use default Waive Fees flag
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.DIRECTOR_CHANGE_OT, false, this.isWaiveFees)
    },

    directorsFreeChange (modified: boolean) {
      this.haveChanges = true
      // when directors change (free filing), update filing data
      // always set Priority flag to false
      // use default Waive Fees flag
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.FREE_DIRECTOR_CHANGE_OT, false, this.isWaiveFees)
    },

    onAgmDateChange (val: string) {
      this.haveChanges = true
      this.agmDate = val
    },

    onNoAgmChange (val: boolean) {
      this.haveChanges = true
      this.noAgm = val
    },

    onAgmDateValidChange (val: boolean) {
      this.agmDateValid = val
      // when validity changes, update filing data
      // use default Priority and Waive Fees flags
      this.updateFilingData(val ? 'add' : 'remove', FilingCodes.ANNUAL_REPORT_OT, this.isPriority, this.isWaiveFees)
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
        this.$router.push({ name: DASHBOARD })
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

        // whether this is a staff or no-fee filing
        const prePaidFiling = (this.isRoleStaff || !this.isPayRequired)

        // if filing needs to be paid, redirect to Pay URL
        if (!prePaidFiling) {
          const paymentToken = filing.header.paymentToken
          const baseUrl = sessionStorage.getItem('BASE_URL')
          const returnUrl = encodeURIComponent(baseUrl + '?filing_id=' + filingId)
          const authUrl = sessionStorage.getItem('AUTH_URL')
          const payUrl = authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

          // assume Pay URL is always reachable
          // otherwise, user will have to retry payment later
          window.location.assign(payUrl)
        } else {
          // route directly to dashboard
          this.$router.push({ name: DASHBOARD, query: { filing_id: filingId } })
        }
      }
      this.filingPaying = false
    },

    async saveFiling (isDraft) {
      this.resetErrors()

      const hasPendingFilings = await this.hasTasks(this.entityIncNo)
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
          date: this.currentDate,
          effectiveDate: this.asOfDate + 'T00:00:00+00:00'
        }
      }
      // only save Routing Slip Number if it's valid
      if (this.routingSlipNumber && !this.isWaiveFees) {
        header.header['routingSlipNumber'] = this.routingSlipNumber
      }
      // only save Priority it it's valid
      if (this.isPriority && !this.isWaiveFees) {
        header.header['priority'] = true
      }
      // only save Waive Fees if it's valid
      if (this.isWaiveFees) {
        header.header['waiveFees'] = true
      }

      const business = {
        business: {
          foundingDate: this.entityFoundingDate,
          identifier: this.entityIncNo,
          legalName: this.entityName
        }
      }

      if (this.isCoop()) {
        annualReport = {
          annualReport: {
            annualGeneralMeetingDate: this.agmDate || null, // API doesn't validate empty string
            didNotHoldAgm: this.noAgm || false,
            annualReportDate: this.asOfDate,
            offices: {
              registeredOffice: {
                deliveryAddress: this.addresses.registeredOffice['deliveryAddress'],
                mailingAddress: this.addresses.registeredOffice['mailingAddress']
              }
            },
            directors: this.allDirectors.filter(el => el.cessationDate === null)
          }
        }
      } else if (this.isBComp()) {
        annualReport = {
          annualReport: {
            annualReportDate: this.asOfDate,
            nextARDate: this.dateToUsableString(new Date(this.nextARDate)),
            offices: {
              registeredOffice: {
                deliveryAddress: this.registeredAddress['deliveryAddress'],
                mailingAddress: this.registeredAddress['mailingAddress']
              },
              recordsOffice: {
                deliveryAddress: this.recordsAddress['deliveryAddress'],
                mailingAddress: this.recordsAddress['mailingAddress']
              }
            },
            directors: this.directors
          }
        }
      }

      if (this.hasFilingCode(FilingCodes.DIRECTOR_CHANGE_OT) ||
      this.hasFilingCode(FilingCodes.FREE_DIRECTOR_CHANGE_OT)) {
        changeOfDirectors = {
          changeOfDirectors: {
            directors: this.allDirectors
          }
        }
      }

      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT) && this.addresses) {
        changeOfAddress = {
          changeOfAddress: {
            legalType: this.entityType,
            offices: {
              registeredOffice: {
                deliveryAddress: this.addresses.registeredOffice['deliveryAddress'],
                mailingAddress: this.addresses.registeredOffice['mailingAddress']
              }
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

      if (this.filingId > 0) {
        // we have a filing id, so we are updating an existing filing
        let url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
        if (isDraft) {
          url += '?draft=true'
        }
        let filing = null
        await axios.put(url, data).then(res => {
          if (!res || !res.data || !res.data.filing) {
            throw new Error('Invalid API response')
          }
          filing = res.data.filing
          this.haveChanges = false
        }).catch(error => {
          if (error && error.response && error.response.status === PAYMENT_REQUIRED) {
            this.paymentErrorDialog = true
          } else if (error && error.response && error.response.status === BAD_REQUEST) {
            if (error.response.data.errors) {
              this.saveErrors = error.response.data.errors
            }
            if (error.response.data.warnings) {
              this.saveWarnings = error.response.data.warnings
            }
            this.saveErrorDialog = true
          } else {
            this.saveErrorDialog = true
          }
        })
        return filing
      } else {
        // filing id is 0, so we are saving a new filing
        let url = `businesses/${this.entityIncNo}/filings`
        if (isDraft) {
          url += '?draft=true'
        }
        let filing = null
        await axios.post(url, data).then(res => {
          if (!res || !res.data || !res.data.filing) {
            throw new Error('Invalid API response')
          }
          filing = res.data.filing
          this.haveChanges = false
        }).catch(error => {
          if (error && error.response && error.response.status === PAYMENT_REQUIRED) {
            this.paymentErrorDialog = true
          } else if (error && error.response && error.response.status === BAD_REQUEST) {
            if (error.response.data.errors) {
              this.saveErrors = error.response.data.errors
            }
            if (error.response.data.warnings) {
              this.saveWarnings = error.response.data.warnings
            }
            this.saveErrorDialog = true
          } else {
            this.saveErrorDialog = true
          }
        })
        return filing
      }
    },

    navigateToDashboard (ignoreChanges: boolean = false) {
      if (ignoreChanges) this.haveChanges = false
      this.$router.push({ name: DASHBOARD })
    },

    resetErrors () {
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    allowChange (type) {
      let earliestAllowedDate
      if (type === 'coa') {
        earliestAllowedDate = this.lastCOAFilingDate
      }
      if (type === 'cod') {
        earliestAllowedDate = this.lastCODFilingDate
      }
      return Boolean(
        this.agmDateValid && this.agmDate && this.compareDates(this.agmDate, earliestAllowedDate, '>=')
      )
    },

    hasAction (director, action) {
      return (director.actions.indexOf(action) >= 0)
    },

    /** Returns True if the specified business has any pending tasks, else False. */
    async hasTasks (businessId) {
      let hasPendingItems = false
      if (this.filingId === 0) {
        const url = `businesses/${businessId}/tasks`
        await axios.get(url)
          .then(response => {
            if (response && response.data && response.data.tasks) {
              response.data.tasks.forEach((task) => {
                if (task.task && task.task.filing &&
                  task.task.filing.header && task.task.filing.header.status !== FilingStatus.NEW) {
                  hasPendingItems = true
                }
              })
            }
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('hasTasks() error =', error)
            this.saveErrorDialog = true
          })
      }
      return hasPendingItems
    }
  },

  mounted (): void {
    // for BComp, add AR filing code now
    // for Coop, code is added when AGM Date becomes valid
    // use default Priority and Waive Fees flags
    if (this.isBComp()) {
      this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_BC, this.isPriority, this.isWaiveFees)
    }
  },

  watch: {
    /** Called when Is Certified changes. */
    isCertified (val: boolean) {
      this.haveChanges = true
    },

    /** Called when Certified By changes. */
    certifiedBy (val: string) {
      this.haveChanges = true
    },

    /** Called when Routing Slip Number changes. */
    routingSlipNumber (val) {
      this.haveChanges = true
    },

    /** Called when Is Priority changes. */
    isPriority (val: boolean): void {
      // apply this flag to AR filing code only
      // simply re-add the AR code with the updated Priority flag and default Waive Fees flag
      if (this.isBComp()) {
        this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_BC, val, this.isWaiveFees)
      } else if (this.isCoop()) {
        this.updateFilingData('add', FilingCodes.ANNUAL_REPORT_OT, val, this.isWaiveFees)
      }
    },

    /** Called when Is Waive Fees changes. */
    isWaiveFees (val: boolean): void {
      // add/remove this flag to all filing codes
      this.updateFilingData(val ? 'add' : 'remove', undefined, undefined, true)
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
</style>
