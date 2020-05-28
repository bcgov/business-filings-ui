<template>
  <v-app class="app-container theme--light" id="app">

    <dashboard-unavailable-dialog
      :dialog="dashboardUnavailableDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <business-auth-error-dialog
      :dialog="businessAuthErrorDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <name-request-auth-error-dialog
      :dialog="nameRequestAuthErrorDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <name-request-invalid-dialog
      :dialog="nameRequestInvalidDialog"
      :type="nameRequestInvalidType"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <!-- Initial Page Load Transition -->
    <transition name="fade">
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg" v-if="!isSignoutRoute">Loading Dashboard</div>
        </div>
      </div>
    </transition>

    <sbc-header />

    <div class="app-body">
      <!-- only show pages while signing in or once the data is loaded -->
      <main v-if="isSigninRoute || dataLoaded">
        <entity-info />
        <router-view />
      </main>
    </div>

    <sbc-footer />

  </v-app>
</template>

<script lang="ts">
// Libraries
import { mapState, mapActions } from 'vuex'
import axios from '@/axios-auth'
import TokenService from 'sbc-common-components/src/services/token.services'

// Components
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import { DashboardUnavailableDialog, BusinessAuthErrorDialog, NameRequestAuthErrorDialog,
  NameRequestInvalidDialog } from '@/components/dialogs'

// Mixins
import { CommonMixin, DirectorMixin, NamexRequestMixin } from '@/mixins'

// Folder containing the array of configuration objects
import { configJson } from '@/resources'

// Enums and Constants
import { EntityStatus, EntityTypes, FilingStatus, FilingTypes, NameRequestStates } from '@/enums'
import { SIGNIN, SIGNOUT, DASHBOARD } from '@/constants'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

