<template>
  <v-app
    id="app"
    class="app-container theme--light"
  >
    <!-- Dialogs -->
    <DashboardUnavailableDialog
      :dialog="dashboardUnavailableDialog"
      attach="#app"
      @exit="onClickExit()"
      @retry="onClickRetry()"
    />

    <DownloadErrorDialog
      :dialog="downloadErrorDialog"
      attach="#app"
      @close="downloadErrorDialog=false"
    />

    <BusinessAuthErrorDialog
      :dialog="businessAuthErrorDialog"
      attach="#app"
      @exit="onClickExit()"
      @retry="onClickRetry(true)"
    />

    <NameRequestAuthErrorDialog
      :dialog="nameRequestAuthErrorDialog"
      attach="#app"
      @exit="onClickExit()"
      @retry="onClickRetry(true)"
    />

    <NameRequestInvalidDialog
      :dialog="nameRequestInvalidDialog"
      :type="nameRequestInvalidType"
      attach="#app"
      @exit="onClickExit()"
      @retry="onClickRetry()"
    />

    <ConfirmDissolutionDialog
      :dialog="confirmDissolutionDialog"
      attach="#app"
      @close="confirmDissolutionDialog = false"
      @proceed="dissolveCompany()"
    />

    <NotInGoodStandingDialog
      :dialog="notInGoodStandingDialog"
      :message="nigsMessage"
      attach="#app"
      @close="notInGoodStandingDialog = false"
    />

    <!-- Loading Dashboard spinner -->
    <v-fade-transition>
      <div
        v-show="showLoadingDashboardSpinner"
        class="loading-container"
      >
        <div class="loading__content">
          <v-progress-circular
            color="primary"
            size="50"
            indeterminate
          />
          <div
            v-if="!isSignoutRoute"
            class="loading-msg"
          >
            Loading Dashboard
          </div>
        </div>
      </div>
    </v-fade-transition>

    <!-- Fetching Data spinner -->
    <v-fade-transition>
      <div
        v-show="showFetchingDataSpinner"
        class="loading-container grayed-out"
      >
        <div class="loading__content">
          <v-progress-circular
            color="primary"
            size="50"
            indeterminate
          />
          <div class="loading-msg white--text">
            Fetching Data
          </div>
        </div>
      </div>
    </v-fade-transition>

    <SbcHeader />

    <!-- Alert banner -->
    <v-alert
      v-if="bannerText"
      tile
      dense
      type="warning"
    >
      <div
        class="mb-0 text-center colour-dk-text"
        v-html="bannerText"
      />
    </v-alert>

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

    <SbcFooter :aboutText="aboutText" />
  </v-app>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import * as Sentry from '@sentry/browser'
import { GetFeatureFlag, navigate, UpdateLdUser } from '@/utils'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import { Breadcrumb } from '@/components/common'
import EntityInfo from '@/components/EntityInfo.vue'
import {
  BusinessAuthErrorDialog,
  ConfirmDissolutionDialog,
  DashboardUnavailableDialog,
  DownloadErrorDialog,
  NameRequestAuthErrorDialog,
  NameRequestInvalidDialog,
  NotInGoodStandingDialog
} from '@/components/dialogs'
import {
  ConfigJson,
  getMyBusinessRegistryBreadcrumb,
  getRegistryDashboardBreadcrumb,
  getStaffDashboardBreadcrumb
} from '@/resources'
import { CommonMixin, DateMixin, DirectorMixin, EnumMixin, FilingMixin, NameRequestMixin } from '@/mixins'
import { AuthServices, EnumUtilities, LegalServices } from '@/services/'
import {
  ApiFilingIF,
  ApiTaskIF,
  BreadcrumbIF,
  DocumentIF,
  NameRequestIF,
  PartyIF,
  TaskTodoIF
} from '@/interfaces'
import {
  CorpTypeCd,
  EntityStatus,
  FilingStatus,
  FilingTypes,
  NameRequestStates,
  NigsMessage,
  Routes
} from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from './stores'

