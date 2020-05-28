<template>
  <div id="standalone-office-address">
    <confirm-dialog
      ref="confirm"
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
    <div class="loading-container fade-out">
      <div class="loading__content">
        <v-progress-circular color="primary" :size="50" indeterminate></v-progress-circular>
        <div class="loading-msg">{{loadingMessage}}</div>
      </div>
    </div>

    <v-container id="standalone-office-address-container" class="view-container">
      <v-row>
        <v-col cols="12" lg="9">
          <article id="standalone-office-address-article">
            <header>
              <h1 id="filing-header">Address Change</h1>

              <p>
                <span v-if="isCoop()">Please change your Registered Office Address.</span>
                <span v-if="isBComp()">Please change your Registered Office Address and Records Address.</span>
              </p>

              <v-alert type="info" outlined
                v-if="isBComp()"
                icon="mdi-information"
                class="white-background"
              >
                <span>Any address update will be effective tomorrow.</span>
              </v-alert>
            </header>

            <!-- Office Addresses -->
            <section>
              <office-addresses
                :addresses.sync="addresses"
                :registeredAddress.sync="registeredAddress"
                :recordsAddress.sync="recordsAddress"
                @modified="officeModifiedEventHandler($event)"
                @valid="officeAddressFormValid = $event"
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
                :message="certifyText(FilingCodes.ADDRESS_CHANGE_OT)"
                @valid="certifyFormValid=$event"
              />
            </section>

            <!-- Staff Payment -->
            <section v-if="isRoleStaff">
              <header>
                <h2 id="AR-step-5-header">Staff Payment</h2>
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
              relative-element-selector="#standalone-office-address-article"
              :offset="{ top: 120, bottom: 40 }"
            >
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
          <span>Save &amp; Resume Later</span>
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
              <span>{{isPayRequired ? "File &amp; Pay" : "File"}}</span>
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
import axios from '@/axios-auth'
import { mapActions, mapState, mapGetters } from 'vuex'

// Dialogs
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog,
  SaveErrorDialog, BcolErrorDialog } from '@/components/dialogs'

// Components
import { Certify, OfficeAddresses, StaffPayment } from '@/components/common'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

// Constants
import { PAYMENT_REQUIRED, BAD_REQUEST } from 'http-status-codes'
import { DASHBOARD } from '@/constants'

// Mixins
import { CommonMixin, FilingMixin, ResourceLookupMixin, BcolMixin } from '@/mixins'

// Enums
import { EntityTypes, FilingCodes, FilingStatus, FilingTypes } from '@/enums'

