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

    <ConfirmDissolution
      :dialog="confirmDissolutionDialog"
      @close="confirmDissolutionDialog = false"
      @proceed="dissolveCompany()"
      attach="#app"
    />

    <NotInGoodStandingDialog
      :dialog="notInGoodStandingDialog"
      :message="nigsMessage"
      @close="notInGoodStandingDialog = false"
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
        <BreadCrumb :breadcrumbs="breadcrumbs" />
        <EntityInfo
          @confirmDissolution="confirmDissolutionDialog = true"
          @notInGoodStanding="nigsMessage = $event; notInGoodStandingDialog = true"
        />
        <router-view />
      </main>
    </div>

    <SbcFooter :aboutText=aboutText />

  </v-app>
</template>

<script lang="ts">
// Libraries
import { mapActions, mapGetters } from 'vuex'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import * as Sentry from '@sentry/browser'
import { updateLdUser } from '@/utils'

// Components
import PaySystemAlert from 'sbc-common-components/src/components/PaySystemAlert.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import { BreadCrumb } from '@/components/common'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import {
  BusinessAuthErrorDialog,
  ConfirmDissolution,
  DashboardUnavailableDialog,
  NameRequestAuthErrorDialog,
  NameRequestInvalidDialog,
  NotInGoodStandingDialog
} from '@/components/dialogs'

// Configuration objects
import { configJson, dashboardBreadcrumb, staffDashboardBreadcrumb } from '@/resources'

// Mixins, Interfaces, Enums and Constants
import { AuthApiMixin, CommonMixin, DateMixin, DirectorMixin, EnumMixin, FilingMixin, LegalApiMixin,
  NameRequestMixin } from '@/mixins'
import { ApiFilingIF, ApiTaskIF, BusinessIF, BreadcrumbIF, TaskTodoIF } from '@/interfaces'
import { EntityStatus, CorpTypeCd, FilingTypes, NameRequestStates, Routes, FilingStatus, Roles, EntityState,
  DissolutionTypes, NigsMessage } from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

