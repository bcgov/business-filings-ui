<template>
  <div id="standalone-directors">
    <confirm-dialog
      ref="confirm"
      attach="#standalone-directors"
    />

    <resume-error-dialog
      :dialog="resumeErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#standalone-directors"
    />

    <save-error-dialog
      filing="Change of Directors"
      :dialog="saveErrorDialog"
      :disableRetry="busySaving"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="navigateToDashboard(true)"
      @retry="onClickFilePay()"
      @okay="resetErrors()"
      attach="#standalone-directors"
    />

    <payment-error-dialog
      :dialog="paymentErrorDialog"
      @exit="navigateToDashboard(true)"
      attach="#standalone-directors"
    />

    <!-- Initial Page Load Transition -->
    <div class="loading-container fade-out">
      <div class="loading__content">
        <v-progress-circular color="primary" :size="50" indeterminate></v-progress-circular>
        <div class="loading-msg">{{loadingMessage}}</div>
      </div>
    </div>

    <!-- Change of Directors Filing -->
    <v-fade-transition hide-on-leave>
      <div v-show="!inFilingReview">
        <v-container id="standalone-directors-container" class="view-container">
          <v-row>
            <v-col cols="12" lg="9">
              <article id="standalone-directors-article">
                <header>
                  <h1 id="filing-header">Director Change</h1>
                  <p>Select the date of your director changes. If you have director changes that occured on
                      different dates, you will need to perform multiple Director Change filings &mdash;
                      one for each unique date.</p>

                  <v-alert type="info" outlined
                    v-if="!isBComp()"
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
                  <directors ref="directorsList"
                    @directorsChange="directorsChange"
                    @directorsFreeChange="directorsFreeChange"
                    @earliestDateToSet="earliestDateToSet=$event"
                    @directorFormValid="directorFormValid=$event"
                    @allDirectors="allDirectors=$event"
                    @directorEditAction="directorEditInProgress=$event"
                    @complianceDialogMsg="complianceDialogMsg=$event"
                    :asOfDate="codDate"
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
                    :message="certifyText(FilingCodes.DIRECTOR_CHANGE_OT)"
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
                  relative-element-selector="#standalone-directors-article"
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
              <span>Save &amp; Resume Later</span>
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
                    <p class="complianceDialogMsg">{{complianceDialogMsg.msg}}</p>
                  </v-alert>
                </section>
                <!-- Director Information -->
                <section>
                  <summary-directors
                    :directors="allDirectors"
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
                    :message="certifyText(FilingCodes.DIRECTOR_CHANGE_OT)"
                    @valid="certifyFormValid=$event"
                  />
                </section>

                <!-- Staff Payment -->
                <section v-if="isRoleStaff">
                  <header>
                    <h2>Staff Payment</h2>
                  </header>
                  <summary-staff-payment
                    :routingSlipNumber="routingSlipNumber"
                    :isPriority.sync="isPriority"
                    :isWaiveFees.sync="isWaiveFees"
                  />
                </section>
              </article>
            </v-col>

            <v-col cols="12" lg="3" style="position: relative">
              <aside>
                <affix
                  relative-element-selector="#standalone-directors-article-review"
                  :offset="{ top: 120, bottom: 40 }"
                >
                  <sbc-fee-summary
                    v-bind:filingData="[...filingData]"
                    v-bind:payURL="payApiUrl"
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
                    <span>{{isPayRequired ? "File &amp; Pay" : "File"}}</span>
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
import { BAD_REQUEST, PAYMENT_REQUIRED } from 'http-status-codes'

// Components
import CodDate from '@/components/StandaloneDirectorChange/CODDate.vue'
import Directors from '@/components/common/Directors.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, StaffPayment, SummaryDirectors, SummaryCertify, SummaryStaffPayment } from '@/components/common'

// Dialog Components
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog } from '@/components/dialogs'

