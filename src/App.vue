<template>
  <v-app class="app-container theme--light" id="app">
    <!-- Dialogs -->
    <DashboardUnavailableDialog
      :dialog="dashboardUnavailableDialog"
      @exit="onClickExit()"
      @retry="onClickRetry()"
      attach="#app"
    />

    <DownloadErrorDialog
      :dialog="downloadErrorDialog"
      @close="downloadErrorDialog=false"
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

    <ConfirmDissolutionDialog
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

    <SbcHeader class="d-flex" />
    <PaySystemAlert />

    <div class="app-body">
      <!-- only show pages while signing in or once the data is loaded -->
      <main v-if="isSigninRoute || dataLoaded">
        <Breadcrumb :breadcrumbs="breadcrumbs" />
        <EntityInfo
          @confirmDissolution="confirmDissolutionDialog = true"
          @notInGoodStanding="nigsMessage = $event; notInGoodStandingDialog = true"
          @downloadBusinessSummary="downloadBusinessSummary()"
          @viewAddDigitalCredentials="viewAddDigitalCredentials()"
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
import * as Sentry from '@sentry/browser'
import { navigate, updateLdUser } from '@/utils'

// Components
import PaySystemAlert from 'sbc-common-components/src/components/PaySystemAlert.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import { Breadcrumb } from '@/components/common'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import {
  BusinessAuthErrorDialog,
  ConfirmDissolutionDialog,
  DashboardUnavailableDialog,
  DownloadErrorDialog,
  NameRequestAuthErrorDialog,
  NameRequestInvalidDialog,
  NotInGoodStandingDialog
} from '@/components/dialogs'

// Configuration objects
import {
  ConfigJson,
  getMyBusinessRegistryBreadcrumb,
  getRegistryDashboardBreadcrumb,
  getStaffDashboardBreadcrumb
} from '@/resources'

// Mixins, Interfaces, Enums and Constants
import {
  AuthApiMixin,
  CommonMixin,
  DateMixin,
  DirectorMixin,
  EnumMixin,
  FilingMixin,
  LegalApiMixin,
  NameRequestMixin
} from '@/mixins'
import {
  ApiFilingIF,
  ApiTaskIF,
  BreadcrumbIF,
  BusinessIF,
  DocumentIF,
  PartyIF,
  TaskTodoIF
} from '@/interfaces'
import {
  CorpTypeCd,
  DissolutionTypes,
  EntityState,
  EntityStatus,
  FilingStatus,
  FilingTypes,
  NameRequestStates,
  NigsMessage,
  Routes
} from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

