<template>
  <div id="correction">
    <confirm-dialog
      ref="confirm"
      attach="#correction"
    />

    <load-correction-dialog
      :dialog="loadCorrectionDialog"
      @exit="navigateToDashboard"
      attach="#correction"
    />

    <resume-error-dialog
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard"
      attach="#correction"
    />

    <save-error-dialog
      filing="Correction"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard"
      @retry="onClickFilePay"
      @okay="resetErrors"
      attach="#correction"
    />

    <payment-error-dialog
      :dialog="paymentErrorDialog"
      @exit="navigateToDashboard"
      attach="#correction"
    />

    <!-- Initial Page Load Transition -->
    <transition name="fade">
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" :size="50" indeterminate />
          <div class="loading-msg">{{loadingMessage}}</div>
        </div>
      </div>
    </transition>

    <v-container id="correction-container" class="view-container" v-show="dataLoaded">
      <v-row>
        <v-col cols="12" lg="9">
          <section>
            <article class="correction-article">
              <!-- Page Title -->
              <header>
                <h1 id="correction-header">Correction &mdash; {{title}}</h1>
                <p class="text-black">Original Filing Date: {{originalFilingDate}}</p>
              </header>
            </article>

            <!-- Detail -->
            <section>
              <header>
                <h2 id="correction-step-1-header">1. Detail</h2>
                <p>Enter a detail that will appear on the ledger for this entity.</p>
                <p class="black--text mb-0">{{defaultComment}}</p>
              </header>
              <detail-comment
                v-model="detailComment"
                placeholder="Add a Detail that will appear on the ledger for this entity."
                :maxLength="maxDetailCommentLength"
                @valid="detailCommentValid=$event"
              />
            </section>

            <!-- Certify -->
            <section>
              <header>
                <h2 id="correction-step-2-header">2. Certify Correct</h2>
                <p>Enter the legal name of the current director, officer, or lawyer submitting this correction.</p>
              </header>
              <certify
                :isCertified.sync="isCertified"
                :certifiedBy.sync="certifiedBy"
                :entityDisplay="displayName()"
                :message="certifyText(FilingCodes.ANNUAL_REPORT_OT)"
                @valid="certifyFormValid=$event"
              />
            </section>

            <!-- Staff Payment -->
            <section v-if="isRoleStaff">
              <header>
                <h2 id="correction-step-3-header">3. Staff Payment</h2>
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
            <affix relative-element-selector=".correction-article" :offset="{ top: 120, bottom: 40 }">
              <sbc-fee-summary
                :filingData="[...filingData]"
                :payURL="payAPIURL"
                @total-fee="totalFee=$event"
              />
            </affix>
          </aside>
        </v-col>
      </v-row>
    </v-container>

    <!-- Buttons -->
    <v-container
      id="correction-buttons-container"
      class="list-item"
    >
      <div class="buttons-left">
        <!-- NB: no saving drafts in Corrections 1.0 -->
        <!-- <v-btn id="ar-save-btn" large
          :disabled="!isSaveButtonEnabled || busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn> -->
        <!-- <v-btn id="ar-save-resume-btn" large
          :disabled="!isSaveButtonEnabled || busySaving"
          :loading="savingResuming"
          @click="onClickSaveResume()"
        >
          <span>Save &amp; Resume Later</span>
        </v-btn> -->
      </div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff">
          <template v-slot:activator="{ on }">
            <div v-on="on" class="d-inline">
              <v-btn
                id="ar-file-pay-btn"
                color="primary"
                large
                :disabled="!validated || busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                <span>{{ isPayRequired ? "File &amp; Pay" : "File" }}</span>
              </v-btn>
            </div>
          </template>
          <span>Ensure all of your information is entered correctly before you File.<br>
            There is no opportunity to change information beyond this point.</span>
        </v-tooltip>

        <v-btn id="ar-cancel-btn" large to="/dashboard" :disabled="busySaving || filingPaying">Cancel</v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
// Libraries
import axios from '@/axios-auth'
import { mapState, mapGetters } from 'vuex'
import { BAD_REQUEST, PAYMENT_REQUIRED } from 'http-status-codes'

// Components
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, DetailComment, StaffPayment } from '@/components/common'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, LoadCorrectionDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'

