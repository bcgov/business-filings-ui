<template>
  <v-app class="app-container theme--light" id="app">
    <!-- Dialogs -->
    <DashboardUnavailableDialog
      :dialog="dashboardUnavailableDialog"
      @exit="onClickExit()"
      @retry="onClickRetry()"
      attach="#app"
    />

    <BusinessAuthErrorDialog
      :dialog="businessAuthErrorDialog"
      @exit="onClickExit()"
      @retry="onClickRetry(true)"
      attach="#app"
    />

    <NameRequestAuthErrorDialog
      :dialog="nameRequestAuthErrorDialog"
      @exit="onClickExit()"
      @retry="onClickRetry(true)"
      attach="#app"
    />

    <NameRequestInvalidDialog
      :dialog="nameRequestInvalidDialog"
      :type="nameRequestInvalidType"
      @exit="onClickExit()"
      @retry="onClickRetry()"
      attach="#app"
    />

    <!-- Initial Page Load Transition -->
    <v-fade-transition>
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg" v-if="!isSignoutRoute">Loading Dashboard</div>
        </div>
      </div>
    </v-fade-transition>

    <!-- Alternate Loading Spinner -->
    <v-fade-transition>
      <div class="loading-container grayed-out" v-show="showSpinner">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
        </div>
      </div>
    </v-fade-transition>

    <SbcHeader />
    <PaySystemAlert />

    <div class="app-body">
      <!-- only show pages while signing in or once the data is loaded -->
      <main v-if="isSigninRoute || dataLoaded">
        <EntityInfo />
        <router-view />
      </main>
    </div>

    <SbcFooter :aboutText=aboutText />

  </v-app>
</template>

<script lang="ts">
// Libraries
import { mapActions, mapState } from 'vuex'
import axios from '@/axios-auth'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import * as Sentry from '@sentry/browser'
import { updateLdUser } from '@/utils'

// Components
import PaySystemAlert from 'sbc-common-components/src/components/PaySystemAlert.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import {
  BusinessAuthErrorDialog,
  DashboardUnavailableDialog,
  NameRequestAuthErrorDialog,
  NameRequestInvalidDialog
} from '@/components/dialogs'

// Configuration objects
import { configJson } from '@/resources'

// Mixins, Interfaces, Enums and Constants
import { AuthApiMixin, CommonMixin, DateMixin, DirectorMixin, EnumMixin, LegalApiMixin, NameRequestMixin }
  from '@/mixins'
import { LedgerIF } from '@/interfaces'
import { EntityStatus, CorpTypeCd, FilingTypes, NameRequestStates, Routes } from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