export default {
  name: 'App',

  mixins: [CommonMixin, DirectorMixin, NamexRequestMixin],

  data () {
    return {
      dataLoaded: false as boolean,
      dashboardUnavailableDialog: false as boolean,
      businessAuthErrorDialog: false as boolean,
      nameRequestAuthErrorDialog: false as boolean,
      nameRequestInvalidDialog: false as boolean,
      nameRequestInvalidType: null as NameRequestStates,
      currentDateTimerId: null as number,
      nrNumber: null as string,

      /**
       * Instance of the token refresh service.
       * Needs to exist for lifetime of app.
       */
      tokenService: null as TokenService,

      // enums
      EntityStatus,
      FilingStatus,
      FilingTypes
    }
  },

  components: {
    DashboardUnavailableDialog,
    BusinessAuthErrorDialog,
    NameRequestAuthErrorDialog,
    NameRequestInvalidDialog,
    SbcHeader,
    SbcFooter,
    EntityInfo
  },

  computed: {
    ...mapState(['tasks', 'filings', 'entityType', 'entityStatus']),

    /** The Auth API string. */
    authApiUrl (): string {
      return sessionStorage.getItem('AUTH_API_URL')
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
      return Boolean(this.$route.name === SIGNIN)
    },

    /** True if route is Signout. */
    isSignoutRoute (): boolean {
      return Boolean(this.$route.name === SIGNOUT)
    },

    /** True if user is authenticated. */
    isAuthenticated (): boolean {
      // FUTURE: also check that token isn't expired!
      return Boolean(sessionStorage.getItem(SessionStorageKeys.KeyCloakToken))
    },

    /** True if Jest is running the code. */
    isJestRunning (): boolean {
      return (process.env.JEST_WORKER_ID !== undefined)
    }
  },

  created (): void {
    // init current date
    this.updateCurrentDate()

    // listen for dashboard reload trigger event
    this.$root.$on('triggerDashboardReload', () => this.fetchData())
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
    // stop listening for dashboard reload trigger event
    this.$root.$off('triggerDashboardReload')
  },

  methods: {
    ...mapActions(['setKeycloakRoles', 'setAuthRoles', 'setBusinessEmail', 'setBusinessPhone',
      'setBusinessPhoneExtension', 'setCurrentDate', 'setEntityName', 'setEntityType', 'setEntityStatus',
      'setEntityBusinessNo', 'setEntityIncNo', 'setLastPreLoadFilingDate', 'setEntityFoundingDate', 'setLastAgmDate',
      'setNextARDate', 'setTasks', 'setFilings', 'setRegisteredAddress', 'setRecordsAddress', 'setDirectors',
      'setLastAnnualReportDate', 'setConfigObject', 'setNameRequest']),

    /** Stores today's date and sets timeout to keep it updated. */
    updateCurrentDate (): void {
      // clear previous timeout, if any
      clearTimeout(this.currentDateTimerId)

      // set current date
      const now = new Date()
      const date = this.dateToUsableString(now)
      this.setCurrentDate(date)

      // set timeout to run this again at midnight
      const hoursToMidnight = 23 - now.getHours()
      const minutesToMidnight = 59 - now.getMinutes()
      const secondsToMidnight = 59 - now.getSeconds()
      const timeout = ((((hoursToMidnight * 60) + minutesToMidnight) * 60) + secondsToMidnight) * 1000
      this.currentDateTimerId = setTimeout(this.updateCurrentDate, timeout)
    },

    /** Starts token service to refresh KC token periodically. */
    async startTokenService (): Promise<void> {
      // only initialize once
      // don't start during Jest tests as it messes up the test JWT
      if (this.tokenService || this.isJestRunning) return Promise.resolve()

      try {
        console.info('Starting token refresh service...') // eslint-disable-line no-console
        this.tokenService = new TokenService()
        await this.tokenService.init()
        this.tokenService.scheduleRefreshTimer()
      } catch (err) {
        // happens when the refresh token has expired in session storage

        // eslint-disable-next-line no-console
        console.log('Could not initialize token refresher, err =', err)

        // clear old session variables and reload page to get new tokens
        this.clearKeycloakSession()
        location.reload()
      }
    },

    /** Clears Keycloak token information from session storage. */
    clearKeycloakSession () : void {
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakToken)
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakIdToken)
      sessionStorage.removeItem(SessionStorageKeys.KeyCloakRefreshToken)
      sessionStorage.removeItem(SessionStorageKeys.UserFullName)
      sessionStorage.removeItem(SessionStorageKeys.UserKcId)
      sessionStorage.removeItem(SessionStorageKeys.UserAccountType)
    },

    /** Fetches business data / incorp app data. */
    async fetchData (): Promise<void> {
      this.dataLoaded = false

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
        const authData = await this.getAuthorizations()
        this.storeAuthorizations(authData) // throws if no role
      } catch (err) {
        console.log(err) // eslint-disable-line no-console
        if (this.businessId) this.businessAuthErrorDialog = true
        if (this.tempRegNumber) this.nameRequestAuthErrorDialog = true
        return // do not execute remaining code
      }

      // is this a business entity?
      if (this.businessId) {
        try {
          await this.fetchBusinessData() // throws on error
          this.dataLoaded = true
        } catch (err) {
          console.log(err) // eslint-disable-line no-console
          this.dashboardUnavailableDialog = true
        }
      }

      // is this a draft incorp app entity?
      if (this.tempRegNumber) {
        try {
          await this.fetchIncorpAppData() // throws on error
          this.dataLoaded = true
        } catch (err) {
          console.log(err) // eslint-disable-line no-console
          this.nameRequestInvalidDialog = true
        }
      }
    },

    /** Fetches and stores the business data. */
    async fetchBusinessData (): Promise<void> {
      const data = await Promise.all([
        this.getBusinessInfo(),
        this.getEntityInfo(),
        this.getTasks(),
        this.getFilings(),
        this.getAddresses(),
        this.getDirectors()
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

      const iaData = await this.getIncorpApp()
      this.storeIncorpApp(iaData)

      if (this.nrNumber) {
        const nrData = await this.getNameRequest()
        this.storeNrData(nrData)
      }
    },

    /** Gets Keycloak JWT and parses it. */
    getJWT (): any {
      const token = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      if (token) {
        return this.parseToken(token)
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
      } catch (err) {
        throw new Error('Error parsing token - ' + err)
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

    /** Gets authorizations from Auth API. */
    getAuthorizations (): Promise<any> {
      const id = this.businessId || this.tempRegNumber
      const url = id + '/authorizations'
      const config = {
        baseURL: this.authApiUrl + 'entities/'
      }
      return axios.get(url, config)
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

    /** Gets business info from Auth API. */
    getBusinessInfo (): Promise<any> {
      const url = this.businessId
      const config = {
        baseURL: this.authApiUrl + 'entities/'
      }
      return axios.get(url, config)
    },

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
      } else {
        throw new Error('Invalid business contact info')
      }
    },

    /** Gets entity info from Legal API. */
    getEntityInfo (): Promise<any> {
      const url = `businesses/${this.businessId}`
      return axios.get(url)
    },

    storeEntityInfo (response: any): void {
      const business = response?.data?.business
      if (business) {
        this.setEntityName(business.legalName)
        this.setEntityType(business.legalType)
        this.setNextARDate(business.nextAnnualReport)
        this.setEntityStatus(business.status)
        this.setEntityBusinessNo(business.taxId)
        this.setEntityIncNo(business.identifier)
        this.setLastPreLoadFilingDate(business.lastLedgerTimestamp
          ? business.lastLedgerTimestamp.split('T')[0] : null)
        this.setEntityFoundingDate(business.foundingDate) // datetime
        this.setLastAnnualReportDate(business.lastAnnualReport)

        this.storeConfigObject(business.legalType)

        const date = business.lastAnnualGeneralMeetingDate
        if (
          date &&
          date.length === 10 &&
          date.indexOf('-') === 4 &&
          date.indexOf('-', 5) === 7 &&
          date.indexOf('-', 8) === -1
        ) {
          this.setLastAgmDate(date)
        } else {
          this.setLastAgmDate(null)
        }
      } else {
        throw new Error('Invalid entity info')
      }
    },

    /** Gets the Incorp App filing from Legal API. */
    getIncorpApp (): Promise<any> {
      const url = `businesses/${this.tempRegNumber}/filings`
      return axios.get(url)
        // workaround because data is at "response.data.data"
        .then(response => Promise.resolve(response.data))
    },

    storeIncorpApp (data: any) : void {
      const filing = data?.filing

      if (!filing?.business || !filing?.header) {
        throw new Error('Invalid incorporation application filing')
      }

      // verify that this is the correct entity type
      if (filing.business.legalType !== EntityTypes.BCOMP) {
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
      this.nrNumber = nr?.nrNum || nr?.nrNumber

      switch (filing.header.status) {
        case 'DRAFT':
          // this is a Draft Incorporation Application
          this.setEntityStatus(EntityStatus.DRAFT_INCORP_APP)

          this.setTasks([
            {
              enabled: true,
              order: 1,
              task: {
                filing
              }
            }
          ])
          break

        case 'PAID':
          const incorporationApplication = filing.incorporationApplication
          if (!incorporationApplication) {
            throw new Error('Invalid incorporation application object')
          }

          // this is a Paid Incorporation Application
          this.setEntityStatus(EntityStatus.PAID_INCORP_APP)

          // set temporary addresses and directors
          this.storeAddresses({ data: incorporationApplication.offices })
          this.storeDirectors({ data: { directors: [...incorporationApplication.parties] } })

          this.setFilings([{ filing }])
          break

        default:
          throw new Error('Invalid incorporation application status')
      }
    },

    /** Gets NR data from Legal API. */
    getNameRequest (): Promise<any> {
      const url = `nameRequests/${this.nrNumber}`
      return axios.get(url)
        // workaround because data is at "response.data.data"
        .then(response => Promise.resolve(response.data))
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
      if (nrState !== NameRequestStates.APPROVED) {
        this.nameRequestInvalidDialog = true
        this.nameRequestInvalidType = nrState
        throw new Error('NR not consumable')
      }

      // save the NR
      this.setNameRequest(nr)

      // save the approved name
      const entityName = nr.names.find(name => name.state === NameRequestStates.APPROVED)?.name
      this.setEntityName(entityName || 'Unknown Name')
    },

    /** Gets tasks list from Legal API. */
    getTasks (): Promise<any> {
      const id = this.businessId
      const url = `businesses/${id}/tasks`
      return axios.get(url)
    },

    storeTasks (response: any): void {
      const tasks = response?.data?.tasks
      if (tasks) {
        this.setTasks(tasks)
      } else {
        throw new Error('Invalid tasks')
      }
    },

    /** Gets filings list from Legal API. */
    getFilings (): Promise<any> {
      const id = this.businessId || this.tempRegNumber
      const url = `businesses/${id}/filings`
      return axios.get(url)
    },

    storeFilings (response: any): void {
      const filings = response?.data?.filings
      if (filings) {
        this.setFilings(filings)
      } else {
        throw new Error('Invalid filings')
      }
    },

    /** Gets addresses from Legal API. */
    getAddresses (): Promise<any> {
      const url = `businesses/${this.businessId}/addresses`
      return axios.get(url)
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

    /** Gets directors list from Legal API. */
    getDirectors (): Promise<any> {
      const url = `businesses/${this.businessId}/directors`
      return axios.get(url)
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

    /** Stores config object matching this business' legal type. */
    storeConfigObject (legalType: string): void {
      const configObject = configJson.find(x => x.typeEnum === legalType)
      this.setConfigObject(configObject)
    },

    /** Handles Exit click event from dialogs. */
    onClickExit (): void {
      // redirect to Business Registry home page
      const businessesUrl = sessionStorage.getItem('BUSINESSES_URL')
      // assume Businesses URL is always reachable
      window.location.assign(businessesUrl)
    },

    /** Handles Retry click event from dialogs. */
    onClickRetry (): void {
      this.dashboardUnavailableDialog = false
      this.businessAuthErrorDialog = false
      this.nameRequestAuthErrorDialog = false
      this.nameRequestInvalidDialog = false
      this.fetchData()
    }
  },

  watch: {
    async '$route' (): Promise<void> {
      // if we (re)route to the dashboard then re-fetch all data
      // - does not fire on initial dashboard load
      // - fires after successful signin
      if (this.$route.name === DASHBOARD) {
        await this.startTokenService()
        await this.fetchData()
      }
    }
  }
}
</script>

<style lang="scss">
// @import '@/assets/styles/theme.scss';
</style>