// Mixins
import { DateMixin, EntityFilterMixin, ResourceLookupMixin } from '@/mixins'

// Interfaces
import { FilingData } from '@/interfaces'

// Enums
import { FilingCodes, FilingNames, FilingStatus, FilingTypes } from '@/enums'

export default {
  name: 'Correction',

  mixins: [DateMixin, EntityFilterMixin, ResourceLookupMixin],

  components: {
    Certify,
    DetailComment,
    StaffPayment,
    SbcFeeSummary,
    ConfirmDialog,
    PaymentErrorDialog,
    LoadCorrectionDialog,
    ResumeErrorDialog,
    SaveErrorDialog
  },

  data () {
    return {
      // properties for DetailComment component
      detailComment: '',
      detailCommentValid: null,

      // properties for Certify component
      certifiedBy: '',
      isCertified: false,
      certifyFormValid: null,

      // properties for Staff Payment component
      routingSlipNumber: '',
      isPriority: false,
      isWaiveFees: false,
      staffPaymentFormValid: null,
      totalFee: 0,

      // flags for displaying dialogs
      loadCorrectionDialog: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,

      // other program state
      dataLoaded: false,
      loadingMessage: 'Loading...', // initial generic message
      filingId: 0, // id of this correction filing
      correctedFilingId: 0, // id of filing to correct
      origFiling: null, // copy of original filing
      filingData: [] as Array<FilingData>,
      saving: false,
      savingResuming: false,
      filingPaying: false,
      haveChanges: false,
      saveErrors: [],
      saveWarnings: [],

      // enums
      FilingCodes,
      FilingNames,
      FilingStatus,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo', 'entityFoundingDate']),

    ...mapGetters(['isRoleStaff']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return !this.dataLoaded && !this.loadCorrectionDialog
    },

    /** Returns title of original filing. */
    title (): string | null {
      if (this.origFiling && this.origFiling.header && this.origFiling.header.name) {
        switch (this.origFiling.header.name) {
          case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (this.agmYear ? ` (${this.agmYear})` : '')
          case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.ADDRESS_CHANGE
          case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.DIRECTOR_CHANGE
          case FilingTypes.CHANGE_OF_NAME: return FilingNames.LEGAL_NAME_CHANGE
          case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
          case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
          case FilingTypes.CORRECTION: return FilingNames.CORRECTION
        }
        // fallback for unknown filings
        return this.origFiling.header.name.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
      }
      return null
    },

    /** Returns AGM Year of original filing (AR only). */
    agmYear (): number | null {
      if (this.origFiling && this.origFiling.annualReport && this.origFiling.annualReport.annualReportDate) {
        const date = this.origFiling.annualReport.annualReportDate
        return +date.slice(0, 4)
      }
      return null
    },

    /** Returns date of original filing in format "yyyy-mm-dd". */
    originalFilingDate (): string | null {
      if (this.origFiling && this.origFiling.header && this.origFiling.header.date) {
        const localDateTime = this.convertUTCTimeToLocalTime(this.origFiling.header.date)
        return localDateTime.split(' ')[0]
      }
      return null
    },

    /** Returns default comment (ie, the first line of the detail comment). */
    defaultComment (): string {
      return `Correction for ${this.title}. Filed on ${this.originalFilingDate}.`
    },

    /** Returns maximum length of detail comment. */
    maxDetailCommentLength (): number {
      // = (max size in db) - (default comment length) - (Carriage Return)
      return 4096 - this.defaultComment.length - 1
    },

    /** Returns Pay API URL. */
    payAPIURL (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    /** Returns True if form is valid, else False. */
    validated (): boolean {
      // TODO: handle Priority and No Fee
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)
      return (staffPaymentValid && this.detailCommentValid && this.certifyFormValid)
    },

    /** Returns True if page is busy saving, else False. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    /** Returns True if Save button should be enabled, else False. */
    isSaveButtonEnabled (): boolean {
      return true // FUTURE: add necessary logic here
    },

    /** Returns True if payment is required, else False. */
    isPayRequired (): boolean {
      return (this.totalFee > 0)
    }
  },

  /** Called when component is created. */
  created (): void {
    // before unloading this page, if there are changes then prompt user
    window.onbeforeunload = (event) => {
      if (this.haveChanges) {
        event.preventDefault()
        // NB: custom text is not supported in all browsers
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }
    // NB: this is the id of the filing to correct
    this.correctedFilingId = +this.$route.params.id // number (may be NaN, which is false)

    // if required data isn't set, route to home
    if (!this.entityIncNo || !this.correctedFilingId) {
      this.$router.push('/')
    } else {
      this.loadingMessage = `Preparing Your Correction`
      this.fetchOrigFiling()
    }
  },

  /** Called when component is mounted. */
  mounted (): void {
    // always include correction code
    this.toggleFiling('add', FilingCodes.CORRECTION)
  },

  /** Called before routing away from this component. */
  beforeRouteLeave (to, from, next): void {
    if (!this.haveChanges) {
      // no changes -- resolve promise right away
      next()
      return
    }

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Unsaved Changes',
      'You have unsaved changes in your Correction. Do you want to exit your filing?',
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
    /** Fetches the original filing to correct. */
    fetchOrigFiling (): void {
      this.dataLoaded = false

      const url = this.entityIncNo + '/filings/' + this.correctedFilingId
      axios.get(url).then(res => {
        if (res && res.data) {
          this.origFiling = res.data.filing
          try {
            // verify data
            if (!this.origFiling) throw new Error('missing filing')
            if (!this.origFiling.header) throw new Error('missing header')
            if (!this.origFiling.business) throw new Error('missing business')
            if (this.origFiling.header.status !== FilingStatus.COMPLETED) throw new Error('invalid filing status')
            if (this.origFiling.business.identifier !== this.entityIncNo) throw new Error('invalid business identifier')
            if (this.origFiling.business.legalName !== this.entityName) throw new Error('invalid business legal name')

            // use original Certified By name
            this.certifiedBy = this.origFiling.header.certifiedBy || ''
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchOrigFiling() error - ${err.message}, origFiling =`, this.origFiling)
            this.loadCorrectionDialog = true
          } finally {
            this.dataLoaded = true
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('fetchOrigFiling() error - invalid response =', res)
          this.loadCorrectionDialog = true
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.error('fetchOrigFiling() error =', error)
        this.loadCorrectionDialog = true
      })
    },

    /** Handler for Save click event. */
    async onClickSave (): Promise<void> {
      // prevent double saving
      if (this.busySaving) return

      this.saving = true
      const filing = await this.saveFiling(true)
      if (filing) {
        // save Filing ID for future PUTs
        this.filingId = +filing.header.filingId
      }
      this.saving = false
    },

    /** Handler for Save & Resume click event. */
    async onClickSaveResume (): Promise<void> {
      // prevent double saving
      if (this.busySaving) return

      this.savingResuming = true
      const filing = await this.saveFiling(true)
      // on success, route to Home URL
      if (filing) {
        this.$router.push('/')
      }
      this.savingResuming = false
    },

    /** Handler for File & Pay click event. */
    async onClickFilePay (): Promise<void> {
      // prevent double saving
      if (this.busySaving) return

      this.filingPaying = true
      const filing = await this.saveFiling(false) // not a draft

      // on success, redirect to Pay URL
      if (filing && filing.header) {
        const filingId = +filing.header.filingId

        // if this is a regular user, redirect to Pay URL
        if (!this.isRoleStaff) {
          const paymentToken = filing.header.paymentToken
          const baseUrl = sessionStorage.getItem('BASE_URL')
          const returnURL = encodeURIComponent(baseUrl + 'dashboard?filing_id=' + filingId)
          const authUrl = sessionStorage.getItem('AUTH_URL')
          const payURL = authUrl + 'makepayment/' + paymentToken + '/' + returnURL

          // assume Pay URL is always reachable
          // otherwise, user will have to retry payment later
          window.location.assign(payURL)
        } else {
          // route directly to dashboard
          this.$router.push('/dashboard?filing_id=' + filingId)
        }
      }
      this.filingPaying = false
    },

    /** Method to save the filing. */
    async saveFiling (isDraft): Promise<any> {
      this.resetErrors()

      const hasPendingFilings = await this.hasTasks(this.entityIncNo)
      if (hasPendingFilings) {
        this.saveErrors = [
          { error: 'Another draft filing already exists. Please complete it before creating a new filing.' }
        ]
        this.saveErrorDialog = true
        return null
      }

      const header = {
        header: {
          name: 'correction',
          certifiedBy: this.certifiedBy,
          email: 'no_one@never.get',
          date: this.currentDate
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
          legalName: this.entityName,
          legalType: this.entityType
        }
      }

      const correction = {
        correction: {
          correctedFilingId: this.correctedFilingId,
          correctedFilingType: this.origFiling.header.name,
          correctedFilingDate: this.originalFilingDate,
          comment: `${this.defaultComment}\n${this.detailComment}`
        }
      }

      // FUTURE: save new filing data
      // NB: a correction to a correction is to the original data
      let annualReport, changeOfDirectors, changeOfAddress
      if (this.origFiling.annualReport) {
        annualReport = {}
      } else if (this.origFiling.changeOfDirectors) {
        changeOfDirectors = {}
      } else if (this.origFiling.changeOfAddress) {
        changeOfAddress = {}
      } else {
        throw new Error('Invalid correction type')
      }

      const data = {
        filing: Object.assign(
          {},
          header,
          business,
          correction,
          // TODO: need fallback values for these?
          annualReport,
          changeOfDirectors,
          changeOfAddress
        )
      }

      if (this.filingId > 0) {
        // we have a filing id, so we are updating an existing filing
        let url = this.entityIncNo + '/filings/' + this.filingId
        if (isDraft) {
          url += '?draft=true'
        }
        let filing = null
        await axios.put(url, data).then(res => {
          if (!res || !res.data || !res.data.filing) {
            throw new Error('invalid API response')
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
        let url = this.entityIncNo + '/filings'
        if (isDraft) {
          url += '?draft=true'
        }
        let filing = null
        await axios.post(url, data).then(res => {
          if (!res || !res.data || !res.data.filing) {
            throw new Error('invalid API response')
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

    /** Method to add/update or remove the specified filing code. */
    toggleFiling (addRemove, code): void {
      // remove code if it already exists
      for (let i = 0; i < this.filingData.length; i++) {
        if (this.filingData[i].filingTypeCode === code) {
          this.filingData.splice(i, 1)
          break
        }
      }
      // (re)add code
      if (addRemove === 'add') {
        this.filingData.push({
          filingTypeCode: code,
          entityType: this.entityType,
          priority: this.isPriority,
          waiveFees: this.isWaiveFees,
          futureEffective: false
        })
      }
    },

    /** Handler for Exit click event. */
    navigateToDashboard (): void {
      this.haveChanges = false
      this.dialog = false
      this.$router.push('/dashboard')
    },

    /** Method to reset all error flags/states. */
    resetErrors (): void {
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    /** Returns True if the specified business has any pending tasks, else False. */
    async hasTasks (businessId): Promise<boolean> {
      let hasPendingItems = false
      if (this.filingId === 0) {
        await axios.get(businessId + '/tasks')
          .then(response => {
            if (response && response.data && response.data.tasks) {
              response.data.tasks.forEach((task) => {
                if (task.task && task.task.filing &&
                  task.task.filing.header && task.task.filing.header.status !== 'NEW') {
                  hasPendingItems = true
                }
              })
            }
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('fetchData() error =', error)
            this.saveErrorDialog = true
          })
      }
      return hasPendingItems
    }
  },

  watch: {
    /** Called when Detail Comment component validity changes.  */
    detailCommentValid (val: boolean): void {
      this.haveChanges = true
    },

    /** Called when Certify form validity changes.  */
    certifyFormValid (val: boolean): void {
      this.haveChanges = true
    },

    /** Called when Staff Payment form validity changes.  */
    staffPaymentFormValid (val: boolean): void {
      this.haveChanges = true
    },

    /** Called when Is Priority changes. */
    isPriority (val: boolean): void {
      this.toggleFiling('add', FilingCodes.CORRECTION)
    },

    /** Called when Is Waive Fees changes. */
    isWaiveFees (val: boolean): void {
      this.toggleFiling('add', FilingCodes.CORRECTION)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.text-black {
  color: rgba(0,0,0,.87);
}

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
#correction-buttons-container {
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