export default {
  name: 'App',

  mixins: [AuthApiMixin, CommonMixin, DateMixin, DirectorMixin, EnumMixin, LegalApiMixin, NameRequestMixin],

  data () {
    return {
      dataLoaded: false,
      dashboardUnavailableDialog: false,
      businessAuthErrorDialog: false,
      nameRequestAuthErrorDialog: false,
      nameRequestInvalidDialog: false,
      nameRequestInvalidType: null as NameRequestStates,
      localNrNumber: null as string,
      corpTypeCd: null as CorpTypeCd,

      /** Whether to show the alternate loading spinner. */
      showSpinner: false,

      /** Whether the token refresh service is initialized. */
      tokenService: false,

      /** Currently supported entity types in Filings UI. */
      supportedEntityTypes: [
        CorpTypeCd.BENEFIT_COMPANY,
        CorpTypeCd.BC_COMPANY,
        CorpTypeCd.BC_ULC_COMPANY,
        CorpTypeCd.BC_CCC
      ],

      // enums
      EntityStatus,
      FilingTypes
    }
  },

  components: {
    DashboardUnavailableDialog,
    BusinessAuthErrorDialog,
    NameRequestAuthErrorDialog,
    NameRequestInvalidDialog,
    PaySystemAlert,
    SbcHeader,
    SbcFooter,
    EntityInfo
  },

  computed: {
    ...mapState(['tasks', 'filings', 'entityName', 'entityType', 'entityStatus']),

    /** The BCROS Home URL string. */
    bcrosHomeUrl (): string {
      return sessionStorage.getItem('BUSINESSES_URL')
    },

    /** The Business ID string. */
    businessId (): string {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /** The Incorporation Application's Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    },

    /** True if loading container should be shown. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded &&
        !this.dashboardUnavailableDialog &&
        !this.businessAuthErrorDialog &&
        !this.nameRequestAuthErrorDialog &&
        !this.nameRequestInvalidDialog)
    },

    /** True if route is Signin. */
    isSigninRoute (): boolean {
      return Boolean(this.$route.name === Routes.SIGNIN)
    },

    /** True if route is Signout. */
    isSignoutRoute (): boolean {
      return Boolean(this.$route.name === Routes.SIGNOUT)
    },

    /** True if user is authenticated. */
    isAuthenticated (): boolean {
      const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      // FUTURE: also check that token isn't expired!
      return Boolean(keycloakToken)
    },

    /** The About text. */
    aboutText (): string {
      return process.env.ABOUT_TEXT
    }
  },

  created (): void {
    // listen for dashboard reload trigger events
    this.$root.$on('triggerDashboardReload', () => this.fetchData())

    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })
  },

  async mounted (): Promise<void> {
    // do not fetch data if we need to authenticate
    // just let signin page do its thing
    if (!this.isAuthenticated) return

    // ...otherwise proceed
    await this.startTokenService()
    await this.fetchData()
  },

  destroyed (): void {
    // stop listening for dashboard reload trigger events
    this.$root.$off('triggerDashboardReload')

    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
  },

  methods: {
    ...mapActions(['setKeycloakRoles', 'setAuthRoles', 'setBusinessEmail', 'setBusinessPhone',
      'setBusinessPhoneExtension', 'setCurrentDate', 'setEntityName', 'setEntityType', 'setEntityStatus',
      'setEntityBusinessNo', 'setEntityIncNo', 'setEntityFoundingDate', 'setTasks', 'setFilings',
      'setRegisteredAddress', 'setRecordsAddress', 'setDirectors', 'setLastAnnualReportDate', 'setNameRequest',
      'setLastFilingDate', 'setLastCoaFilingDate', 'setLastCodFilingDate', 'setConfigObject']),

    /** Starts token service to refresh KC token periodically. */
    async startTokenService (): Promise<void> {
      // only initialize once
      // don't start during Jest tests as it messes up the test JWT
      if (this.tokenService || this.isJestRunning) return Promise.resolve()

      try {
        console.info('Starting token refresh service...') // eslint-disable-line no-console
        await KeycloakService.initializeToken()
        this.tokenService = true
      } catch (error) {
        // happens when the refresh token has expired in session storage

        // eslint-disable-next-line no-console
        console.log('Error initializing token refresher =', error)

        // clear old session variables and reload page to get new tokens
        this.clearKeycloakSession()
        location.reload()
      }
    },

    /** Clears Keycloak token information from session storage. */
    clearKeycloakSession (): void {
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakToken)
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakRefreshToken)
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakIdToken)
      sessionStorage.removeItem(SessionStorageKeys.CurrentAccount)
    },

    /** Fetches business data / incorp app data. */
    async fetchData (): Promise<void> {
      this.dataLoaded = false

      // store today's date every time the dashboard is loaded
      const serverDate = await this.getServerDate()
      if (!this.isJestRunning) {
        // eslint-disable-next-line no-console
        console.info(`The current date-time is ${this.dateToPacificDateTime(serverDate)}.`)
      }
      this.setCurrentDate(this.dateToDateString(serverDate))

      try {
        // get Keycloak roles
        const jwt = this.getJWT()
        const keycloakRoles = this.getKeycloakRoles(jwt)
        this.setKeycloakRoles(keycloakRoles)

        // safety check
        if (!this.businessId && !this.tempRegNumber) {
          throw new Error('Missing Business ID or Temporary Registration Number')
        }

        // check if current user is authorized
        const authData = await this.fetchAuthorizations(this.businessId || this.tempRegNumber)
        this.storeAuthorizations(authData) // throws if no role
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
        if (this.businessId) this.businessAuthErrorDialog = true
        if (this.tempRegNumber) this.nameRequestAuthErrorDialog = true
        return // do not execute remaining code
      }

      // fetch user info and update Launch Darkly
      try {
        const userInfo = await this.fetchUserInfo()
        await this.updateLaunchDarkly(userInfo)
      } catch (error) {
        // just log the error -- no need to halt app
        console.log('Error updating Launch Darkly =', error) // eslint-disable-line no-console
      }

      // is this a business entity?
      if (this.businessId) {
        try {
          await this.fetchBusinessData() // throws on error
          this.dataLoaded = true
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
          this.dashboardUnavailableDialog = true
          // Log exception to Sentry due to incomplete business data.
          // At this point the system doesn't know why it's incomplete.
          // Since this is not an expected behaviour, report this.
          Sentry.captureException(error)
        }
      }

      // is this a draft incorp app entity?
      if (this.tempRegNumber) {
        try {
          await this.fetchIncorpAppData() // throws on error
          this.dataLoaded = true
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
          this.nameRequestInvalidDialog = true
        }
      }
    },

    /** Fetches and stores the business data. */
    async fetchBusinessData (): Promise<void> {
      const data = await Promise.all([
        this.fetchBusinessInfo(this.businessId),
        this.fetchEntityInfo(this.businessId),
        this.fetchTasks(this.businessId),
        this.fetchFilings(this.businessId || this.tempRegNumber),
        this.fetchAddresses(this.businessId),
        this.fetchDirectors(this.businessId)
      ])

      if (!data || data.length !== 6) throw new Error('Incomplete business data')

      this.storeBusinessInfo(data[0])
      this.storeEntityInfo(data[1])
      this.storeTasks(data[2])
      this.storeFilings(data[3])
      this.storeAddresses(data[4])
      this.storeDirectors(data[5])
    },

    /** Fetches and stores the incorp app data. */
    async fetchIncorpAppData (): Promise<void> {
      this.nameRequestInvalidType = null // reset for new fetches

      const iaData = await this.fetchIncorpApp(this.tempRegNumber)
      this.storeIncorpApp(iaData)

      if (this.localNrNumber) {
        const nrData = await this.fetchNameRequest(this.localNrNumber)
        this.storeNrData(nrData)
      }
    },

    /** Gets Keycloak JWT and parses it. */
    getJWT (): any {
      const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      if (keycloakToken) {
        return this.parseToken(keycloakToken)
      }
      throw new Error('Error getting Keycloak token')
    },

    /** Decodes and parses Keycloak token. */
    parseToken (token: string): any {
      try {
        const base64Url = token.split('.')[1]
        const base64 = decodeURIComponent(window.atob(base64Url).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(base64)
      } catch (error) {
        throw new Error('Error parsing token - ' + error)
      }
    },

    /** Gets Keycloak roles from JWT. */
    getKeycloakRoles (jwt: any): Array<string> {
      const keycloakRoles = jwt.roles
      if (keycloakRoles && keycloakRoles.length > 0) {
        return keycloakRoles
      }
      throw new Error('Error getting Keycloak roles')
    },

    storeAuthorizations (response: any): void {
      // NB: roles array may contain 'view', 'edit' or nothing
      const authRoles = response?.data?.roles
      if (authRoles && authRoles.length > 0) {
        this.setAuthRoles(authRoles)
      } else {
        throw new Error('Invalid auth roles')
      }
    },

    /** Updates Launch Darkly with current user info. */
    async updateLaunchDarkly (userInfo: any): Promise<void> {
      // since username is unique, use it as the user key
      const key: string = userInfo.username
      const email: string = userInfo.contacts[0]?.email || userInfo.email
      const firstName: string = userInfo?.firstname
      const lastName: string = userInfo?.lastname
      // remove leading { and trailing } and tokenize string
      const custom: any = { roles: userInfo.roles?.slice(1, -1).split(',') }

      await updateLdUser(key, email, firstName, lastName, custom)
    },

    /** Stores business info from Auth API. */
    storeBusinessInfo (response: any): void {
      const contacts = response?.data?.contacts
      // ensure we received the right looking object
      // but allow empty contacts array
      if (contacts) {
        // at this time there is at most 1 contact
        const contact = contacts.length > 0 && contacts[0]
        if (contact) {
          this.setBusinessEmail(contact.email)
          this.setBusinessPhone(contact.phone)
          this.setBusinessPhoneExtension(contact.phoneExtension)
        }
        // save Corp Type Code locally to compare with Legal Type below
        this.corpTypeCd = response?.data?.corpType?.code
      } else {
        throw new Error('Invalid business contact info')
      }
    },

    /** Stores entity info from Legal API. */
    storeEntityInfo (response: any): void {
      const business = response?.data?.business

      if (!business) {
        throw new Error('Invalid entity info')
      }

      if (this.businessId !== business.identifier) {
        throw new Error('Business identifier mismatch')
      }

      // these should match, but don't error out if they don't
      // hopefully ops will see this error in Sentry
      if (this.corpTypeCd && business.legalType !== this.corpTypeCd) {
        // eslint-disable-next-line no-console
        console.error('WARNING: Legal Type in Legal db does not match Corp Type in Auth db!')
      }

      this.setEntityName(business.legalName)
      this.setEntityType(business.legalType)
      if (business.goodStanding === true) {
        this.setEntityStatus(EntityStatus.GOOD_STANDING)
      } else {
        this.setEntityStatus(EntityStatus.NOT_IN_COMPLIANCE)
      }
      this.setEntityBusinessNo(business.taxId)
      this.setEntityIncNo(business.identifier)
      this.setEntityFoundingDate(business.foundingDate) // datetime
      this.setLastAnnualReportDate(business.lastAnnualReport)
      // TODO: uncomment when API provides this data
      // TODO: verify date format
      // this.setLastFilingDate(this.apiToDate(business.lastFilingDate))
      // this.setLastCoaFilingDate(this.apiToDate(business.lastCoaFilingDate))
      // this.setLastCodFilingDate(this.apiToDate(business.lastCodFilingDate))

      // store config object based on current entity type
      this.storeConfigObject(business.legalType)
    },

    /** Verifies and stores an IA as a Todo List item or Filing History List item. */
    storeIncorpApp (data: any): void {
      const filing = data?.filing

      if (!filing?.business || !filing?.header) {
        throw new Error('Invalid incorporation application filing')
      }

      // verify that this is the correct entity type
      if (!this.supportedEntityTypes.includes(filing.business.legalType)) {
        throw new Error('Invalid business legal type')
      }

      // verify that this is the correct filing type
      if (filing.header.name !== FilingTypes.INCORPORATION_APPLICATION) {
        throw new Error('Invalid incorporation application name')
      }

      // store business info
      this.setEntityIncNo(filing.business.identifier)
      this.setEntityType(filing.business.legalType)

      // store NR Number if present
      const nr = filing.incorporationApplication?.nameRequest
      // workaround for old or new property name
      this.localNrNumber = nr?.nrNum || nr?.nrNumber || null

      // store Legal Name if present
      this.setEntityName(nr?.legalName || null)

      switch (filing.header.status) {
        case 'DRAFT':
        case 'PENDING':
          // this is a draft IA
          this.setEntityStatus(EntityStatus.DRAFT_INCORP_APP)

          // add this as a task (for Todo List)
          const taskItem: any = {
            enabled: true,
            order: 1,
            task: { filing }
          }
          this.setTasks([taskItem])
          break

        case 'COMPLETED':
        case 'PAID':
          const incorporationApplication = filing.incorporationApplication
          if (!incorporationApplication) {
            throw new Error('Invalid incorporation application object')
          }

          // this is a completed or paid IA
          this.setEntityStatus(EntityStatus.FILED_INCORP_APP)

          // set temporary addresses and directors
          this.storeAddresses({ data: incorporationApplication.offices })
          const directors = incorporationApplication.parties.filter((party) => party.roles.filter((role) =>
            role.roleType === 'Director').length !== 0)
          this.storeDirectors({ data: { directors: [...directors] } })

          // build display name
          const type = this.getCorpTypeDescription(this.entityType)
          const name = this.filingTypeToName(FilingTypes.INCORPORATION_APPLICATION)
          const desc = this.entityName || this.getCorpTypeNumberedDescription(this.entityType)

          // add this as a filing (for Filing History List)
          const filingItem: LedgerIF = {
            availableOnPaperOnly: filing.header.availableOnPaperOnly,
            businessIdentifier: filing.business.identifier,
            correctionFilingId: null,
            correctionFilingStatus: null,
            displayName: `${type} ${name} - ${desc}`,
            effectiveDate: this.apiToDate(filing.header.effectiveDate).toUTCString(),
            filingId: filing.header.filingId,
            isFutureEffective: filing.header.isFutureEffective,
            name: FilingTypes.INCORPORATION_APPLICATION,
            paymentToken: filing.header.paymentToken,
            status: filing.header.status,
            submittedDate: this.apiToDate(filing.header.date).toUTCString(),
            submitter: filing.header.submitter
          }
          this.setFilings([filingItem])
          break

        default:
          throw new Error('Invalid incorporation application status')
      }
    },

    storeNrData (nr: any): void {
      // check if NR is valid
      if (!this.isNrValid(nr)) {
        this.nameRequestInvalidDialog = true
        throw new Error('Invalid NR data')
      }

      // FUTURE: uncomment this when Request Type Code is fixed (ie, not 'CR')
      // // verify that NR type matches entity type
      // if (nr.requestTypeCd !== this.entityType) {
      //   this.nameRequestInvalidDialog = true
      //   throw new Error('Invalid NR request type')
      // }

      // check if NR is consumable
      const nrState: NameRequestStates = this.getNrState(nr)
      if (nrState !== NameRequestStates.APPROVED && nrState !== NameRequestStates.CONDITIONAL) {
        this.nameRequestInvalidDialog = true
        this.nameRequestInvalidType = nrState
        throw new Error('NR not consumable')
      }

      // save the NR
      this.setNameRequest(nr)

      // save the approved name
      const entityName = this.getApprovedName(nr)
      this.setEntityName(entityName || 'Unknown Name')
    },

    storeTasks (response: any): void {
      const tasks = response?.data?.tasks
      if (tasks) {
        this.setTasks(tasks)
      } else {
        throw new Error('Invalid tasks')
      }
    },

    storeFilings (response: any): void {
      const filings = response?.data?.filings
      if (filings) {
        this.setFilings(filings)
        // TODO: remove when API provides this data
        this.setLastFilingDate(this.getLastFilingDate(filings))
        this.setLastCoaFilingDate(this.getLastCoaFilingDate(filings))
        this.setLastCodFilingDate(this.getLastCodFilingDate(filings))
      } else {
        throw new Error('Invalid filings')
      }
    },

    // TODO: remove when obsolete
    /**
     * Returns date of last filing (of any type) from list of past filings,
     * or null if none found.
     */
    getLastFilingDate (filings: any): Date {
      let lastFilingDate: Date = null

      for (let i = 0; i < filings.length; i++) {
        let filing = filings[i]
        const filingDate = new Date(filing.effectiveDate)
        if (lastFilingDate === null || filingDate > lastFilingDate) {
          lastFilingDate = filingDate
        }
      }

      return lastFilingDate
    },

    // TODO: remove when obsolete
    /**
     * Returns date of last Change of Address filing from list of past filings,
     * or null if none found.
     */
    getLastCoaFilingDate (filings: any[]): Date {
      let lastCoaDate: Date = null

      for (let i = 0; i < filings.length; i++) {
        let filing = filings[i]
        const filingDate = new Date(filing.effectiveDate)
        if (this.isTypeChangeOfAddress(filing)) {
          if (lastCoaDate === null || filingDate > lastCoaDate) {
            lastCoaDate = filingDate
          }
        }
      }

      return lastCoaDate
    },

    // TODO: remove when obsolete
    /**
     * Returns date of last Change of Directors filing from list of past filings,
     * or null if none found.
     */
    getLastCodFilingDate (filings: any[]): Date {
      let lastCodDate: Date = null

      for (let i = 0; i < filings.length; i++) {
        let filing = filings[i]
        const filingDate = new Date(filing.effectiveDate)
        if (this.isTypeChangeOfDirectors(filing)) {
          if (lastCodDate === null || filingDate > lastCodDate) {
            lastCodDate = filingDate
          }
        }
      }

      return lastCodDate
    },

    storeAddresses (response: any): void {
      if (response?.data) {
        if (response.data.registeredOffice) {
          this.setRegisteredAddress(this.omitProps(response.data.registeredOffice,
            ['deliveryAddress', 'mailingAddress'], ['addressType']))
        }
        if (response.data.recordsOffice) {
          this.setRecordsAddress(this.omitProps(response.data.recordsOffice,
            ['deliveryAddress', 'mailingAddress'], ['addressType']))
        }
      } else {
        throw new Error('invalid office addresses')
      }
    },

    storeDirectors (response: any): void {
      const directors = response?.data?.directors
      if (directors) {
        const directorsSorted = directors.sort(this.fieldSorter(['lastName', 'firstName', 'middleName']))
        for (var i = 0; i < directorsSorted.length; i++) {
          directorsSorted[i].id = i + 1
          directorsSorted[i].isNew = false
          directorsSorted[i].isDirectorActive = true
        }
        this.setDirectors(directorsSorted)
      } else {
        throw new Error('Invalid directors')
      }
    },

    /** Stores config object matching the specified entity type. */
    storeConfigObject (entityType: string): void {
      const configObject = configJson.find(x => x.entityType === entityType)
      this.setConfigObject(configObject)
    },

    /** Handles Exit click event from dialogs. */
    onClickExit (): void {
      window.location.assign(this.bcrosHomeUrl) // assume URL is always reachable
    },

    /** Handles Retry click event from dialogs. */
    onClickRetry (hard = false): void {
      if (hard) {
        // clear KC session variables and hard-reload the page
        // to force new login and try again
        this.clearKeycloakSession()
        location.reload()
      } else {
        // try to fetch the data again
        this.dashboardUnavailableDialog = false
        this.businessAuthErrorDialog = false
        this.nameRequestAuthErrorDialog = false
        this.nameRequestInvalidDialog = false
        this.fetchData()
      }
    }
  },

  watch: {
    async '$route' (): Promise<void> {
      // if we (re)route to the dashboard then re-fetch all data
      // - does not fire on initial dashboard load
      // - fires after successful signin
      if (this.$route.name === Routes.DASHBOARD) {
        await this.startTokenService()
        await this.fetchData()
      }
    }
  }
}
</script>

<style lang="scss">
.loading-container.grayed-out {
  // these are the same styles as dialog overlay:
  opacity: 0.46;
  background-color: rgb(33, 33, 33); // grey darken-4
  border-color: rgb(33, 33, 33); // grey darken-4
}
</style>