export default {
  name: 'App',

  mixins: [
    AuthApiMixin, CommonMixin, DateMixin, DirectorMixin, EnumMixin, FilingMixin, LegalApiMixin, NameRequestMixin
  ],

  data () {
    return {
      confirmDissolutionDialog: false,
      dataLoaded: false,
      dashboardUnavailableDialog: false,
      businessAuthErrorDialog: false,
      nameRequestAuthErrorDialog: false,
      nameRequestInvalidDialog: false,
      nameRequestInvalidType: null as NameRequestStates,
      notInGoodStandingDialog: false,
      nigsMessage: null as NigsMessage,
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
        CorpTypeCd.BC_CCC,
        CorpTypeCd.COOP
      ]
    }
  },

  components: {
    BreadCrumb,
    ConfirmDissolution,
    DashboardUnavailableDialog,
    BusinessAuthErrorDialog,
    NameRequestAuthErrorDialog,
    NameRequestInvalidDialog,
    NotInGoodStandingDialog,
    PaySystemAlert,
    SbcHeader,
    SbcFooter,
    EntityInfo
  },

  computed: {
    ...mapGetters(['getIdentifier', 'getEntityName', 'getEntityType', 'isRoleStaff']),

    /** The BCROS Home URL string. */
    bcrosHomeUrl (): string {
      return sessionStorage.getItem('BUSINESSES_URL')
    },

    /** The Business ID string. */
    businessId (): string {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /** The Create URL string. */
    createUrl (): string {
      return sessionStorage.getItem('CREATE_URL')
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
      return (this.$route.name === Routes.SIGNIN)
    },

    /** True if route is Signout. */
    isSignoutRoute (): boolean {
      return (this.$route.name === Routes.SIGNOUT)
    },

    /** True if user is authenticated. */
    isAuthenticated (): boolean {
      const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      // FUTURE: also check that token isn't expired!
      return !!keycloakToken
    },

    /** The About text. */
    aboutText (): string {
      return process.env.ABOUT_TEXT
    },

    /** The route breadcrumbs list. */
    breadcrumbs (): Array<BreadcrumbIF> {
      const breadcrumbs = this.$route?.meta?.breadcrumb

      return [
        this.isRoleStaff ? staffDashboardBreadcrumb : dashboardBreadcrumb,
        {
          text: this.getEntityName || this.getCorpTypeNumberedDescription(this.getEntityType),
          to: { name: Routes.DASHBOARD }
        },
        ...(breadcrumbs || [])
      ]
    }
  },

  created (): void {
    // listen for reload data events
    this.$root.$on('reloadData', () => this.fetchData())

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
    // stop listening for reload data events
    this.$root.$off('reloadData')

    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
  },

  methods: {
    ...mapActions(['setKeycloakRoles', 'setAuthRoles', 'setBusinessEmail', 'setBusinessPhone',
      'setBusinessPhoneExtension', 'setCurrentJsDate', 'setCurrentDate', 'setEntityName', 'setEntityType',
      'setEntityStatus', 'setBusinessNumber', 'setIdentifier', 'setEntityFoundingDate', 'setTasks',
      'setFilings', 'setRegisteredAddress', 'setRecordsAddress', 'setDirectors', 'setLastAnnualReportDate',
      'setNameRequest', 'setLastAddressChangeDate', 'setLastDirectorChangeDate', 'setConfigObject',
      'setReasonText', 'setEntityState', 'setAdminFreeze', 'setComplianceWarnings', 'setGoodStanding']),

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
      const jsDate: Date = await this.getServerDate()
      if (!this.isJestRunning) {
        // eslint-disable-next-line no-console
        console.info(`It is currently ${this.dateToPacificDateTime(jsDate)}.`)
      }
      this.setCurrentJsDate(jsDate)
      this.setCurrentDate(this.dateToYyyyMmDd(jsDate))

      // check authorizations
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
        this.fetchEntityInfo(this.businessId),
        this.fetchBusinessInfo(this.businessId),
        this.fetchTasks(this.businessId),
        this.fetchFilings(this.businessId || this.tempRegNumber),
        this.fetchAddresses(this.businessId),
        this.fetchDirectors(this.businessId)
      ])

      if (!data || data.length !== 6) throw new Error('Incomplete business data')

      this.storeEntityInfo(data[0])
      await this.storeBusinessInfo(data[1])
      this.storeTasks(data[2])
      this.storeFilings(data[3])
      this.storeAddresses(data[4])
      this.storeDirectors(data[5])
    },

    /** Fetches and stores the incorp app data. */
    async fetchIncorpAppData (): Promise<void> {
      this.nameRequestInvalidType = null // reset for new fetches

      const ia = await this.fetchIncorpApp(this.tempRegNumber)
      this.storeIncorpApp(ia)

      // if the IA has a NR, load it
      if (this.localNrNumber) {
        const nr = await this.fetchNameRequest(this.localNrNumber)
        this.storeNrData(nr, ia)
      }
    },

    /** Gets Keycloak JWT and parses it. */
    getJWT (): any {
      const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      if (keycloakToken) {
        return this.parseKcToken(keycloakToken)
      }
      throw new Error('Error getting Keycloak token')
    },

    /** Decodes and parses Keycloak token. */
    parseKcToken (token: string): any {
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

    /** Stores entity info from Auth API. */
    storeEntityInfo (response: any): void {
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
        throw new Error('Invalid entity contact info')
      }
    },

    /** Stores business info from Legal API. */
    async storeBusinessInfo (response: any): Promise<void> {
      const business = response?.data?.business as BusinessIF

      if (!business) {
        throw new Error('Invalid business info')
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

      // FUTURE: change this to a single setter/object?
      this.setAdminFreeze(business.adminFreeze)
      this.setEntityName(business.legalName)
      this.setEntityState(business.state)
      this.setEntityType(business.legalType)
      this.setBusinessNumber(business.taxId || null) // may be empty
      this.setIdentifier(business.identifier)
      this.setEntityFoundingDate(this.apiToDate(business.foundingDate))
      this.setLastAnnualReportDate(business.lastAnnualReportDate) // may be empty
      this.setLastAddressChangeDate(business.lastAddressChangeDate) // may be empty
      this.setLastDirectorChangeDate(business.lastDirectorChangeDate) // may be empty
      this.setComplianceWarnings(Array.isArray(business.complianceWarnings) ? business.complianceWarnings : [])
      this.setGoodStanding(business.goodStanding)

      if (business.state === EntityState.HISTORICAL && business.stateFiling) {
        // fetch the filing that changed the business state
        const stateFiling = await this.fetchFiling(business.stateFiling)

        // parse it (specific to dissolution filing atm)
        const dissolutionType = stateFiling?.dissolution?.dissolutionType as DissolutionTypes
        const effectiveDate = stateFiling?.header?.effectiveDate as string

        // create the reason text to display in the info header
        if (dissolutionType && effectiveDate) {
          const name = this.dissolutionTypeToName(dissolutionType)
          const enDash = '–' // ALT + 0150
          const date: string = this.apiToPacificDateTime(effectiveDate, true)
          this.setReasonText(`${name} ${enDash} ${date}`)
        } else {
          console.log('ERROR - invalid dissolution filing =', stateFiling) // eslint-disable-line no-console
        }
      }

      // store config object based on current entity type
      this.storeConfigObject(business.legalType)
    },

    /** Verifies and stores an IA's data. */
    storeIncorpApp (ia: any): void {
      const filing = ia?.filing
      if (!filing || !filing.business || !filing.header || !filing.incorporationApplication) {
        throw new Error('Invalid IA filing')
      }

      const identifier = filing.business.identifier as string
      if (!identifier) {
        throw new Error('Invalid IA filing - business identifier')
      }

      const name = filing.header.name as FilingTypes
      if (name !== FilingTypes.INCORPORATION_APPLICATION) {
        throw new Error('Invalid IA filing - filing name')
      }

      const status = filing.header.status as FilingStatus
      if (!status) {
        throw new Error('Invalid IA filing - filing status')
      }

      const nameRequest = filing.incorporationApplication.nameRequest
      if (!nameRequest) {
        throw new Error('Invalid IA filing - Name Request object')
      }

      // verify that this is a supported entity type
      const legalType = nameRequest.legalType as CorpTypeCd
      if (!legalType || !this.supportedEntityTypes.includes(legalType)) {
        throw new Error('Invalid IA filing - legal type')
      }

      // store business info
      this.setIdentifier(identifier)
      this.setEntityType(legalType)

      // store NR Number if present
      // (look for old or new property name)
      this.localNrNumber = nameRequest?.nrNum || nameRequest?.nrNumber || null

      // store Legal Name if present
      this.setEntityName(nameRequest?.legalName || null)

      switch (status) {
        case FilingStatus.DRAFT:
        case FilingStatus.PENDING:
          // this is a draft IA
          this.setEntityStatus(EntityStatus.DRAFT_INCORP_APP)
          this.storeDraftIa(ia)
          break

        case FilingStatus.COMPLETED:
        case FilingStatus.PAID:
          // this is a filed IA
          this.setEntityStatus(EntityStatus.FILED_INCORP_APP)
          this.storeFiledIa(ia)
          break

        default:
          throw new Error('Invalid IA filing - filing status')
      }
    },

    /** Stores draft IA as a task in the Todo List. */
    storeDraftIa (ia: any): void {
      const filing = ia.filing as TaskTodoIF
      const taskItem: ApiTaskIF = {
        enabled: true,
        order: 1,
        task: { filing }
      }
      this.setTasks([taskItem])
    },

    /** Stores filed IA as a filing in the Filing History List. */
    storeFiledIa (ia: any): void {
      const filing = ia.filing as TaskTodoIF
      // NB: these were already validated in storeIncorpApp()
      const business = filing.business
      const header = filing.header
      const incorporationApplication = filing.incorporationApplication

      // set addresses
      this.storeAddresses({ data: incorporationApplication.offices || [] })

      // set directors
      // (ie, parties that have a role of Director)
      const directors = incorporationApplication.parties?.filter(party =>
        party.roles.filter(role =>
          role.roleType === Roles.DIRECTOR
        ).length !== 0
      )
      this.storeDirectors({ data: { directors: directors || [] } })

      // add this as a filing (for Filing History List)
      const filingItem: ApiFilingIF = {
        availableOnPaperOnly: header.availableOnPaperOnly,
        businessIdentifier: business.identifier,
        commentsCount: ia.commentsCount,
        commentsLink: ia.commentsLink,
        displayName: this.filingTypeToName(FilingTypes.INCORPORATION_APPLICATION),
        documentsLink: ia.documentsLink,
        effectiveDate: this.apiToUtcString(header.effectiveDate),
        filingId: header.filingId,
        filingLink: ia.filingLink,
        isFutureEffective: header.isFutureEffective,
        name: FilingTypes.INCORPORATION_APPLICATION,
        status: header.status,
        submittedDate: this.apiToUtcString(header.date),
        submitter: header.submitter,
        data: {
          applicationDate: this.dateToYyyyMmDd(this.apiToDate(header.date)),
          legalFilings: [FilingTypes.INCORPORATION_APPLICATION]
        }
      }
      this.setFilings([filingItem])
    },

    storeNrData (nr: any, ia: any): void {
      // check if NR is valid
      if (!this.isNrValid(nr)) {
        this.nameRequestInvalidDialog = true
        throw new Error('Invalid NR data')
      }

      // verify that NR type matches entity type from IA
      if (nr.legalType !== this.getEntityType) {
        this.nameRequestInvalidDialog = true
        throw new Error('Invalid NR request type')
      }

      // if IA is not yet completed, check if NR is consumable
      // (once IA is completed, NR state will be CONSUMED)
      if (ia.filing.header.status !== FilingStatus.COMPLETED) {
        const nrState: NameRequestStates = this.getNrState(nr)
        if (nrState !== NameRequestStates.APPROVED && nrState !== NameRequestStates.CONDITIONAL) {
          this.nameRequestInvalidDialog = true
          this.nameRequestInvalidType = nrState
          throw new Error('NR not consumable')
        }
      }

      // save the NR
      this.setNameRequest(nr)

      // save the approved name
      const entityName = this.getNrApprovedName(nr) || ''
      this.setEntityName(entityName || 'Unknown Name')
    },

    storeTasks (response: any): void {
      const tasks = response?.data?.tasks as ApiTaskIF[]
      if (tasks) {
        this.setTasks(tasks)
      } else {
        throw new Error('Invalid tasks')
      }
    },

    storeFilings (response: any): void {
      const filings = response?.data?.filings as ApiFilingIF[]
      if (filings) {
        this.setFilings(filings)
      } else {
        throw new Error('Invalid filings')
      }
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

    /** Creates a draft filing and redirects the user to the Create UI to start a company dissolution filing. */
    async dissolveCompany (): Promise<void> {
      const dissolutionFiling = this.buildDissolutionFiling()
      const draftDissolution = await this.createFiling(this.getIdentifier, dissolutionFiling, true)
      const draftDissolutionId = +draftDissolution?.header?.filingId

      if (!draftDissolution || isNaN(draftDissolutionId)) {
        throw new Error('Invalid API response')
      }

      const url = `${this.createUrl}define-dissolution?id=${this.getIdentifier}`
      window.location.assign(url) // assume URL is always reachable
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
      // re-fetch all data when we (re)route to the dashboard
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