export default {
  name: 'App',

  mixins: [
    AuthApiMixin, CommonMixin, DateMixin, DirectorMixin, EnumMixin, FilingMixin, LegalApiMixin, NameRequestMixin
  ],

  data () {
    return {
      confirmDissolutionDialog: false,
      downloadErrorDialog: false,
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

      /** Currently supported entity types in Filings UI. */
      supportedEntityTypes: [
        CorpTypeCd.BENEFIT_COMPANY,
        CorpTypeCd.BC_COMPANY,
        CorpTypeCd.BC_ULC_COMPANY,
        CorpTypeCd.BC_CCC,
        CorpTypeCd.COOP,
        CorpTypeCd.SOLE_PROP,
        CorpTypeCd.PARTNERSHIP
      ]
    }
  },

  components: {
    Breadcrumb,
    ConfirmDissolutionDialog,
    DashboardUnavailableDialog,
    DownloadErrorDialog,
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

    /** The Temporary Registration Number string. */
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
      const crumbs: Array<BreadcrumbIF> = [
        {
          text: this.getEntityName || this.getCorpTypeNumberedDescription(this.getEntityType),
          to: { name: Routes.DASHBOARD }
        },
        ...(breadcrumbs || [])
      ]

      // Set base crumbs based on user role
      // Staff don't want the home landing page and they can't access the Manage Business Dashboard
      if (this.isRoleStaff) {
        // If staff, set StaffDashboard as home crumb
        crumbs.unshift(getStaffDashboardBreadcrumb())
      } else {
        // For non-staff, set Home and Dashboard crumbs
        crumbs.unshift(getRegistryDashboardBreadcrumb(), getMyBusinessRegistryBreadcrumb())
      }

      return crumbs
    }
  },

  /** Called when component is created. */
  created (): void {
    // listen for reload data events
    this.$root.$on('reloadData', () => this.fetchData())

    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })
  },

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // do not fetch data if we need to authenticate
    // just let signin page do its thing
    if (!this.isAuthenticated) return

    // ...otherwise proceed
    await this.fetchData()
  },

  /** Called just before this component is destroyed. */
  beforeDestroy (): void {
    // stop listening for reload data events
    this.$root.$off('reloadData')

    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
  },

  methods: {
    ...mapActions(['setKeycloakRoles', 'setAuthRoles', 'setBusinessEmail', 'setBusinessPhone',
      'setBusinessPhoneExtension', 'setCurrentJsDate', 'setCurrentDate', 'setEntityName', 'setEntityType',
      'setEntityStatus', 'setBusinessNumber', 'setIdentifier', 'setEntityFoundingDate', 'setTasks',
      'setFilings', 'setRegisteredAddress', 'setRecordsAddress', 'setBusinessAddress', 'setParties',
      'setLastAnnualReportDate', 'setNameRequest', 'setLastAddressChangeDate', 'setLastDirectorChangeDate',
      'setConfigObject', 'setReasonText', 'setEntityState', 'setAdminFreeze', 'setWarnings',
      'setGoodStanding', 'setHasCourtOrders']),

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
          await this.fetchStoreAddressData() // business address
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

      // is this a draft app entity?
      if (this.tempRegNumber) {
        try {
          await this.fetchDraftAppData() // throws on error
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
        this.fetchParties(this.businessId)
      ])

      if (!data || data.length !== 5) throw new Error('Incomplete business data')

      this.storeEntityInfo(data[0])
      await this.storeBusinessInfo(data[1])
      this.storeTasks(data[2])
      this.storeFilings(data[3])
      this.storeParties(data[4])
    },

    async fetchStoreAddressData ():Promise<void> {
      let hasBAError = false
      const data = await Promise.resolve(
        this.fetchAddresses(this.businessId)
      ).catch(error => {
        if (error.response.status === 404 &&
          error.response.config.url.includes('addresses') &&
          error.response.data.message.includes('address not found')) hasBAError = true
      })

      if (data) {
        this.storeAddresses(data)
      } else if (hasBAError) { // if 404 and business address not found
        this.storeAddresses({ data: { businessOffice: null } })
      } else {
        throw new Error('Incomplete business data')
      }
    },

    /** Fetches and stores the draft application data. */
    async fetchDraftAppData (): Promise<void> {
      this.nameRequestInvalidType = null // reset for new fetches

      const draft = await this.fetchDraftApp(this.tempRegNumber)

      // Handle Draft filings
      this.storeDraftApp(draft)

      // if the draft has a NR, load it
      if (this.localNrNumber) {
        const nr = await this.fetchNameRequest(this.localNrNumber)
        this.storeNrData(nr, draft)
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
      this.setWarnings(Array.isArray(business.warnings) ? business.warnings : [])
      this.setGoodStanding(business.goodStanding)
      this.setHasCourtOrders(business.hasCourtOrders)

      if (business.state === EntityState.HISTORICAL) {
        await this.parseStateFiling(business.stateFiling) // will throw on error
      }

      // store config object based on current entity type
      this.storeConfigObject(business.legalType)
    },

    /** Fetches and parses the filing that changed the business state. */
    async parseStateFiling (stateFiling: string): Promise<void> {
      const filing = stateFiling && await this.fetchFiling(stateFiling)
      const effectiveDate = filing?.header?.effectiveDate as string
      const filingType = filing?.header?.name as FilingTypes

      if (!filing || !effectiveDate || !filingType) {
        throw new Error('Invalid state filing')
      }

      // create reason text to display in the info header
      let name: string
      if (filingType === FilingTypes.DISSOLUTION) {
        name = this.dissolutionTypeToName(
          (filing?.dissolution?.dissolutionType as DissolutionTypes) ||
          DissolutionTypes.UNKNOWN
        )
      } else {
        name = this.filingTypeToName(filingType)
      }
      const enDash = '–' // ALT + 0150
      const date = this.apiToPacificDateTime(effectiveDate, true) as string
      this.setReasonText(`${name} ${enDash} ${date}`)
    },

    /** Verifies and stores a draft applications data. */
    storeDraftApp (application: any): void {
      const filing = application?.filing
      const filingName = filing.header?.name as FilingTypes
      if (!filing || !filing.header || !filingName) {
        throw new Error(`Invalid ${filingName} filing`)
      }

      if (![FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION].includes(filingName)) {
        throw new Error(`Invalid ${filingName} filing - filing name`)
      }

      const status = filing.header.status as FilingStatus
      if (!status) {
        throw new Error(`Invalid ${filingName} filing - filing status`)
      }

      const nameRequest = filing[filingName].nameRequest
      if (!nameRequest) {
        throw new Error(`Invalid ${filingName} filing - Name Request object`)
      }

      // verify that this is a supported entity type
      const legalType = nameRequest.legalType as CorpTypeCd
      if (!legalType || !this.supportedEntityTypes.includes(legalType)) {
        throw new Error(`Invalid ${filingName} filing - legal type`)
      }

      // store business info
      this.setIdentifier(this.tempRegNumber)
      this.setEntityType(legalType)

      // store NR Number if present
      // (look for old or new property name)
      this.localNrNumber = nameRequest?.nrNum || nameRequest?.nrNumber || null

      // store Legal Name if present
      this.setEntityName(nameRequest?.legalName || null)

      switch (status) {
        case FilingStatus.DRAFT:
        case FilingStatus.PENDING:
          // this is a draft application
          this.setEntityStatus(EntityStatus.DRAFT_APP)
          this.storeDraftAppTask(application)
          break

        case FilingStatus.COMPLETED:
        case FilingStatus.PAID:
          // this is a filed application
          this.setEntityStatus(EntityStatus.FILED_APP)
          this.storeFiledApp(application)
          break

        default:
          throw new Error(`Invalid ${filingName} filing - filing status`)
      }
    },

    /** Stores draft application as a task in the Todo List. */
    storeDraftAppTask (application: any): void {
      const filing = application.filing as TaskTodoIF
      const taskItem: ApiTaskIF = {
        enabled: true,
        order: 1,
        task: { filing }
      }
      this.setTasks([taskItem])
    },

    /** Stores filed application as a filing in the Filing History List. */
    storeFiledApp (filedApplication: any): void {
      const filing = filedApplication.filing as TaskTodoIF
      // NB: these were already validated in storeDraftApp()
      const header = filing.header
      const application = filing[header.name]

      // set addresses
      this.storeAddresses({ data: application.offices || [] })

      // Set parties
      this.storeParties({ data: { parties: application.parties || [] } })

      // add this as a filing (for Filing History List)
      const filingItem: ApiFilingIF = {
        availableOnPaperOnly: header.availableOnPaperOnly,
        businessIdentifier: this.getIdentifier,
        commentsCount: filedApplication.commentsCount,
        commentsLink: filedApplication.commentsLink,
        displayName: this.filingTypeToName(header.name),
        documentsLink: filedApplication.documentsLink,
        effectiveDate: this.apiToUtcString(header.effectiveDate),
        filingId: header.filingId,
        filingLink: filedApplication.filingLink,
        isFutureEffective: header.isFutureEffective,
        name: header.name,
        status: header.status,
        submittedDate: this.apiToUtcString(header.date),
        submitter: header.submitter,
        data: {
          applicationDate: this.dateToYyyyMmDd(this.apiToDate(header.date)),
          legalFilings: [header.name]
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

      // verify that NR type matches entity type from application
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
        if (response.data.businessOffice) {
          this.setBusinessAddress(this.omitProps(response.data.businessOffice,
            ['deliveryAddress', 'mailingAddress'], ['addressType']))
        }
      } else {
        throw new Error('invalid office addresses')
      }
    },

    storeParties (response: any): void {
      const parties = response?.data?.parties as PartyIF[]
      if (parties) {
        this.setParties(parties)
      } else {
        throw new Error('Invalid parties')
      }
    },

    /** Stores config object matching the specified entity type. */
    storeConfigObject (entityType: string): void {
      const configObject = ConfigJson.find(x => x.entityType === entityType)
      this.setConfigObject(configObject)
    },

    /** Creates a draft filing and navigates to the Create UI to file a company dissolution filing. */
    async dissolveCompany (): Promise<void> {
      const dissolutionFiling = this.buildDissolutionFiling()
      const draftDissolution = await this.createFiling(this.getIdentifier, dissolutionFiling, true)
      const draftDissolutionId = +draftDissolution?.header?.filingId

      if (!draftDissolution || isNaN(draftDissolutionId)) {
        throw new Error('Invalid API response')
      }

      const url = `${this.createUrl}define-dissolution?id=${this.getIdentifier}`
      navigate(url)
    },

    /** Handles Exit click event from dialogs. */
    onClickExit (): void {
      navigate(this.bcrosHomeUrl)
    },

    /** Handles Retry click event from dialogs. */
    onClickRetry (hard = false): void {
      if (hard) {
        // clear session variables and hard-reload the page
        // to force new login and try again
        sessionStorage.clear()
        location.reload()
      } else {
        // try to fetch the data again
        this.dashboardUnavailableDialog = false
        this.businessAuthErrorDialog = false
        this.nameRequestAuthErrorDialog = false
        this.nameRequestInvalidDialog = false
        this.fetchData()
      }
    },

    /** Request and Download Business Summary Document. */
    async downloadBusinessSummary (): Promise<void> {
      this.showSpinner = true
      const summaryDocument: DocumentIF = {
        title: 'Summary',
        filename: `${this.businessId} Summary - ${this.getCurrentDate}.pdf`,
        link: `businesses/${this.businessId}/documents/summary`
      }

      await this.fetchDocument(summaryDocument).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDocument() error =', error)
        this.downloadErrorDialog = true
      })
      this.showSpinner = false
    },

    /** Direct to Digital Credentials. **/
    viewAddDigitalCredentials (): void {
      this.$router.push({ name: Routes.DIGITAL_CREDENTIALS })
    }
  },

  watch: {
    async '$route' (): Promise<void> {
      // re-fetch all data when we (re)route to the dashboard
      // (does not fire on initial dashboard load)
      if (this.$route.name === Routes.DASHBOARD) {
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