export default {
  name: 'StandaloneOfficeAddressFiling',

  components: {
    OfficeAddresses,
    SbcFeeSummary,
    Certify,
    StaffPayment,
    ConfirmDialog,
    PaymentErrorDialog,
    ResumeErrorDialog,
    SaveErrorDialog,
    BcolErrorDialog
  },
  mixins: [CommonMixin, FilingMixin, ResourceLookupMixin, BcolMixin],

  data () {
    return {
      addresses: null,
      filingId: null,
      loadingMessage: 'Loading...', // initial generic message
      showLoading: false,
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,
      isCertified: false,
      certifiedBy: '',
      certifyFormValid: false,
      officeAddressFormValid: true,
      saving: false, // true only when saving
      savingResuming: false, // true only when saving and resuming
      filingPaying: false, // true only when filing and paying
      haveChanges: false,
      saveErrors: [],
      saveWarnings: [],

      // properties for StaffPayment component
      routingSlipNumber: null,
      isPriority: false,
      isWaiveFees: false,
      staffPaymentFormValid: null,
      totalFee: 0,

      // bcol error variables
      bcolObj: null,
      // enums
      EntityTypes,
      FilingCodes,
      FilingStatus,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo',
      'entityFoundingDate', 'registeredAddress', 'recordsAddress', 'filingData']),
    ...mapGetters(['isRoleStaff']),

    validated (): boolean {
      const staffPaymentValid = (!this.isRoleStaff || !this.isPayRequired || this.staffPaymentFormValid)
      const filingDataValid = (this.filingData.length > 0)

      return (staffPaymentValid && this.certifyFormValid && this.officeAddressFormValid && filingDataValid)
    },

    /** True when saving, saving and resuming, or filing and paying. */
    busySaving (): boolean {
      return (this.saving || this.savingResuming || this.filingPaying)
    },

    saveAsDraftEnabled (): boolean {
      const filingDataValid = (this.filingData.length > 0)
      return (this.officeAddressFormValid && filingDataValid)
    },

    payApiUrl (): string {
      return sessionStorage.getItem('PAY_API_URL')
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

    // NB: filing id of 0 means "new"
    // otherwise it's a draft filing id
    this.filingId = +this.$route.params.filingId // number (may be NaN)

    // if tombstone data isn't set, go back to dashboard
    if (!this.entityIncNo || isNaN(this.filingId)) {
      this.$router.push({ name: DASHBOARD })
    } else if (this.filingId > 0) {
      // resume draft filing
      this.loadingMessage = `Resuming Your Address Change`
      this.fetchChangeOfAddressFiling()
    } else {
      // else just load new page
      this.loadingMessage = `Preparing Your Address Change`
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

    formatAddress (address) {
      return {
        'actions': address.actions || [],
        'addressCity': address.addressCity || '',
        'addressCountry': address.addressCountry || '',
        'addressRegion': address.addressRegion || '',
        'addressType': address.addressType || '',
        'deliveryInstructions': address.deliveryInstructions || '',
        'postalCode': address.postalCode || '',
        'streetAddress': address.streetAddress || '',
        'streetAddressAdditional': address.streetAddressAdditional || ''
      }
    },

    fetchChangeOfAddressFiling () {
      const url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
      axios.get(url).then(response => {
        if (response && response.data) {
          const filing = response.data.filing
          try {
            // verify data
            if (!filing) throw new Error('Missing filing')
            if (!filing.header) throw new Error('Missing header')
            if (!filing.business) throw new Error('Missing business')
            if (filing.header.name !== FilingTypes.CHANGE_OF_ADDRESS) throw new Error('Invalid filing type')
            if (filing.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
            if (filing.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

            // load Certified By but not Date
            this.certifiedBy = filing.header.certifiedBy

            // load Staff Payment properties
            this.routingSlipNumber = filing.header.routingSlipNumber
            this.isPriority = filing.header.priority
            this.isWaiveFees = filing.header.waiveFees

            // load Annual Report fields
            if (!filing.changeOfAddress) throw new Error('Missing change of address')

            const changeOfAddress = filing.changeOfAddress.offices
            if (changeOfAddress) {
              if (changeOfAddress.recordsOffice) {
                this.addresses = {
                  registeredOffice: {
                    deliveryAddress: changeOfAddress.registeredOffice.deliveryAddress,
                    mailingAddress: changeOfAddress.registeredOffice.mailingAddress
                  },
                  recordsOffice: {
                    deliveryAddress: changeOfAddress.recordsOffice.deliveryAddress,
                    mailingAddress: changeOfAddress.recordsOffice.mailingAddress
                  }
                }
                // use default Priority and Waive Fees flags
                this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, this.isPriority, this.isWaiveFees)
              } else {
                this.addresses = {
                  registeredOffice: {
                    deliveryAddress: changeOfAddress.registeredOffice.deliveryAddress,
                    mailingAddress: changeOfAddress.registeredOffice.mailingAddress
                  }
                }
                // use default Priority and Waive Fees flags
                this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, this.isPriority, this.isWaiveFees)
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchData() error - ${err.message}, filing = ${filing}`)
            this.resumeErrorDialog = true
            throw new Error('Invalid change of address')
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('fetchData() error - invalid response =', response)
          this.resumeErrorDialog = true
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchData() error =', error)
        this.resumeErrorDialog = true
      })
    },

    /**
     * Callback method for the "modified" event from OfficeAddresses component.
     *
     * @param modified a boolean indicating whether or not the office address(es) have been modified from their
     * original values.
     */
    officeModifiedEventHandler (modified: boolean): void {
      this.haveChanges = true
      // when addresses change, update filing data
      // use default Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.ADDRESS_CHANGE_OT,
        this.isPriority, this.isWaiveFees)
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

      let changeOfAddress = null

      const header = {
        header: {
          name: FilingTypes.CHANGE_OF_ADDRESS,
          certifiedBy: this.certifiedBy || '',
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
          legalName: this.entityName
        }
      }

      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT) && this.addresses) {
        if (this.addresses.recordsOffice) {
          changeOfAddress = {
            changeOfAddress: {
              legalType: this.entityType,
              offices: {
                registeredOffice: {
                  deliveryAddress: this.formatAddress(this.addresses.registeredOffice['deliveryAddress']),
                  mailingAddress: this.formatAddress(this.addresses.registeredOffice['mailingAddress'])
                },
                recordsOffice: {
                  deliveryAddress: this.formatAddress(this.addresses.recordsOffice['deliveryAddress']),
                  mailingAddress: this.formatAddress(this.addresses.recordsOffice['mailingAddress'])
                }
              }
            }
          }
        } else {
          changeOfAddress = {
            changeOfAddress: {
              legalType: this.entityType,
              offices: {
                registeredOffice: {
                  deliveryAddress: this.formatAddress(this.addresses.registeredOffice['deliveryAddress']),
                  mailingAddress: this.formatAddress(this.addresses.registeredOffice['mailingAddress'])
                }
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
      this.$router.push({ name: DASHBOARD })
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
    /** Called when Is Certified changes. */
    isCertified (val) {
      this.haveChanges = true
    },

    /** Called when Certified By changes. */
    certifiedBy (val) {
      this.haveChanges = true
    },

    /** Called when Routing Slip Number changes. */
    routingSlipNumber (val) {
      this.haveChanges = true
    },

    /** Called when Is Priority changes. */
    isPriority (val: boolean): void {
      // apply this flag to OTADD filing code only
      // if OTADD code exists, simply re-add it with the updated Priority flag and default Waive Fees flag
      if (this.hasFilingCode(FilingCodes.ADDRESS_CHANGE_OT)) {
        this.updateFilingData('add', FilingCodes.ADDRESS_CHANGE_OT, val, this.isWaiveFees)
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
</style>
