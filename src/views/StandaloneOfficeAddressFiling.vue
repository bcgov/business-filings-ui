<template>
  <div id="standalone-office-address">
    <confirm-dialog
      ref="confirm"
      attach="#standalone-office-address"
    />

    <fetch-error-dialog
      :dialog="fetchErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#standalone-office-address"
    />

    <resume-error-dialog
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#standalone-office-address"
    />

    <save-error-dialog
      filing="Address Change"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
      attach="#standalone-office-address"
    />

    <payment-error-dialog
      :dialog="paymentErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#standalone-office-address"
    />

    <bcol-error-dialog
      :bcolObject="bcolObj"
      :filingType="FilingTypes.CHANGE_OF_ADDRESS"
      @exit="navigateToDashboard(true)"
      attach="#standalone-office-address"
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

    <v-container id="standalone-office-address-container" class="view-container">
      <v-row>
        <v-col cols="12" lg="9">
          <article id="standalone-office-address-article">
            <header>
              <h1 id="filing-header">Address Change</h1>

              <p>
                <span v-if="isCoop">Please change your Registered Office Address.</span>
                <span v-if="isBComp">Please change your Registered Office Address and Records Address.</span>
              </p>

              <v-alert type="info" outlined
                v-if="isBComp"
                icon="mdi-information"
                class="white-background"
              >
                <span>Any address update will be effective tomorrow.</span>
              </v-alert>
            </header>

            <!-- Office Addresses -->
            <section>
              <office-addresses
                ref="officeAddressesComponent"
                :addresses.sync="updatedAddresses"
                @modified="officeModifiedEventHandler($event)"
                @valid="addressesFormValid=$event"
              />
            </section>

            <!-- Certify -->
            <section>
              <header>
                <h2 id="AR-step-4-header">Certify</h2>
                <p>Enter the legal name of the person authorized to complete and submit this
                  Address Change.</p>
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

        <v-col cols="12" lg="3" style="position: relative">
          <aside>
            <affix
              relative-element-selector="#standalone-office-address-article"
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
    <v-container id="standalone-office-address-buttons-container" class="list-item">
      <div class="buttons-left">
        <v-btn
          id="coa-save-btn"
          large
          :disabled="!saveAsDraftEnabled || busySaving"
          :loading="saving"
          @click="onClickSave()"
        >
          <span>Save</span>
        </v-btn>
        <v-btn
          id="coa-save-resume-btn"
          large
          :disabled="!saveAsDraftEnabled || busySaving"
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
              id="coa-file-pay-btn"
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

        <v-btn
          id="coa-cancel-btn"
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
import Vue from 'vue'
import axios from '@/axios-auth'
import { mapActions, mapState, mapGetters } from 'vuex'
import { isEmpty } from 'lodash'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, FetchErrorDialog, ResumeErrorDialog, SaveErrorDialog, BcolErrorDialog }
  from '@/components/dialogs'

// Components
import { Certify, OfficeAddresses, StaffPayment } from '@/components/common'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

// Constants
import { PAYMENT_REQUIRED, BAD_REQUEST } from 'http-status-codes'

// Mixins
import { FilingMixin, ResourceLookupMixin, BcolMixin, DateMixin, CommonMixin } from '@/mixins'

// Enums and Interfaces
import { FilingCodes, FilingStatus, FilingTypes, Routes, StaffPaymentOptions } from '@/enums'
import { StaffPaymentIF } from '@/interfaces'

