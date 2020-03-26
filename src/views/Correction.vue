<template>
  <div id="correction">
    <confirm-dialog
      ref="confirm"
      attach="#correction"
    />

    <load-correction-dialog
      :dialog="loadCorrectionDialog"
      @exit="navigateToDashboard(true)"
      attach="#correction"
    />

    <resume-error-dialog
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#correction"
    />

    <save-error-dialog
      filing="Correction"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
      attach="#correction"
    />

    <payment-error-dialog
      :dialog="paymentErrorDialog"
      @exit="navigateToDashboard(true)"
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
          <article id="correction-article">
            <!-- Page Title -->
            <header>
              <h1 id="correction-header">Correction &mdash; {{title}}</h1>
              <p class="text-black">Original Filing Date: {{originalFilingDate}}</p>
            </header>

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
                <h2 id="correction-step-2-header">2. Certify</h2>
                <p>Enter the legal name of the person authorized to complete and submit this correction.</p>
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
          </article>
        </v-col>

        <v-col cols="12" lg="3" style="position: relative">
          <aside>
            <affix
              relative-element-selector="#correction-article"
              :offset="{ top: 120, bottom: 40 }"
            >
              <sbc-fee-summary
                :filingData="[...filingData]"
                :payURL="payApiUrl"
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
        <v-btn
          id="correction-save-btn"
          large
          :disabled="busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn
          id="correction-save-resume-btn"
          large
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
                id="correction-file-pay-btn"
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

        <v-btn
          id="correction-cancel-btn"
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
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, DetailComment, StaffPayment } from '@/components/common'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, LoadCorrectionDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, EnumMixin, FilingMixin, ResourceLookupMixin }
  from '@/mixins'

// Enums and Constants
import { FilingCodes, FilingNames, FilingStatus, FilingTypes } from '@/enums'
import { DASHBOARD } from '@/constants'

