<template>
  <div id="standalone-directors">
    <confirm-dialog
      attach="#standalone-directors"
      ref="confirm"
    />

    <fetch-error-dialog
      attach="#standalone-directors"
      :dialog="fetchErrorDialog"
      @exit="navigateToDashboard(true)"
    />

    <resume-error-dialog
      attach="#standalone-directors"
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
    />

    <save-error-dialog
      attach="#standalone-directors"
      filingName="Change of Directors"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
    />

    <payment-error-dialog
      attach="#standalone-directors"
      filingName="Change of Directors"
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

    <!-- Change of Directors Filing -->
    <v-fade-transition hide-on-leave>
      <div v-show="!inFilingReview">
        <v-container id="standalone-directors-container" class="view-container">
          <v-row>
            <v-col cols="12" lg="9">
              <article id="standalone-directors-article">
                <header>
                  <h1 id="filing-header">Director Change</h1>
                  <p>Select the date of your director changes. If you have director changes that occurred on
                      different dates, you will need to perform multiple Director Change filings &mdash;
                      one for each unique date.</p>

                  <v-alert type="info" outlined
                    v-if="!isBComp"
                    icon="mdi-information"
                    class="white-background"
                  >
                    <span>Director changes can be made as far back as {{earliestDateToSet}}.</span>
                  </v-alert>
                </header>

                <section>
                  <cod-date
                    :initialCODDate="initialCODDate"
                    @codDate="codDate=$event"
                    @valid="codDateValid=$event"
                  />
                </section>

                <!-- Director Information -->
                <section>
                  <directors
                    ref="directorsComponent"
                    :directors.sync="updatedDirectors"
                    @directorsPaidChange="directorsPaidChange"
                    @directorsFreeChange="directorsFreeChange"
                    @directorFormValid="directorFormValid=$event"
                    @directorEditAction="directorEditInProgress=$event"
                    @earliestDateToSet="earliestDateToSet=$event"
                    @complianceDialogMsg="complianceDialogMsg=$event"
                  />
                </section>

                <!-- Certify -->
                <section>
                  <header>
                    <h2 id="AR-step-4-header">Certify</h2>
                    <p>Enter the legal name of the person authorized to complete and submit this
                      Director Change.</p>
                  </header>
                  <certify
                    :isCertified.sync="isCertified"
                    :certifiedBy.sync="certifiedBy"
                    :entityDisplay="displayName()"
                    :message="certifyText(feeCode)"
                    @valid="certifyFormValid=$event"
                  />
                </section>

                <!-- Staff Payment -->
                <section v-if="isRoleStaff">
                  <header>
                    <h2 id="AR-step-5-header">Staff Payment</h2>
                  </header>
                  <staff-payment
                    :staffPaymentData.sync="staffPaymentData"
                    @valid="staffPaymentFormValid=$event"
                  />
                </section>
              </article>
            </v-col>

            <!-- Fee Summary -->
            <v-col cols="12" lg="3" style="position: relative">
              <aside>
                <affix
                  relative-element-selector="#standalone-directors-article"
                  :offset="{ top: 120, bottom: 40 }"
                >
                  <sbc-fee-summary
                    :filingData="filingData"
                    :payURL="payApiUrl"
                    @total-fee="totalFee=$event"
                  />
                </affix>
              </aside>
            </v-col>
          </v-row>
        </v-container>

        <!-- FUTURE: this container should have some container class not 'list-item' class -->
        <v-container id="standalone-directors-buttons-container" class="list-item">
          <div class="buttons-left">
            <v-btn
              id="cod-save-btn"
              large
              :disabled="busySaving"
              :loading="saving"
              @click="onClickSave()"
            >
              <span>Save</span>
            </v-btn>
            <v-btn
              id="cod-save-resume-btn"
              large
              :disabled="busySaving"
              :loading="savingResuming"
              @click="onClickSaveResume()"
            >
              <span>Save and Resume Later</span>
            </v-btn>
          </div>

          <div class="buttons-right">
            <v-tooltip top color="#3b6cff">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline">
                  <v-btn
                    id="cod-next-btn"
                    color="primary"
                    large
                    :disabled="!validated || busySaving"
                    @click="showSummary()"
                  >
                    <span>Next</span>
                  </v-btn>
                </div>
              </template>
              <span>Proceed to Filing Summary</span>
            </v-tooltip>

            <v-btn
              id="cod-cancel-btn"
              large
              :disabled="busySaving"
              @click="navigateToDashboard()"
            >
              <span>Cancel</span>
            </v-btn>
          </div>
        </v-container>
      </div>
    </v-fade-transition>

    <!-- Change of Directors Filing Summary -->
    <v-fade-transition hide-on-leave>
      <div v-show="inFilingReview">
        <v-container id="standalone-directors-container-review" class="view-container">
          <v-row>
            <v-col cols="12" lg="9">
              <article id="standalone-directors-article-review">
                <header>
                  <h1 id="filing-header-review">Review: Director Change </h1>
                </header>
                <section v-if="complianceDialogMsg">
                  <v-alert type="info" outlined
                    icon="mdi-information"
                    class="white-background"
                  >
                    <p class="complianceDialogMsg mb-0">{{complianceDialogMsg.msg}}</p>
                  </v-alert>
                </section>

                <!-- Director Information -->
                <section>
                  <summary-directors
                    :directors="updatedDirectors"
                  />
                </section>

                <!-- Certify -->
                <section>
                  <header>
                    <h2>Certify</h2>
                  </header>
                  <summary-certify
                    :isCertified.sync="isCertified"
                    :certifiedBy.sync="certifiedBy"
                    :entityDisplay="displayName()"
                    :message="certifyText(feeCode)"
                    @valid="certifyFormValid=$event"
                  />
                </section>

                <!-- Staff Payment -->
                <section v-if="isRoleStaff">
                  <header>
                    <h2>Staff Payment</h2>
                  </header>
                  <summary-staff-payment
                    :staffPaymentData="staffPaymentData"
                  />
                </section>
              </article>
            </v-col>

            <!-- Fee Summary -->
            <v-col cols="12" lg="3" style="position: relative">
              <aside>
                <affix
                  relative-element-selector="#standalone-directors-article-review"
                  :offset="{ top: 120, bottom: 40 }"
                >
                  <sbc-fee-summary
                    :filingData="filingData"
                    :payURL="payApiUrl"
                  />
                </affix>
              </aside>
            </v-col>
          </v-row>
        </v-container>

        <!-- FUTURE: this container should have some container class not 'list-item' class -->
        <v-container id="standalone-directors-buttons-container-review" class="list-item">
          <div class="buttons-left">
            <v-btn
              id="cod-back-btn"
              large
              :disabled="busySaving"
              @click="returnToFiling()"
            >
              <span>Back</span>
            </v-btn>
          </div>

          <div class="buttons-right">
            <v-tooltip top color="#3b6cff">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline">
                  <v-btn
                    id="cod-file-pay-btn"
                    color="primary"
                    large
                    :disabled="!validated || busySaving"
                    :loading="filingPaying"
                    @click="onClickFilePay()"
                  >
                    <span>{{isPayRequired ? "File and Pay" : "File"}}</span>
                  </v-btn>
                </div>
              </template>
              <span>Ensure all of your information is entered correctly before you File.<br>
                There is no opportunity to change information beyond this point.</span>
            </v-tooltip>
          </div>

          <v-btn
            id="cod-cancel-btn"
            large
            :disabled="busySaving"
            @click="navigateToDashboard()"
          >
            <span>Cancel</span>
          </v-btn>
        </v-container>
      </div>
    </v-fade-transition>
  </div>