export default {
  name: 'App',

  components: {
    Breadcrumb,
    ConfirmDissolutionDialog,
    DashboardUnavailableDialog,
    DownloadErrorDialog,
    BusinessAuthErrorDialog,
    NameRequestAuthErrorDialog,
    NameRequestInvalidDialog,
    NotInGoodStandingDialog,
    SbcHeader,
    SbcFooter,
    EntityInfo
  },

  mixins: [
    CommonMixin,
    DateMixin,
    DirectorMixin,
    EnumMixin,
    FilingMixin,
    NameRequestMixin
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

      /** Currently supported entity types in Filings UI. */
      supportedEntityTypes: [
        CorpTypeCd.BENEFIT_COMPANY,
        CorpTypeCd.BC_CCC,
        CorpTypeCd.BC_COMPANY,
        CorpTypeCd.BC_ULC_COMPANY,
        CorpTypeCd.COOP,
        CorpTypeCd.PARTNERSHIP,
        CorpTypeCd.SOLE_PROP
      ]
    }
  },

  computed: {
    ...mapState(useConfigurationStore,
      [
        'getAuthApiUrl',
        'getBusinessUrl',
        'getCreateUrl',
        'getRegHomeUrl'
      ]),

    ...mapState(useBusinessStore,
      [
        'getEntityName',
        'getLegalType',
        'getIdentifier'
      ]),

    ...mapState(useRootStore,
      [
        'getKeycloakRoles',
        'isRoleStaff',
        'showFetchingDataSpinner'
      ]),

    /** The Business ID string. */
    businessId (): string {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /** The Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    },

    /** True if "Loading Dashboard" spinner should be shown. */
    showLoadingDashboardSpinner (): boolean {
      return (
        !this.dataLoaded &&
        !this.dashboardUnavailableDialog &&
        !this.businessAuthErrorDialog &&
        !this.nameRequestAuthErrorDialog &&
        !this.nameRequestInvalidDialog
      )
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
      return import.meta.env.ABOUT_TEXT
    },

    /** Get banner text. */
    bannerText (): string {
      const bannerText: string = GetFeatureFlag('banner-text')
      // remove spaces so that " " becomes falsy
      return bannerText?.trim() || null
    },

    /** The route breadcrumbs list. */
    breadcrumbs (): Array<BreadcrumbIF> {
      const breadcrumbs = this.$route?.meta?.breadcrumb
      const crumbs: Array<BreadcrumbIF> = [
        {
          text: this.getEntityName || 'Unknown Name',
          to: { name: Routes.DASHBOARD }
        },
        ...(breadcrumbs || [])
      ]

      // Set base crumbs based on user role
      // Staff don't want the home landing page and they can't access the Manage Business Dashboard
      if (this.isRoleStaff) {
        // If staff, set StaffDashboard as home crumb
        crumbs.unshift(getStaffDashboardBreadcrumb(this.getBusinessUrl))
      } else {
        // For non-staff, set Home and Dashboard crumbs
        crumbs.unshift(
          getRegistryDashboardBreadcrumb(this.getRegHomeUrl),
          getMyBusinessRegistryBreadcrumb(this.getBusinessUrl))
      }
      return crumbs
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
  },

  /** Called when component is created. */
  created (): void {
    // listen for reload data events
    this.$root.$on('reloadData', () => this.fetchData())
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
  beforeUnmount (): void {
    // stop listening for reload data events
    this.$root.$off('reloadData')
  },

  methods: {
    ...mapActions(useBusinessStore,
      [
        'loadBusinessInfo',
        'setGoodStanding',
        'setLegalName',
        'setLegalType',
        'setIdentifier'
      ]),

    ...mapActions(useFilingHistoryListStore,
      [
        'loadFilings',
        'setFilings'
      ]),

    ...mapActions(useRootStore,
      [
        'loadStateFiling',
        'setAuthRoles',
        'setBusinessAddress',
        'setBusinessEmail',
        'setBusinessPhone',
        'setBusinessPhoneExtension',
        'setConfigObject',
        'setCorpTypeCd',
        'setCurrentDate',
        'setCurrentJsDate',
        'setEntityStatus',
        'setFetchingDataSpinner',
        'setKeycloakRoles',
        'setNameRequest',
        'setParties',
        'setRecordsAddress',
        'setRegisteredAddress',
        'setTasks',
        'setUserInfo',
        'setUserKeycloakGuid'
      ]),

    /** Fetches business data / incorp app data. */
    async fetchData (): Promise<void> {
      this.dataLoaded = false

      // store today's date every time the dashboard is loaded
      const jsDate: Date = await this.getServerDate()
      if (!this.isVitestRunning) {
        // eslint-disable-next-line no-console
        console.info(`It is currently ${this.dateToPacificDateTime(jsDate)}.`)
      }
      this.setCurrentJsDate(jsDate)
      this.setCurrentDate(this.dateToYyyyMmDd(jsDate))

      // check authorizations
      try {
        // get Keycloak roles
        const jwt = this.getJWT()
        const keycloakRoles = this.fetchKeycloakRoles(jwt)
        this.setKeycloakRoles(keycloakRoles)

        // safety check
        if (!this.businessId && !this.tempRegNumber) {
          throw new Error('Missing Business ID or Temporary Registration Number')
        }

        // check if current user is authorized
        const response = await AuthServices.fetchAuthorizations(
          this.getAuthApiUrl, this.businessId || this.tempRegNumber
        )
        this.storeAuthorizations(response) // throws if no role
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
        if (this.businessId) this.businessAuthErrorDialog = true
        if (this.tempRegNumber) this.nameRequestAuthErrorDialog = true
        return // do not execute remaining code
      }

      // fetch user info and update Launch Darkly
      // and save user's Keycloak GUID
      try {
        const userInfo = await AuthServices.fetchUserInfo(this.getAuthApiUrl).then(response => response?.data)
        this.setUserInfo(userInfo)
        await this.updateLaunchDarkly(userInfo)
        this.setUserKeycloakGuid(userInfo.keycloakGuid)
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
        // FUTURE: all of these should be store actions
        AuthServices.fetchEntityInfo(this.getAuthApiUrl, this.businessId),
        this.loadBusinessInfo(),
        LegalServices.fetchTasks(this.businessId),
        this.loadFilings(this.businessId || this.tempRegNumber),
        LegalServices.fetchParties(this.businessId)
      ])

      if (!data || data.length !== 5) throw new Error('Incomplete business data')

      // store data from calls above
      this.storeEntityInfo(data[0])
      this.storeTasks(data[2])
      this.storeParties(data[4])

      // now that we have business info, load state filing
      await this.loadStateFiling()

      // now that we know entity type, store config object
      this.storeConfigObject()
    },

    async fetchStoreAddressData ():Promise<void> {
      let hasBAError = false
      const data = await Promise.resolve(
        LegalServices.fetchAddresses(this.businessId)
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

      const draft = await LegalServices.fetchDraftApp(this.tempRegNumber)

      // Handle Draft filings
      this.storeDraftApp(draft)

      // if the draft has a NR, load it
      if (this.localNrNumber) {
        const nr = await LegalServices.fetchNameRequest(this.localNrNumber)
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

    /** Fetches Keycloak roles from JWT. */
    fetchKeycloakRoles (jwt: any): Array<string> {
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
      // store Keycloak roles in custom object
      const custom = { roles: this.getKeycloakRoles } as any

      await UpdateLdUser(key, email, firstName, lastName, custom)
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
        // store Corp Type Code to compare with Legal Type in business info
        const corpTypeCd = response?.data?.corpType?.code
        if (corpTypeCd) this.setCorpTypeCd(corpTypeCd)
      } else {
        throw new Error('Invalid entity contact info')
      }
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

      // NB: different object from actual NR
      const nameRequest = filing[filingName].nameRequest as {
        legalName?: string
        legalType: CorpTypeCd
        nrNumber: string
      }
      if (!nameRequest) {
        throw new Error(`Invalid ${filingName} filing - Name Request object`)
      }

      // verify that this is a supported entity type
      const legalType = nameRequest.legalType
      if (!legalType || !this.supportedEntityTypes.includes(legalType)) {
        throw new Error(`Invalid ${filingName} filing - legal type`)
      }

      // store business info
      this.setIdentifier(this.tempRegNumber)
      this.setLegalType(legalType)

      // Draft Applications are always in good standing
      this.setGoodStanding(true)

      // save local NR Number if present
      this.localNrNumber = nameRequest.nrNumber || null

      // store Legal Name if present
      if (nameRequest.legalName) this.setLegalName(nameRequest.legalName)

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
      const filingItem = {
        availableOnPaperOnly: header.availableOnPaperOnly,
        businessIdentifier: this.getIdentifier,
        commentsCount: filedApplication.commentsCount,
        commentsLink: filedApplication.commentsLink,
        displayName: EnumUtilities.filingTypeToName(header.name),
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
      } as ApiFilingIF
      this.setFilings([filingItem])
    },

    storeNrData (nr: NameRequestIF, ia: any): void {
      // verify that NR is valid
      const error = this.isNrInvalid(nr)
      if (error) {
        this.nameRequestInvalidDialog = true
        throw new Error(error)
      }

      // verify that NR type matches entity type from application
      if (nr.legalType !== this.getLegalType) {
        this.nameRequestInvalidDialog = true
        throw new Error('Invalid NR request type')
      }

      // if IA is not yet completed, check if NR is consumable
      // (once IA is completed, NR state will be CONSUMED)
      if (ia.filing.header.status !== FilingStatus.COMPLETED) {
        const nrState = this.getNrState(nr) as NameRequestStates
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
      this.setLegalName(entityName || 'Unknown Name')
    },

    storeTasks (response: any): void {
      const tasks = response?.data?.tasks as ApiTaskIF[]
      if (tasks) {
        this.setTasks(tasks)
      } else {
        throw new Error('Invalid tasks')
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
    storeConfigObject (): void {
      const configObject = ConfigJson.find(x => x.entityType === this.getLegalType)
      this.setConfigObject(configObject)
    },

    /** Creates a draft filing and navigates to the Create UI to file a company dissolution filing. */
    async dissolveCompany (): Promise<void> {
      const dissolutionFiling = this.buildDissolutionFiling()
      const draftDissolution = await LegalServices.createFiling(this.getIdentifier, dissolutionFiling, true)
      const draftDissolutionId = +draftDissolution?.header?.filingId

      if (!draftDissolution || isNaN(draftDissolutionId)) {
        throw new Error('Invalid API response')
      }

      const url = `${this.getCreateUrl}define-dissolution?id=${this.getIdentifier}`
      navigate(url)
    },

    /** Handles Exit click event from dialogs. */
    onClickExit (): void {
      navigate(this.getBusinessUrl)
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
      this.setFetchingDataSpinner(true)
      const summaryDocument: DocumentIF = {
        title: 'Summary',
        filename: `${this.businessId} Summary - ${this.getCurrentDate}.pdf`,
        link: `businesses/${this.businessId}/documents/summary`
      }

      await LegalServices.fetchDocument(summaryDocument).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDocument() error =', error)
        this.downloadErrorDialog = true
      })
      this.setFetchingDataSpinner(false)
    },

    /** Direct to Digital Credentials. **/
    viewAddDigitalCredentials (): void {
      this.$router.push({ name: Routes.DIGITAL_CREDENTIALS })
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