export default {
  name: 'Correction',

  mixins: [CommonMixin, DateMixin, EnumMixin, FilingMixin, ResourceLookupMixin],

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

      // properties for StaffPayment component
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
      saving: false, // true only when saving
      savingResuming: false, // true only when saving and resuming
      filingPaying: false, // true only when filing and paying
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
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo', 'entityFoundingDate', 'filingData']),

    ...mapGetters(['isRoleStaff']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return !this.dataLoaded && !this.loadCorrectionDialog
    },

    /** Returns title of original filing. */
    title (): string {
      if (this.origFiling && this.origFiling.header && this.origFiling.header.name) {
        return this.filingTypeToName(this.origFiling.header.name, this.agmYear)
      }
      return ''
    },

    /** Returns AGM Year of original filing (AR only). */
    agmYear (): number | null {
      if (this.origFiling && this.origFiling.annualReport && this.origFiling.annualReport.annualReportDate) {
        const date: string = this.origFiling.annualReport.annualReportDate
        return +date.slice(0, 4)
      }
      return null
    },

    /** Returns date of original filing in format "yyyy-mm-dd". */
    originalFilingDate (): string | null {
      if (this.origFiling && this.origFiling.header && this.origFiling.header.date) {
        const localDateTime: string = this.convertUTCTimeToLocalTime(this.origFiling.header.date)
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
    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    /** Returns True if page is valid, else False. */
    validated (): boolean {
      const staffPaymentValid: boolean = (!this.isRoleStaff || this.staffPaymentFormValid)
      return (staffPaymentValid && this.detailCommentValid && this.certifyFormValid)
    },

    /** True when saving, saving and resuming, or filing and paying. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    /** Returns True if payment is required, else False. */
    isPayRequired (): boolean {
      return (this.totalFee > 0)
    }
  },

  /** Called when component is created. */
  async created (): Promise<void> {
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

    // this is the id of THIS correction filing
    // if 0, this is a new correction filing
    // otherwise it's a draft correction filing
    this.filingId = +this.$route.params.filingId || 0 // number

    // this is the id of the original filing to correct
    this.correctedFilingId = +this.$route.params.correctedFilingId // number (may be NaN)

    // if required data isn't set, go back to dashboard
    if (!this.entityIncNo || isNaN(this.correctedFilingId)) {
      this.$router.push({ name: DASHBOARD })
    } else {
      this.dataLoaded = false
      this.loadingMessage = `Preparing Your Correction`
      // first fetch original filing, then fetch draft (which may overwrite some properties)
      await this.fetchOrigFiling()
      if (this.filingId > 0) {
        await this.fetchDraftFiling()
      }
      this.dataLoaded = true
    }
  },

  /** Called when component is mounted. */
  mounted (): void {
    // always include correction code
    // use default Priority and Waive Fees flags
    this.updateFilingData('add', FilingCodes.CORRECTION, this.isPriority, this.isWaiveFees)
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
    ...mapActions(['setFilingData']),

    /** Fetches the draft correction filing. */
    async fetchDraftFiling (): Promise<void> {
      const url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
      await axios.get(url).then(res => {
        if (res && res.data) {
          const filing: any = res.data.filing
          try {
            // verify data
            if (!filing) throw new Error('Missing filing')
            if (!filing.header) throw new Error('Missing header')
            if (!filing.business) throw new Error('Missing business')
            if (!filing.correction) throw new Error('Missing correction')
            if (filing.header.name !== FilingTypes.CORRECTION) throw new Error('Invalid filing type')
            if (filing.header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
            if (filing.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
            if (filing.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

            // load Certified By but not Date
            this.certifiedBy = filing.header.certifiedBy

            // load Staff Payment properties
            this.routingSlipNumber = filing.header.routingSlipNumber
            this.isPriority = filing.header.priority
            this.isWaiveFees = filing.header.waiveFees

            // load Detail Comment, removing the first line (default comment)
            const comment: string = filing.correction.comment || ''
            this.detailComment = comment.split('\n').slice(1).join('\n')
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchDraftFiling() error - ${err.message}, filing = ${filing}`)
            this.resumeErrorDialog = true
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('fetchDraftFiling() error - invalid response =', res)
          this.resumeErrorDialog = true
        }
      }).catch(err => {
        // eslint-disable-next-line no-console
        console.error('fetchDraftFiling() error =', err)
        this.resumeErrorDialog = true
      })
    },

    /** Fetches the original filing to correct. */
    async fetchOrigFiling (): Promise<void> {
      const url = `businesses/${this.entityIncNo}/filings/${this.correctedFilingId}`
      await axios.get(url).then(res => {
        if (res && res.data) {
          this.origFiling = res.data.filing
          try {
            // verify data
            if (!this.origFiling) throw new Error('Missing filing')
            if (!this.origFiling.header) throw new Error('Missing header')
            if (!this.origFiling.business) throw new Error('Missing business')
            if (this.origFiling.header.status !== FilingStatus.COMPLETED) throw new Error('Invalid filing status')
            if (this.origFiling.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
            if (this.origFiling.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

            // FUTURE:
            // use original Certified By name
            // this.certifiedBy = this.origFiling.header.certifiedBy || ''
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchOrigFiling() error - ${err.message}, origFiling =${this.origFiling}`)
            this.loadCorrectionDialog = true
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
      const filing: any = await this.saveFiling(true)
      if (filing) {
        // save Filing ID for future PUTs
        this.filingId = +filing.header.filingId // number
      }
      this.saving = false
    },

    /** Handler for Save & Resume click event. */
    async onClickSaveResume (): Promise<void> {
      // prevent double saving
      if (this.busySaving) return

      this.savingResuming = true
      const filing: any = await this.saveFiling(true)
      // on success, go to dashboard
      if (filing) {
        this.$router.push({ name: DASHBOARD })
      }
      this.savingResuming = false
    },

    /** Handler for File & Pay click event. */
    async onClickFilePay (): Promise<void> {
      // prevent double saving
      if (this.busySaving) return

      this.filingPaying = true
      const filing: any = await this.saveFiling(false) // not a draft

      // on success, redirect to Pay URL
      if (filing && filing.header) {
        const filingId: number = +filing.header.filingId

        // if this is a regular user, redirect to Pay URL
        if (!this.isRoleStaff) {
          const paymentToken: string = filing.header.paymentToken
          const baseUrl: string = sessionStorage.getItem('BASE_URL')
          const returnUrl: string = encodeURIComponent(baseUrl + '?filing_id=' + filingId)
          const authUrl: string = sessionStorage.getItem('AUTH_URL')
          const payUrl: string = authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

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

    /** Actually saves the filing. */
    async saveFiling (isDraft): Promise<any> {
      this.resetErrors()

      const hasPendingFilings: boolean = await this.hasTasks(this.entityIncNo)
      if (hasPendingFilings) {
        this.saveErrors = [
          { error: 'Another draft filing already exists. Please complete it before creating a new filing.' }
        ]
        this.saveErrorDialog = true
        return null
      }

      const header: any = {
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

      const business: any = {
        business: {
          foundingDate: this.entityFoundingDate,
          identifier: this.entityIncNo,
          legalName: this.entityName,
          legalType: this.entityType
        }
      }

      const correction: any = {
        correction: {
          correctedFilingId: this.correctedFilingId,
          correctedFilingType: this.origFiling.header.name,
          correctedFilingDate: this.originalFilingDate,
          comment: `${this.defaultComment}\n${this.detailComment}`
        }
      }

      // build filing data
      // NB: a correction to a correction is to the original data
      const data: any = {
        filing: Object.assign(
          {},
          header,
          business,
          correction
          // FUTURE: don't enable this until API is ready for it
          // this.origFiling.annualReport || {},
          // this.origFiling.changeOfDirectors || {},
          // this.origFiling.changeOfAddress || {}
        )
      }

      if (this.filingId > 0) {
        // we have a filing id, so we are updating an existing filing
        let url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
        if (isDraft) {
          url += '?draft=true'
        }
        let filing: any = null
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
        let filing: any = null
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

    /** Handler for dialog Exit click events. */
    navigateToDashboard (ignoreChanges: boolean = false) {
      if (ignoreChanges) this.haveChanges = false
      this.$router.push({ name: DASHBOARD })
    },

    /** Reset all error flags/states. */
    resetErrors (): void {
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    /** Returns True if the specified business has any pending tasks, else False. */
    async hasTasks (businessId): Promise<boolean> {
      let hasPendingItems: boolean = false
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
      // apply this flag to CRCTN filing code only
      // simply re-add the CRCTN code with the updated Priority flag and default Waive Fees flag
      this.updateFilingData('add', FilingCodes.CORRECTION, val, this.isWaiveFees)
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

  #correction-cancel-btn {
    margin-left: 0.5rem;
  }
}
</style>
