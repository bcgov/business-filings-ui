<template>
  <div id="correction">
    <ConfirmDialog
      attach="#correction"
      ref="confirm"
    />

    <LoadCorrectionDialog
      attach="#correction"
      :dialog="loadCorrectionDialog"
      @exit="navigateToDashboard(true)"
    />

    <ResumeErrorDialog
      attach="#correction"
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
    />

    <SaveErrorDialog
      attach="#correction"
      filingName="Correction"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
    />

    <PaymentErrorDialog
      attach="#correction"
      filingName="Correction"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
    />

    <!-- Initial Page Load Transition -->
    <v-fade-transition>
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" :size="50" indeterminate />
          <div class="loading-msg">{{loadingMessage}}</div>
        </div>
      </div>
    </v-fade-transition>

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
              <DetailComment
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
              <Certify
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
              <StaffPayment
                :staffPaymentData.sync="staffPaymentData"
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
          <span>Save and Resume Later</span>
        </v-btn>
      </div>

      <div class="buttons-right">
        <v-tooltip top color="#3b6cff" content-class="top-tooltip">
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
                {{ isPayRequired ? "File and Pay" : "File" }}
              </v-btn>
            </div>
          </template>
          Ensure all of your information is entered correctly before you File.<br>
          There is no opportunity to change information beyond this point.
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
import { PAYMENT_REQUIRED } from 'http-status-codes'

// Components
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, DetailComment, StaffPayment } from '@/components/common'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, LoadCorrectionDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, EnumMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'

