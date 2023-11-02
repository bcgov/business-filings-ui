<template>
  <div id="agm-location-chg">
    <ConfirmDialog
      ref="confirm"
      attach="#agm-location-chg"
    />

    <PaymentErrorDialog
      attach="#agm-location-chg"
      filingName="AGM Location Change"
      :dialog="paymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @exit="onPaymentErrorDialogExit()"
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

    <!-- Main Body -->
    <v-container
      v-if="dataLoaded"
      class="view-container"
    >
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <article id="main-article">
            <!-- Page Title -->
            <header>
              <h1>
                AGM Location Change
              </h1>
            </header>

            <!-- Help -->
            <ExpandableHelp helpLabel="Help with Annual General Meeting Location Change">
              <template #content>
                <h3 class="text-center">
                  AGM Location Change Help
                </h3>
                <div class="mt-6">
                  <p class="ml-1">
                    Generally, company meetings must be in British Columbia (BC). However, there are exceptions to
                    this rule. A company must request a location change if the meeting will be fully or partially
                    in-person and none of the exceptions listed below apply. Partially in-person meetings combine
                    both in-person and online participation. The location change request only applies to
                    the in-person participants.
                    <br><br>
                    Exceptions to the requirement for a location change request include the following:
                    <br><br>
                    <ul>
                      <li>The meeting will be fully online;</li>
                      <li>The company's articles permit a location outside BC;</li>
                      <li>
                        Nothing in the articles restrict a location change approved by
                        resolution or by ordinary resolution, as the case may be.
                      </li>
                    </ul>
                  </p>
                </div>
              </template>
            </ExpandableHelp>

            <!-- Main Section -->
            <section class="mt-8">
              <header>
                <h2>Location Change Detail</h2>
                <p class="grey-text">
                  Enter the calendar year the AGM is for and AGM location outside B.C.
                </p>
              </header>

              <div>
                <v-card flat>
                  <!-- AGM Year -->
                  <div
                    id="agm-year-section"
                    :class="{ 'invalid-section': !agmYearValid && showErrors }"
                  >
                    <v-row
                      no-gutters
                      class="pt-8 pb-2"
                    >
                      <v-col
                        cols="12"
                        sm="3"
                        class="pl-4"
                      >
                        <strong :class="{ 'app-red': !agmYearValid && showErrors }">AGM Year</strong>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                      >
                        <AgmYear
                          v-model="agmYear"
                          :validateForm="showErrors"
                          label="AGM year"
                          :rules="agmYearRules"
                          @valid="agmYearValid=$event"
                        />
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider />

                  <!-- Reason -->
                  <div
                    id="reason-section"
                    :class="{ 'invalid-section': !reasonValid && showErrors }"
                  >
                    <v-row
                      no-gutters
                      class="py-6"
                    >
                      <v-col
                        cols="12"
                        sm="3"
                        class="pl-4 pt-4"
                      >
                        <strong :class="{ 'app-red': !reasonValid && showErrors }">Reason</strong>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <DetailComment
                          v-model="reason"
                          :class="{ 'invalid-component': !reasonValid && showErrors }"
                          placeholder="Reason"
                          maxLength="2000"
                          textRequiredErrorMsg="Reason is required."
                          :validateForm="showErrors"
                          @valid="reasonValid=$event"
                        />
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider />

                  <!-- Location address -->
                  <div
                    id="location-section"
                    :class="{ 'invalid-section': !agmLocationValid && showErrors }"
                  >
                    <v-row
                      no-gutters
                      class="pt-6"
                    >
                      <v-col
                        cols="12"
                        sm="3"
                        class="pl-4 pt-4"
                      >
                        <strong :class="{ 'app-red': !agmLocationValid && showErrors }">AGM Location</strong>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <p>
                          Enter the AGM location not in B.C. Include the city, province or state equivalent,
                          and country. E.g. "Red Deer, Alberta, Canada"
                        </p>
                        <AgmLocation
                          v-model="agmLocation"
                          :rules="agmLocationRules"
                          :validateForm="showErrors"
                          @update:agmLocation="agmLocation=$event"
                          @valid="agmLocationValid=$event"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </v-card>
              </div>
            </section>

            <!-- Certify -->
            <section>
              <header>
                <h2>Certify</h2>
                <p class="grey-text">
                  Enter the legal name of the person authorized to complete and submit this filing.
                </p>
              </header>
              <div
                id="certify-form-section"
                :class="{ 'invalid-section': !certifyFormValid && showErrors }"
              >
                <Certify
                  ref="certifyRef"
                  :isCertified.sync="isCertified"
                  :certifiedBy.sync="certifiedBy"
                  :class="{ 'invalid-certify': !certifyFormValid && showErrors }"
                  :entityDisplay="displayName()"
                  :message="certifyText(FilingCodes.AGM_LOCATION_CHANGE)"
                  @valid="certifyFormValid=$event"
                />
              </div>
            </section>
          </article>
        </v-col>

        <v-col
          cols="12"
          lg="3"
          style="position: relative"
        >
          <aside>
            <affix
              relative-element-selector="#main-article"
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

    <!-- Buttons -->
    <v-container
      id="buttons-container"
      class="list-item"
    >
      <div class="buttons-right">
        <v-tooltip
          top
          color="tooltipColor"
          content-class="top-tooltip"
        >
          <template #activator="{ on }">
            <div
              class="d-inline"
              v-on="on"
            >
              <v-btn
                id="agm-loctn-chg-file-pay-btn"
                color="primary"
                large
                :disabled="busySaving"
                :loading="filingPaying"
                @click="onClickFilePay()"
              >
                <span>{{ isPayRequired ? "File and Pay" : "File Now (no fee)" }}</span>
              </v-btn>
            </div>
          </template>
          Ensure all of your information is entered correctly before you File.<br>
          There is no opportunity to change information beyond this point.
        </v-tooltip>

        <v-btn
          id="agm-loctn-chg-cancel-btn"
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
import { navigate } from '@/utils'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { Certify, DetailComment } from '@/components/common'
import { ConfirmDialog, PaymentErrorDialog } from '@/components/dialogs'
import { CommonMixin, DateMixin, EnumMixin, FilingMixin, ResourceLookupMixin } from '@/mixins'
import { ExpandableHelp } from '@bcrs-shared-components/expandable-help'
import { LegalServices } from '@/services/'
import { FilingCodes, FilingTypes, Routes, SaveErrorReasons } from '@/enums'
import { ConfirmDialogType } from '@/interfaces'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import AgmLocation from '@/components/AgmLocationChange/AgmLocation.vue'
import AgmYear from '@/components/AgmLocationChange/AgmYear.vue'