export default {
  name: 'StandaloneOfficeAddressFiling',

  components: {
    OfficeAddresses,
    SbcFeeSummary,
    Certify,
    StaffPayment,
    ConfirmDialog,
    PaymentErrorDialog,
    FetchErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog,
    BcolErrorDialog
  },
  mixins: [FilingMixin, ResourceLookupMixin, BcolMixin, DateMixin, CommonMixin],

  data () {
    return {
      updatedAddresses: { registeredOffice: {}, recordsOffice: {} },
      filingId: null,
      loadingMessage: '',
      dataLoaded: false,
      isFetching: false,
      fetchErrorDialog: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,
      coaDate: '',
      isCertified: false,
      certifiedBy: '',
      certifyFormValid: false,
      addressesFormValid: null as boolean,
      saving: false, // true only when saving
      savingResuming: false, // true only when saving and resuming
      filingPaying: false, // true only when filing and paying
      haveChanges: false,
      saveErrors: [],
      saveWarnings: [],
      totalFee: 0,

      // properties for StaffPayment component
      staffPaymentData: { option: StaffPaymentOptions.NONE } as StaffPaymentIF,
      staffPaymentFormValid: null,

      // bcol error variables
      bcolObj: null,

      // enums in template
      FilingCodes,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo', 'entityFoundingDate', 'filingData']),
    ...mapGetters(['isBComp', 'isCoop', 'isRoleStaff']),

    /** Returns True if loading container should be shown, else False. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded && !this.fetchErrorDialog && !this.resumeErrorDialog &&
        !this.saveErrorDialog && !this.paymentErrorDialog)
    },

    validated (): boolean {
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)
      const filingDataValid = (this.filingData.length > 0)

      return (staffPaymentValid && this.certifyFormValid && this.addressesFormValid && filingDataValid)
    },

    /** True when saving, saving and resuming, or filing and paying. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    saveAsDraftEnabled (): boolean {
      const filingDataValid = (this.filingData.length > 0)
      return (this.addressesFormValid && filingDataValid)
    },

    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
    },

    isPayRequired (): boolean {
      // FUTURE: modify rule here as needed
      return (this.totalFee > 0)
    },

    /** Local computed value for the fee code based on entity type */
    feeCode (): string {
      return this.isBComp ? FilingCodes.ADDRESS_CHANGE_BC : FilingCodes.ADDRESS_CHANGE_OT
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

    // NB: filing id of 0 means "new"
    // otherwise it's a draft filing id
    this.filingId = +this.$route.params.filingId // number (may be NaN)

    // if tombstone data isn't set, go back to dashboard
    if (!this.entityIncNo || isNaN(this.filingId)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  },

  async mounted (): Promise<void> {
    // initial value
    // since user cannot change it from the UI, this will always be "today"
    this.coaDate = this.currentDate

    if (this.filingId > 0) {
      this.loadingMessage = 'Resuming Your Address Change'
      // resume draft filing
      await this.fetchDraftFiling()
      // fetch original office addresses
      // update working data only if it wasn't in the draft
      if (!this.isJestRunning) {
        await this.$refs.officeAddressesComponent.getOrigAddresses(this.coaDate, isEmpty(this.updatedAddresses))
      }
    } else {
      // this is a new filing
      this.loadingMessage = 'Preparing Your Address Change'
      // fetch original office addresses + update working data
      if (!this.isJestRunning) {
        await this.$refs.officeAddressesComponent.getOrigAddresses(this.coaDate, true)
      }
    }

    this.dataLoaded = true
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
      'You have unsaved changes in your Change of Office Addresses. Do you want to exit your filing?',
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
      await axios.get(url).then(response => {
        const filing: any = response?.data?.filing

        // verify data
        if (!filing) throw new Error('Missing filing')
        if (!filing.header) throw new Error('Missing header')
        if (!filing.business) throw new Error('Missing business')
        if (filing.header.name !== FilingTypes.CHANGE_OF_ADDRESS) throw new Error('Invalid filing type')
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

        // do not restore COA Date
        // since user cannot change it from the UI, it will always be "today"

        // restore Change of Address data
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
          // use existing Priority and Waive Fees flags
          this.updateFilingData('add', this.feeCode, this.staffPaymentData.isPriority,
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
     * Callback method for the "modified" event from OfficeAddresses component.
     * @param modified a boolean indicating whether or not the office address(es) have been modified from their
     * original values.
     */
    officeModifiedEventHandler (modified: boolean): void {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
      // when addresses change, update filing data
      // use existing Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', this.feeCode, this.staffPaymentData.isPriority,
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

        // whether this is a staff or no-fee filing
        const paymentCompleted = filing.header?.paymentStatusCode === 'COMPLETED'
        const prePaidFiling = (this.isRoleStaff || !this.isPayRequired || paymentCompleted)

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

      let changeOfAddress = null

      const header = {
        header: {
          name: FilingTypes.CHANGE_OF_ADDRESS,
          certifiedBy: this.certifiedBy || '',
          email: 'no_one@never.get',
          date: this.currentDate, // NB: API will reassign this date according to its clock
          effectiveDate: this.convertLocalDateToUTCDateTime(this.coaDate)
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

      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT)) {
        changeOfAddress = {
          changeOfAddress: {
            legalType: this.entityType,
            offices: {
              registeredOffice: this.updatedAddresses.registeredOffice
            }
          }
        }
      }

      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_BC)) {
        changeOfAddress = {
          changeOfAddress: {
            legalType: this.entityType,
            offices: {
              registeredOffice: this.updatedAddresses.registeredOffice,
              recordsOffice: this.updatedAddresses.recordsOffice
            }
          }
        }
      }

      const data = {
        filing: Object.assign(
          {},
          header,
          business,
          changeOfAddress
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
        }).catch(async error => {
          if (error && error.response && error.response.status === PAYMENT_REQUIRED) {
            // Changes were saved if a 402 is received - clear chaveChanges flag
            this.haveChanges = false
            const errCode = this.getErrorCode(error)
            if (errCode) {
              this.bcolObj = await this.getErrorObj(errCode.payment_error_type)
            } else {
              this.paymentErrorDialog = true
            }
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
        }).catch(async error => {
          if (error && error.response && error.response.status === PAYMENT_REQUIRED) {
            const errCode = this.getErrorCode(error)
            if (errCode) {
              this.bcolObj = await this.getErrorObj(errCode.payment_error_type)
            } else {
              this.paymentErrorDialog = true
            }
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
      this.$router.push({ name: Routes.DASHBOARD })
    },

    resetErrors () {
      this.paymentErrorDialog = false
      this.bcolObj = null
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
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
            console.log('hasTasks() error =', error)
            this.saveErrorDialog = true
          })
      }
      return hasPendingItems
    }
  },

  watch: {
    // FOR FUTURE USE (since COA date cannot be changed, this method is not called atm)
    async coaDate () {
      // ignore changes before data is loaded
      if (!this.dataLoaded) return null

      // fetch original office addresses with new date + update working data
      // (this will overwrite the current data)
      this.isFetching = true
      if (!this.isJestRunning) {
        await this.$refs.officeAddressesComponent.getOrigAddresses(this.coaDate, true)
      }
      this.isFetching = false
    },

    /** Called when Is Certified changes. */
    isCertified () {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
    },

    /** Called when Certified By changes. */
    certifiedBy () {
      // only record changes once the initial data is loaded
      this.haveChanges = this.dataLoaded
    },

    /** Called when Staff Payment Data changes. */
    staffPaymentData (val: StaffPaymentIF) {
      const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

      // apply Priority flag to OTADD filing code only
      // if OTADD code exists, simply re-add it with the updated Priority flag and existing Waive Fees flag
      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT)) {
        this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, val.isPriority, waiveFees)
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
#standalone-office-address-buttons-container {
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

  #coa-cancel-btn {
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