</template>

<script lang="ts">
// Libraries
import axios from '@/axios-auth'
import { mapActions, mapState, mapGetters } from 'vuex'
import { PAYMENT_REQUIRED } from 'http-status-codes'
import { isEmpty } from 'lodash'

// Components
import CodDate from '@/components/StandaloneDirectorChange/CODDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, StaffPayment, SummaryDirectors, SummaryCertify, SummaryStaffPayment }
  from '@/components/common'

// Dialog Components
import { ConfirmDialog, FetchErrorDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'

// Enums and Interfaces
import { FilingCodes, FilingStatus, FilingTypes, Routes, StaffPaymentOptions } from '@/enums'
import { StaffPaymentIF } from '@/interfaces'

export default {
  name: 'StandaloneDirectorsFiling',

  components: {
    CodDate,
    Directors,
    SummaryDirectors,
    SummaryCertify,
    SummaryStaffPayment,
    SbcFeeSummary,
    Certify,
    StaffPayment,
    ConfirmDialog,
    PaymentErrorDialog,
    FetchErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog
  },

  mixins: [CommonMixin, DateMixin, FilingMixin, ResourceLookupMixin],

  data () {
    return {
      updatedDirectors: [],
      fetchErrorDialog: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,
      earliestDateToSet: 'your last filing', // default
      inFilingReview: false,
      isCertified: false,
      certifiedBy: '',
      certifyFormValid: false,
      directorFormValid: true,
      directorEditInProgress: false,
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
      initialCODDate: '',
      codDate: null,
      codDateValid: false,
      complianceDialogMsg: null,
      totalFee: 0,

      // properties for StaffPayment component
      staffPaymentData: { option: StaffPaymentOptions.NONE } as StaffPaymentIF,
      staffPaymentFormValid: null,

      // enums in template
      FilingCodes,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo', 'entityFoundingDate', 'filingData']),

    ...mapGetters(['isBComp', 'isRoleStaff']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded && !this.fetchErrorDialog && !this.resumeErrorDialog &&
        !this.saveErrorDialog && !this.paymentErrorDialog)
    },

    validated (): boolean {
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)
      const filingDataValid = (this.filingData.length > 0)

      return (staffPaymentValid && this.certifyFormValid && this.directorFormValid && filingDataValid &&
        !this.directorEditInProgress && this.codDateValid)
    },

    /** True when saving, saving and resuming, or filing and paying. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    /** The Pay API URL string. */
    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    /** The Auth URL string. */
    authUrl (): string {
      return sessionStorage.getItem('AUTH_URL')
    },

    /** The Base URL string. */
    baseUrl (): string {
      return sessionStorage.getItem('BASE_URL')
    },

    isPayRequired (): boolean {
      // FUTURE: modify rule here as needed
      return (this.totalFee > 0)
    },

    /** The Director Change fee code based on entity type. */
    feeCode (): FilingCodes {
      return this.isBComp ? FilingCodes.DIRECTOR_CHANGE_BC : FilingCodes.DIRECTOR_CHANGE_OT
    },

    /** The Free Director Change fee code based on entity type. */
    freeFeeCode (): FilingCodes {
      return this.isBComp ? FilingCodes.FREE_DIRECTOR_CHANGE_BC : FilingCodes.FREE_DIRECTOR_CHANGE_OT
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

  async mounted (): Promise<void> {
    // if tombstone data isn't set, go back to dashboard
    if (!this.entityIncNo || isNaN(this.filingId)) {
      console.log('Standalone Directors Filing error - missing Entity Inc No or Filing ID!')
      this.$router.push({ name: Routes.DASHBOARD })
      return // don't continue
    }

    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    this.$nextTick(async () => {
      // initial value
      // may be overwritten by resumed draft
      this.initialCODDate = this.currentDate

      if (this.filingId > 0) {
        // resume draft filing
        this.loadingMessage = 'Resuming Your Director Change'
        await this.fetchDraftFiling()
        // fetch original directors
        // update working data only if it wasn't in the draft
        if (!this.isJestRunning) {
          await this.$refs.directorsComponent.getOrigDirectors(this.initialCODDate, isEmpty(this.updatedDirectors))
        }
      } else {
        // this is a new filing
        this.loadingMessage = 'Preparing Your Director Change'
        // fetch original directors + update working data
        if (!this.isJestRunning) {
          await this.$refs.directorsComponent.getOrigDirectors(this.initialCODDate, true)
        }
      }

      this.dataLoaded = true
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
      'You have unsaved changes in your Change of Directors. Do you want to exit your filing?',
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
      const url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
      await axios.get(url).then(async response => {
        const filing: any = response?.data?.filing

        // verify data
        if (!filing) throw new Error('Missing filing')
        if (!filing.header) throw new Error('Missing header')
        if (!filing.business) throw new Error('Missing business')
        if (filing.header.name !== FilingTypes.CHANGE_OF_DIRECTORS) throw new Error('Invalid filing type')
        if (filing.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
        if (filing.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

        // restore Certified By (but not Date)
        this.certifiedBy = filing.header.certifiedBy

        // restore Staff Payment data
        if (filing.header.routingSlipNumber) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.FAS,
            routingSlipNumber: filing.header.routingSlipNumber,
            isPriority: filing.header.priority
          }
        } else if (filing.header.bcolAccountNumber) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.BCOL,
            bcolAccountNumber: filing.header.bcolAccountNumber,
            datNumber: filing.header.datNumber,
            folioNumber: filing.header.folioNumber,
            isPriority: filing.header.priority
          }
        } else if (filing.header.waiveFees) {
          this.staffPaymentData = {
            option: StaffPaymentOptions.NO_FEE
          }
        } else {
          this.staffPaymentData = {
            option: StaffPaymentOptions.NONE
          }
        }

        // restore COD Date
        if (filing.header.effectiveDate) {
          this.initialCODDate = this.apiToSimpleDateTime(filing.header.effectiveDate).slice(0, 10)
        } else if (filing.header.date) {
          this.initialCODDate = this.apiToSimpleDateTime(filing.header.date).slice(0, 10)
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
    },

    directorsPaidChange (modified: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      // when directors change, update filing data
      // use existing Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', this.feeCode, this.staffPaymentData.isPriority,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    },

    directorsFreeChange (modified: boolean) {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      // when directors change (free filing), update filing data
      // use existing Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', this.freeFeeCode,
        this.staffPaymentData.isPriority, (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
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

      const hasPendingFilings = await this.hasTasks(this.entityIncNo)
      if (hasPendingFilings) {
        this.saveErrors = [
          { error: 'Another draft filing already exists. Please complete it before creating a new filing.' }
        ]
        this.saveErrorDialog = true
        return null
      }

      let changeOfDirectors = null

      const header = {
        header: {
          name: FilingTypes.CHANGE_OF_DIRECTORS,
          certifiedBy: this.certifiedBy || '',
          email: 'no_one@never.get',
          date: this.currentDate, // NB: API will reassign this date according to its clock
          effectiveDate: this.simpleDateToApi(this.codDate)
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

      const business = {
        business: {
          foundingDate: this.entityFoundingDate,
          identifier: this.entityIncNo,
          legalName: this.entityName
        }
      }

      if (this.hasFilingCode(this.feeCode) || this.hasFilingCode(this.freeFeeCode)) {
        changeOfDirectors = {
          changeOfDirectors: {
            directors: this.updatedDirectors
          }
        }
      }

      const data = {
        filing: Object.assign(
          {},
          header,
          business,
          changeOfDirectors
        )
      }

      try {
        let response

        if (this.filingId > 0) {
          // we have a filing id, so update (put) an existing filing
          let url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
          if (isDraft) { url += '?draft=true' }
          response = await axios.put(url, data)
        } else {
          // filing id is 0, so create (post) a new filing
          let url = `businesses/${this.entityIncNo}/filings`
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
    },

    resetErrors (): void {
      this.paymentErrorDialog = false
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    hasAction (director, action): boolean {
      return (director.actions.indexOf(action) >= 0)
    },

    /**
      * Local method to change the state of the view and render the summary content
      * & relocate window to the top of page
      */
    showSummary (): void {
      this.inFilingReview = true
      document.body.scrollTop = 0 // For Safari
      document.documentElement.scrollTop = 0 // For Chrome, Firefox and IE
    },

    /** Local method to change the state of the view and render the editable directors list. */
    returnToFiling (): void {
      this.inFilingReview = false
      document.body.scrollTop = 0 // For Safari
      document.documentElement.scrollTop = 0 // For Chrome, Firefox and IE
    },

    /** Returns True if the specified business has any pending tasks, else False. */
    async hasTasks (businessId): Promise<boolean> {
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
            console.log('hasTasks() error =', error)
            this.saveErrorDialog = true
          })
      }
      return hasPendingItems
    }
  },

  watch: {
    async codDate () {
      // ignore changes before data is loaded
      if (!this.dataLoaded) return null

      // fetch original directors with new date + update working data
      // (this will overwrite the current data)
      this.isFetching = true
      if (!this.isJestRunning) {
        await this.$refs.directorsComponent.getOrigDirectors(this.codDate, true)
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
  font-size: 1rem;
  color: $gray7;
}

.loading-container.grayed-out {
  // these are the same styles as dialog overlay:
  opacity: 0.46;
  background-color: rgb(33, 33, 33); // grey darken-4
  border-color: rgb(33, 33, 33); // grey darken-4
}
</style>