@Component({
  components: {
    AgmLocation,
    AgmYear,
    Certify,
    ConfirmDialog,
    DetailComment,
    ExpandableHelp,
    PaymentErrorDialog,
    SbcFeeSummary
  }
})
export default class AgmLocationChg extends Mixins(CommonMixin, DateMixin,
  EnumMixin, FilingMixin, ResourceLookupMixin) {
  // Refs
  $refs!: {
    confirm: ConfirmDialogType,
    certifyRef: Certify
  }

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) getUserInfo!: any
  @Getter(useRootStore) isRoleStaff!: boolean

  // enum for template
  readonly FilingCodes = FilingCodes

  // variables for main section
  agmLocation = ''
  agmLocationValid = false
  agmYear = ''
  agmYearValid = false

  // variables for Certify component
  certifiedBy = ''
  isCertified = false
  certifyFormValid = false

  // variables for DetailComment component
  reason = ''
  reasonValid = false

  // variables for displaying dialogs
  resumeErrorDialog = false
  saveErrorReason: SaveErrorReasons = null
  paymentErrorDialog = false

  // other variables
  totalFee = 0
  dataLoaded = false
  loadingMessage = ''
  filingId = 0 // id of this agm location change filing
  savedFiling: any = null // filing during save
  saving = false // true only when saving
  savingResuming = false // true only when saving and resuming
  showErrors = false // true when we press on File and Pay (trigger validation)
  filingPaying = false // true only when filing and paying
  haveChanges = false
  saveErrors = []
  saveWarnings = []

  /** True if loading container should be shown, else False. */
  get showLoadingContainer (): boolean {
    // show loading container when data isn't yet loaded and when
    // no dialogs are displayed (otherwise dialogs may be hidden)
    return (!this.dataLoaded && !this.saveErrorReason && !this.paymentErrorDialog)
  }

  /** The Base URL string. */
  get baseUrl (): string {
    return sessionStorage.getItem('BASE_URL')
  }

  /** True if page is valid, else False. */
  get isPageValid (): boolean {
    return (this.agmLocationValid && this.agmYearValid && this.certifyFormValid && this.reasonValid)
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

  /** Array of validations rules for AGM location. */
  get agmLocationRules (): Array<(val) => boolean | string> {
    const rules = [] as Array<(val) => boolean | string>
    rules.push(val => !!val || 'AGM location is required.')
    rules.push(val => (val.length <= 400) || 'Must be 400 characters or less.')
    return rules
  }

  /** Array of validations rules for AGM year. */
  get agmYearRules (): Array<(val) => boolean | string> {
    const rules = [] as Array<(val) => boolean | string>
    rules.push(val => !!val || 'AGM year is required.')
    rules.push(val => (val && +val <= this.maxAgmYear) || 'Must be on or before ' + this.maxAgmYear)
    rules.push(val => (val && +val >= this.minAgmYear) || 'Must be on or after ' + this.minAgmYear)
    return rules
  }

  get minAgmYear () : number {
    const today = new Date()
    return (today.getFullYear() - 2)
  }

  get maxAgmYear () : number {
    const today = new Date()
    return (today.getFullYear() + 1)
  }

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

    // this is the id of THIS filing
    // if 0, this is a new filing
    // otherwise it's a draft filing
    this.filingId = +this.$route.params.filingId // number or NaN

    // if required data isn't set, go back to dashboard
    if (!this.getIdentifier || isNaN(this.filingId)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // wait until entire view is rendered (including all child components)
    // see https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted
    await this.$nextTick()

    // Pre-populate the certified block with the logged in user's name (if not staff)
    if (!this.isRoleStaff) {
      const firstName = this.getUserInfo?.firstname
      const lastName = this.getUserInfo?.lastname
      this.certifiedBy = firstName + ' ' + lastName
    }

    if (this.filingId > 0) {
      this.loadingMessage = `Resuming Your Request for AGM Location Change`
    } else {
      this.loadingMessage = `Preparing Your Request for AGM Location Change`
    }

    this.dataLoaded = true

    // always include agm location change code
    // clear Priority flag and set the Waive Fees flag to true
    this.updateFilingData('add', FilingCodes.AGM_LOCATION_CHANGE, undefined, true)
  }

  /**
   * Called when user clicks File and Pay button
   * or when user retries from Save Error dialog
   */
  async onClickFilePay (): Promise<void> {
    // if there is an invalid component, scroll to it
    if (!this.isPageValid) {
      this.showErrors = true
      if (!this.certifyFormValid) {
        // Show error message of legal name text field if invalid
        this.$refs.certifyRef.$refs.certifyTextfieldRef.error = true
      }
      await this.validateAndScroll(this.validFlags, this.validComponents)
      return
    }

    // prevent double saving
    if (this.busySaving) return

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

    const header: any = {
      header: {
        name: FilingTypes.AGM_LOCATION_CHANGE,
        certifiedBy: this.certifiedBy || '',
        date: this.getCurrentDate // NB: API will reassign this date according to its clock
      }
    }

    header.header['waiveFees'] = true

    const business: any = {
      business: {
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.getLegalName,
        legalType: this.getLegalType
      }
    }

    const data: any = {
      [FilingTypes.AGM_LOCATION_CHANGE]: {
        year: this.agmYear,
        reason: this.reason,
        agmLocation: this.agmLocation
      }
    }

    // build filing
    const filing = Object.assign({}, header, business, data)
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
      'You have unsaved changes in your AGM Location Change. Do you want to exit your filing?',
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

  /** Array of valid components. Must match validFlags. */
  readonly validComponents = [
    'agm-year-section',
    'reason-section',
    'location-section',
    'certify-form-section'
  ]

  /** Object of valid flags. Must match validComponents. */
  get validFlags (): object {
    return {
      // mainSection: this.sectionValid,
      agmYear: this.agmYearValid,
      reason: this.reasonValid,
      location: this.agmLocationValid,
      certifyForm: this.certifyFormValid
    }
  }

  @Watch('agmYearValid')
  @Watch('agmLocationValid')
  @Watch('certifyFormValid')
  @Watch('resonValid')
  onHaveChanges (): void {
    this.haveChanges = true
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#agm-location-chg {
  /* Set "header-counter" to 0 */
  counter-reset: header-counter;
}

h2::before {
  /* Increment "header-counter" by 1 */
  counter-increment: header-counter;
  content: counter(header-counter) '. ';
}

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

// Save & Filing Buttons
#buttons-container {
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

  #agm-loctn-chg-cancel-btn {
    margin-left: 0.5rem;
  }
}

// Fix font size and color to stay consistent.
:deep() {
  .certify-clause, .certify-stmt, .grey-text {
    color: $gray7;
  }

  .invalid-certify {
    .certify-stmt, .title-label {
      color: $app-red;
    }
  }

  .invalid-component {
    .title-label {
      color: $app-red;
    }
  }

  // Setting the top and bottom red borders (error) radii to 0.
  .v-card > *:first-child:not(.v-btn):not(.v-chip):not(.v-avatar),
  .v-card > .v-card__progress + *:not(.v-btn):not(.v-chip):not(.v-avatar) {
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
  }

  .v-card > *:last-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
}
</style>