// Enums and Interfaces
import { FilingCodes, FilingNames, FilingStatus, FilingTypes, Routes, StaffPaymentOptions } from '@/enums'
import { StaffPaymentIF } from '@/interfaces'

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
      staffPaymentData: { option: StaffPaymentOptions.NONE } as StaffPaymentIF,
      staffPaymentFormValid: null,

      // flags for displaying dialogs
      loadCorrectionDialog: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,

      // other program state
      totalFee: 0,
      dataLoaded: false,
      loadingMessage: '',
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
    ...mapState(['entityFoundingDate', 'filingData']),

    ...mapGetters(['isRoleStaff', 'getCurrentDate', 'getEntityType', 'getEntityName', 'getIdentifier']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return !this.dataLoaded && !this.loadCorrectionDialog
    },

    /** Returns title of original filing. */
    title (): string {
      if (this.origFiling?.header?.name) {
        return this.filingTypeToName(this.origFiling.header.name as FilingTypes, this.agmYear)
      }
      return ''
    },

    /** Returns AGM Year of original filing (AR only). */
    agmYear (): number | null {
      if (this.origFiling?.annualReport?.annualReportDate) {
        const date: string = this.origFiling.annualReport.annualReportDate
        return +date.slice(0, 4)
      }
      return null
    },

    /**
     * Returns date of original filing.
     * @returns for example, "Dec 23, 2018"
     */
    originalFilingDate (): string {
      if (this.origFiling?.header?.date) {
        return this.apiToPacificDate(this.origFiling.header.date)
      }
      return 'Unknown' // should never happen
    },

    /** Returns default comment (ie, the first line of the detail comment). */
    defaultComment (): string {
      return `Correction for ${this.title}, filed on ${this.originalFilingDate}.`
    },

    /** Returns maximum length of detail comment. */
    maxDetailCommentLength (): number {
      // = (max size in db) - (default comment length) - (Carriage Return)
      return 4096 - this.defaultComment.length - 1
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

    // this is the id of THIS correction filing
    // if 0, this is a new correction filing
    // otherwise it's a draft correction filing
    this.filingId = +this.$route.params.filingId || 0 // number

    // this is the id of the original filing to correct
    this.correctedFilingId = +this.$route.params.correctedFilingId // number (may be NaN)

    // if required data isn't set, go back to dashboard
    if (!this.getIdentifier || isNaN(this.correctedFilingId)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  },

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    this.$nextTick(async () => {
      if (this.filingId > 0) {
        this.loadingMessage = `Resuming Your Correction`
      } else {
        this.loadingMessage = `Preparing Your Correction`
      }

      // first fetch original filing
      // then fetch draft (which may overwrite some properties)
      await this.fetchOrigFiling()
      if (this.filingId > 0) {
        await this.fetchDraftFiling()
      }

      this.dataLoaded = true

      // always include correction code
      // use existing Priority and Waive Fees flags
      this.updateFilingData('add', FilingCodes.CORRECTION, this.staffPaymentData.isPriority,
        (this.staffPaymentData.option === StaffPaymentOptions.NO_FEE))
    })
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
      const url = `businesses/${this.getIdentifier}/filings/${this.filingId}`
      await axios.get(url).then(res => {
        const filing: any = res?.data?.filing

        // verify data
        if (!filing) throw new Error('Missing filing')
        if (!filing.header) throw new Error('Missing header')
        if (!filing.business) throw new Error('Missing business')
        if (!filing.correction) throw new Error('Missing correction')
        if (filing.header.name !== FilingTypes.CORRECTION) throw new Error('Invalid filing type')
        if (filing.header.status !== FilingStatus.DRAFT) throw new Error('Invalid filing status')
        if (filing.business.identifier !== this.getIdentifier) throw new Error('Invalid business identifier')
        if (filing.business.legalName !== this.getEntityName) throw new Error('Invalid business legal name')

        // load Certified By (but not Date)
        this.certifiedBy = filing.header.certifiedBy

        // load Staff Payment properties
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

        // load Detail Comment, removing the first line (default comment)
        const comment: string = filing.correction.comment || ''
        this.detailComment = comment.split('\n').slice(1).join('\n')
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDraftFiling() error =', error)
        this.resumeErrorDialog = true
      })
    },

    /** Fetches the original filing to correct. */
    async fetchOrigFiling (): Promise<void> {
      const url = `businesses/${this.getIdentifier}/filings/${this.correctedFilingId}`
      await axios.get(url).then(res => {
        this.origFiling = res?.data?.filing

        // verify data
        if (!this.origFiling) throw new Error('Missing filing')
        if (!this.origFiling.header) throw new Error('Missing header')
        if (!this.origFiling.business) throw new Error('Missing business')
        if (this.origFiling.header.status !== FilingStatus.COMPLETED) throw new Error('Invalid filing status')
        if (this.origFiling.business.identifier !== this.getIdentifier) throw new Error('Invalid business identifier')
        if (this.origFiling.business.legalName !== this.getEntityName) throw new Error('Invalid business legal name')

        // FUTURE:
        // use original Certified By name
        // this.certifiedBy = this.origFiling.header.certifiedBy || ''
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchOrigFiling() error =', error)
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
        this.$router.push({ name: Routes.DASHBOARD })
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
          const returnUrl: string = encodeURIComponent(this.baseUrl + '?filing_id=' + filingId)
          const payUrl: string = this.authUrl + 'makepayment/' + paymentToken + '/' + returnUrl

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

    /** Actually saves the filing. */
    async saveFiling (isDraft): Promise<any> {
      this.resetErrors()

      const hasPendingFilings: boolean = await this.hasTasks(this.getIdentifier)
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
          date: this.getCurrentDate // NB: API will reassign this date according to its clock
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
          foundingDate: this.dateToApi(this.entityFoundingDate),
          identifier: this.getIdentifier,
          legalName: this.getEntityName,
          legalType: this.getEntityType
        }
      }

      const correction: any = {
        correction: {
          correctedFilingId: this.correctedFilingId,
          correctedFilingType: this.origFiling.header.name,
          correctedFilingDate: this.dateToYyyyMmDd(this.apiToDate(this.origFiling.header.date)),
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

      try {
        let response

        if (this.filingId > 0) {
          // we have a filing id, so update (put) an existing filing
          let url = `businesses/${this.getIdentifier}/filings/${this.filingId}`
          if (isDraft) { url += '?draft=true' }
          response = await axios.put(url, data)
        } else {
          // filing id is 0, so create (post) a new filing
          let url = `businesses/${this.getIdentifier}/filings`
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
        }
      }
    },

    /** Handler for dialog Exit click events. */
    navigateToDashboard (ignoreChanges: boolean = false) {
      if (ignoreChanges) this.haveChanges = false
      this.$router.push({ name: Routes.DASHBOARD })
        .catch(() => {}) // ignore error in case navigation was aborted
    },

    /** Reset all error flags/states. */
    resetErrors (): void {
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
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
    /** Called when Detail Comment component validity changes.  */
    detailCommentValid (val: boolean): void {
      this.haveChanges = true
    },

    /** Called when Certify form validity changes.  */
    certifyFormValid (val: boolean): void {
      this.haveChanges = true
    },

    /** Called when Staff Payment Data changes. */
    staffPaymentData (val: StaffPaymentIF) {
      const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

      // apply Priority flag to CRCTN filing code only
      // simply re-add the CRCTN code with the updated Priority flag and existing Waive Fees flag
      this.updateFilingData('add', FilingCodes.CORRECTION, val.isPriority, waiveFees)

      // add/remove Waive Fees flag to all filing codes
      this.updateFilingData(waiveFees ? 'add' : 'remove', undefined, undefined, true)

      this.haveChanges = true
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
    font-size: $px-14;
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