// Mixins
import { CommonMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'

// Enums and Constants
import { EntityTypes, FilingCodes, FilingStatus, FilingTypes } from '@/enums'
import { CEASED, APPOINTED, ADDRESSCHANGED, NAMECHANGED, DASHBOARD } from '@/constants'

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
    ResumeErrorDialog,
    SaveErrorDialog
  },

  mixins: [CommonMixin, FilingMixin, ResourceLookupMixin],

  data () {
    return {
      allDirectors: [],
      resumeErrorDialog: false,
      saveErrorDialog: false,
      paymentErrorDialog: false,
      earliestDateToSet: 'your last filing',
      inFilingReview: false,
      isCertified: false,
      certifiedBy: '',
      certifyFormValid: false,
      directorFormValid: true,
      directorEditInProgress: false,
      filingId: null,
      loadingMessage: 'Loading...', // initial generic message
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

      // properties for StaffPayment component
      routingSlipNumber: null,
      isPriority: false,
      isWaiveFees: false,
      staffPaymentFormValid: null,
      totalFee: 0,

      // enums
      EntityTypes,
      FilingCodes,
      FilingStatus,
      FilingTypes
    }
  },

  computed: {
    ...mapState(['currentDate', 'entityType', 'entityName', 'entityIncNo', 'entityFoundingDate', 'filingData']),

    ...mapGetters(['isRoleStaff']),

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
      this.loadingMessage = `Resuming Your Director Change`
      this.fetchChangeOfDirectors()
    } else {
      // else just load new page
      this.loadingMessage = `Preparing Your Director Change`
      this.initialCODDate = this.currentDate.split('/').join('-')
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

    directorsChange (modified: boolean) {
      this.haveChanges = true
      // when directors change, update filing data
      // use default Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.DIRECTOR_CHANGE_OT,
        this.isPriority, this.isWaiveFees)
    },

    directorsFreeChange (modified: boolean) {
      this.haveChanges = true
      // when directors change (free filing), update filing data
      // use default Priority and Waive Fees flags
      this.updateFilingData(modified ? 'add' : 'remove', FilingCodes.FREE_DIRECTOR_CHANGE_OT,
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

      let changeOfDirectors = null

      const header = {
        header: {
          name: FilingTypes.CHANGE_OF_DIRECTORS,
          certifiedBy: this.certifiedBy || '',
          email: 'no_one@never.get',
          date: this.currentDate,
          effectiveDate: this.codDate + 'T00:00:00+00:00'
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

      if (this.hasFilingCode(FilingCodes.DIRECTOR_CHANGE_OT) ||
      this.hasFilingCode(FilingCodes.FREE_DIRECTOR_CHANGE_OT)) {
        changeOfDirectors = {
          changeOfDirectors: {
            directors: this.allDirectors
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

    fetchChangeOfDirectors () {
      const url = `businesses/${this.entityIncNo}/filings/${this.filingId}`
      axios.get(url).then(response => {
        if (response && response.data) {
          const filing = response.data.filing
          try {
            // verify data
            if (!filing) throw new Error('Missing filing')
            if (!filing.header) throw new Error('Missing header')
            if (!filing.business) throw new Error('Missing business')
            if (filing.header.name !== FilingTypes.CHANGE_OF_DIRECTORS) throw new Error('Invalid filing type')
            if (filing.business.identifier !== this.entityIncNo) throw new Error('Invalid business identifier')
            if (filing.business.legalName !== this.entityName) throw new Error('Invalid business legal name')

            // load Certified By but not Date
            this.certifiedBy = filing.header.certifiedBy

            // load Staff Payment properties
            this.routingSlipNumber = filing.header.routingSlipNumber
            this.isPriority = filing.header.priority
            this.isWaiveFees = filing.header.waiveFees

            if (filing.header.effectiveDate) {
              this.initialCODDate = filing.header.effectiveDate.slice(0, 10)
            } else {
              // eslint-disable-next-line no-console
              console.error('fetchChangeOfDirectors() error = missing Effective Date')
            }

            const changeOfDirectors = filing.changeOfDirectors
            if (changeOfDirectors) {
              if (changeOfDirectors.directors && changeOfDirectors.directors.length > 0) {
                if (this.$refs.directorsList && this.$refs.directorsList.setAllDirectors) {
                  this.$refs.directorsList.setAllDirectors(changeOfDirectors.directors)
                }

                // add filing code for paid changes
                if (changeOfDirectors.directors.filter(
                  director => this.hasAction(director, CEASED) ||
                    this.hasAction(director, APPOINTED)
                ).length > 0) {
                  // use default Priority and Waive Fees flags
                  this.updateFilingData('add', FilingCodes.DIRECTOR_CHANGE_OT, this.isPriority, this.isWaiveFees)
                }

                // add filing code for free changes
                if (changeOfDirectors.directors.filter(
                  director => this.hasAction(director, NAMECHANGED) ||
                    this.hasAction(director, ADDRESSCHANGED)
                ).length > 0) {
                  // use default Priority and Waive Fees flags
                  this.updateFilingData('add', FilingCodes.FREE_DIRECTOR_CHANGE_OT, this.isPriority, this.isWaiveFees)
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
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`fetchData() error - ${err.message}, filing = ${filing}`)
            this.resumeErrorDialog = true
          }
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.error('fetchData() error =', error)
        this.resumeErrorDialog = true
      })
    },

    resetErrors () {
      this.saveErrorDialog = false
      this.saveErrors = []
      this.saveWarnings = []
    },

    hasAction (director, action) {
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

    /**
     * Local method to change the state of the view and render the editable directors list
     */
    returnToFiling (): void {
      this.inFilingReview = false
      document.body.scrollTop = 0 // For Safari
      document.documentElement.scrollTop = 0 // For Chrome, Firefox and IE
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
      // apply this flag to OTCDR filing code only
      // if OTCDR code exists, simply re-add it with the updated Priority flag and default Waive Fees flag
      if (this.hasFilingCode(FilingCodes.DIRECTOR_CHANGE_OT)) {
        this.updateFilingData('add', FilingCodes.DIRECTOR_CHANGE_OT, val, this.isWaiveFees)
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
</style>
