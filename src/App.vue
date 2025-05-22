<template>
  <v-app
    id="app"
    class="app-container theme--light"
  >
    <!-- Dialogs -->
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
    <SbcHeader />

    <!-- Alert banner -->
    <v-alert
      v-if="bannerText"
      tile
      dense
      class="mb-0"
      color="#fb8c00"
    >
      <div
        class="text-center color-white"
        v-html="bannerText"
      />
    </v-alert>

    <SbcFooter :aboutText="aboutText" />
  </v-app>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import * as Sentry from '@sentry/browser'
import { GetFeatureFlag, IsAuthorized, navigate, sleep, UpdateLdUser } from '@/utils'
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
import { ConfigJson } from '@/resources'
import { BreadcrumbMixin, CommonMixin, DateMixin, DirectorMixin, FilingMixin, NameRequestMixin }
  from '@/mixins'
import { AuthServices, LegalServices } from '@/services/'
import {
  AccountInformationIF,
  ApiFilingIF,
  ApiTaskIF,
  NameRequestIF,
  OfficeAddressIF,
  PartyIF
} from '@/interfaces'
import { BreadcrumbIF } from '@bcrs-shared-components/interfaces'
import { AuthorizationRoles, AuthorizedActions, FilingStatus, NameRequestStates, NigsMessage, Routes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { CorpTypeCd }
  from '@bcrs-shared-components/corp-type-module'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { useAuthenticationStore, useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore }
  from './stores'
import { sleep } from './utils'

@Component({
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
  }
})
export default class App extends Mixins(
  BreadcrumbMixin,
  CommonMixin,
  DateMixin,
  DirectorMixin,
  FilingMixin,
  NameRequestMixin
) {
  // local variables
  confirmDissolutionDialog = false
  downloadErrorDialog = false
  dataLoaded = false
  dashboardUnavailableDialog = false
  businessAuthErrorDialog = false
  nameRequestAuthErrorDialog = false
  nameRequestInvalidDialog = false
  nameRequestInvalidType = null as NameRequestStates
  notInGoodStandingDialog = false
  nigsMessage = null as NigsMessage
  localNrNumber = null as string

  /** Currently supported entity types in Filings UI. */
  supportedEntityTypes = [
    CorpTypeCd.BC_CCC,
    CorpTypeCd.BC_COMPANY,
    CorpTypeCd.BC_ULC_COMPANY,
    CorpTypeCd.BEN_CONTINUE_IN,
    CorpTypeCd.BENEFIT_COMPANY,
    CorpTypeCd.CCC_CONTINUE_IN,
    CorpTypeCd.CONTINUE_IN,
    CorpTypeCd.COOP,
    CorpTypeCd.PARTNERSHIP,
    CorpTypeCd.SOLE_PROP,
    CorpTypeCd.ULC_CONTINUE_IN
  ]

  // authentication store references
  @Getter(useAuthenticationStore) getCurrentAccountId!: number

  // business store references
  @Getter(useBusinessStore) isEntitySoleProp!: boolean

  // configuration store references
  @Getter(useConfigurationStore) getAuthApiUrl!: string
  @Getter(useConfigurationStore) getCreateUrl!: string

  // root store references
  @Getter(useRootStore) getAuthRoles!: Array<AuthorizationRoles>
  @Getter(useRootStore) getKeycloakRoles!: Array<string>
  @Getter(useRootStore) isAuthorizationStatus!: boolean
  @Getter(useRootStore) showFetchingDataSpinner!: boolean
  @Getter(useRootStore) showStartingAmalgamationSpinner!: boolean

  /** The Business ID string. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Temporary Registration Number string. */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** True if "Loading Dashboard" spinner should be shown. */
  get showLoadingDashboardSpinner (): boolean {
    return (
      !this.dataLoaded &&
      !this.dashboardUnavailableDialog &&
      !this.businessAuthErrorDialog &&
      !this.nameRequestAuthErrorDialog &&
      !this.nameRequestInvalidDialog
    )
  }

  /** True if route is Signin. */
  get isSigninRoute (): boolean {
    return (this.$route.name === Routes.SIGNIN)
  }

  /** True if route is Signout. */
  get isSignoutRoute (): boolean {
    return (this.$route.name === Routes.SIGNOUT)
  }

  /** True if user is authenticated. */
  // FUTURE: use `authenticationStore.isAuthenticated` instead?
  get isAuthenticated (): boolean {
    const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    // FUTURE: also check that token isn't expired!
    return !!keycloakToken
  }

  /** Is true if this is the amalgamation selection panel page. */
  get isAmalgamationSelectionRoute (): boolean {
    return this.$route?.name === Routes.AMALGAMATION_SELECTION
  }

  /** The About text. */
  get aboutText (): string {
    const aboutApp = import.meta.env.ABOUT_APP
    const aboutSbc = import.meta.env.ABOUT_SBC
    return `${aboutApp}<br>${aboutSbc}`
  }

  /** Get banner text. */
  get bannerText (): string {
    const bannerText: string = GetFeatureFlag('banner-text')
    // remove spaces so that " " becomes falsy
    return bannerText?.trim() || null
  }

  /** Spinner text. */
  get spinnerText (): string {
    if (this.showFetchingDataSpinner) return 'Fetching Data'
    if (this.showStartingAmalgamationSpinner) return 'Starting Amalgamation'
    return null
  }

  /** The route breadcrumbs list. */
  get breadcrumbs (): Array<BreadcrumbIF> {
    const breadcrumbs = this.$route?.meta?.breadcrumb
    const crumbs: Array<BreadcrumbIF> = [
      this.getDashboardBreadcrumb(),
      ...(breadcrumbs || [])
    ]

    // Set base crumbs based on user role
    // Staff don't want the home landing page and they can't access the Manage Business Dashboard
    if (IsAuthorized(AuthorizedActions.STAFF_BREADCRUMBS)) {
      // If staff, set StaffDashboard as home crumb
      crumbs.unshift(this.getStaffDashboardBreadcrumb())
    } else {
      // For non-staff, set Home and Dashboard crumbs
      crumbs.unshift(
        this.getBcRegistriesDashboardBreadcrumb(),
        this.getMyBusinessRegistryBreadcrumb())
    }
    return crumbs
  }

  @Watch('$route')
  private async onRouteChanged (): Promise<void> {
    // re-fetch all data when we (re)route to the dashboard
    // (does not fire on initial dashboard load)
    if (this.$route.name === Routes.DASHBOARD) {
      await this.fetchData()
    }
  }

  /** Called when component is created. */
  created (): void {
    // listen for reload data events
    this.$root.$on('reloadData', async () => {
      // clear lists before fetching new data
      this.setTasks([])
      this.setPendingsList([])
      this.setFilings([])
      await this.fetchData()
    })
  }

  /** Called when component is mounted. */
  async mounted (): Promise<void> {
    // do not fetch data if we need to authenticate
    // just let signin page do its thing
    if (!this.isAuthenticated) return

    // wait up to 1 second for account id to become available
    // if not found, some things may fail (but don't block)
    if (!this.isVitestRunning) {
      for (let i = 0; i < 10; i++) {
        if (this.getCurrentAccountId) break
        await sleep(100)
      }
    }

    // ...otherwise proceed
    await this.fetchData()
  }

  /** Called just before this component is destroyed. */
  beforeUnmount (): void {
    // stop listening for reload data events
    this.$root.$off('reloadData')
  }

  @Action(useBusinessStore) loadBusinessInfo!: () => Promise<void>
  @Action(useBusinessStore) setGoodStanding!: (x: boolean) => Promise<void>
  @Action(useBusinessStore) setLegalName!: (x: string) => Promise<void>
  @Action(useBusinessStore) setLegalType!: (x: CorpTypeCd) => Promise<void>
  @Action(useBusinessStore) setIdentifier!: (x: string) => Promise<void>
  @Action(useBusinessStore) setFoundingDate!: (x: string) => Promise<void>

  @Action(useFilingHistoryListStore) loadFilings!: (x: string) => Promise<void>
  @Action(useFilingHistoryListStore) setFilings!: (x: ApiFilingIF[]) => void

  @Action(useRootStore) loadStateFiling!: () => Promise<void>
  @Action(useRootStore) setAccountInformation!: (x: AccountInformationIF) => void
  @Action(useRootStore) setAuthRoles!: (x: Array<AuthorizationRoles>) => void
  @Action(useRootStore) setBootstrapFilingStatus!: (x: FilingStatus) => void
  @Action(useRootStore) setBootstrapFilingType!: (x: FilingTypes) => void
  @Action(useRootStore) setBusinessAddress!: (x: OfficeAddressIF) => void
  @Action(useRootStore) setBusinessEmail!: (x: string) => void
  @Action(useRootStore) setBusinessPhone!: (x: string) => void
  @Action(useRootStore) setBusinessPhoneExtension!: (x: string) => void
  @Action(useRootStore) setConfigObject!: (x: any) => void
  @Action(useRootStore) setCorpTypeCd!: (x: CorpTypeCd) => void
  @Action(useRootStore) setCurrentDate!: (x: string) => void
  @Action(useRootStore) setCurrentJsDate!: (x: Date) => void
  @Action(useRootStore) setFetchingDataSpinner!: (x: boolean) => void
  @Action(useRootStore) setKeycloakRoles!: (x: Array<string>) => void
  @Action(useRootStore) setNameRequest!: (x: any) => void
  @Action(useRootStore) setNoRedirect!: (x: boolean) => void
  @Action(useRootStore) setParties!: (x: Array<PartyIF>) => void
  @Action(useRootStore) setPendingsList!: (x: Array<any>) => void
  @Action(useRootStore) setRecordsAddress!: (x: OfficeAddressIF) => void
  @Action(useRootStore) setRegisteredAddress!: (x: OfficeAddressIF) => void
  @Action(useRootStore) setTasks!: (x: Array<ApiTaskIF>) => void
  @Action(useRootStore) setUserInfo!: (x: any) => void
  @Action(useRootStore) setUserKeycloakGuid!: (x: string) => void

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
    this.checkAuth()
    // If the error dialogs have been tripped, then don't proceed
    if (this.businessAuthErrorDialog === true || this.nameRequestAuthErrorDialog === true) {
      return
    }

    // fetch user info and update Launch Darkly
    this.setupLaunchDarkly()

    // check whether to redirect to the new Business Dashboard
    if (this.$route.query.noRedirect !== undefined) this.setNoRedirect(true)
    if (!this.isNoRedirect && (this.$route.name === Routes.DASHBOARD)) {
      const identifier = (this.businessId || this.tempRegNumber)
      const dashboardUrl = `${this.getBusinessDashUrl}${identifier}${this.$route.fullPath}`
      navigate(dashboardUrl)
      return
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
  }

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

    // now that we have business info, load the state filing (if there is one)
    await this.loadStateFiling()

    // now that we know entity type, store config object
    this.storeConfigObject()
  }

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
  }

  /** Check authorizations. */
  async checkAuth (): Promise<void> {
    try {
      // load account information
      await this.loadAccountInformation().catch(error => {
        console.log('Account info error = ', error) // eslint-disable-line no-console
        throw error
      })

      // safety check
      if (!this.businessId) {
        throw new Error('Missing Business ID')
      }
      // check if current user is authorized
      const response = await AuthServices.fetchAuthorizations(
        this.getAuthApiUrl, this.businessId
      )
      this.storeAuthorizations(response) // throws if no role
      const authRoles: Array<AuthorizationRoles> = response.roles || []
      if (!Array.isArray(authRoles)) {
        throw new Error('Invalid auth roles 1')
      }

      // verify that array has "view" or "staff" roles
      if (
        !authRoles.includes(AuthorizationRoles.VIEW) &&
        !authRoles.includes(AuthorizationRoles.STAFF)
      ) {
        throw new Error('Invalid auth roles 2')
      }

      this.setAuthRoles(authRoles)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      if (this.businessId) this.businessAuthErrorDialog = true
      if (this.tempRegNumber) this.nameRequestAuthErrorDialog = true
      // do not execute remaining code
    }
  }

  /* Gather info for LD and save user's Keycloak GUID */
  async setupLaunchDarkly (): Promise<void> {
    try {
      const userInfo = await AuthServices.fetchUserInfo(this.getAuthApiUrl)
      this.setUserInfo(userInfo)
      await this.updateLaunchDarkly(userInfo)
      this.setUserKeycloakGuid(userInfo.keycloakGuid)
    } catch (error) {
      // just log the error -- no need to halt app
      // eslint-disable-next-line no-console
      console.log('Error fetching user info or updating Launch Darkly =', error)
    }
  }
  /** Gets Keycloak JWT and parses it. */
  getJWT (): any {
    const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    if (keycloakToken) {
      return this.parseKcToken(keycloakToken)
    }
    throw new Error('Error getting Keycloak token')
  }

  /**
   * Gets account info and stores it.
   * Among other things, this is how we find out if this is a staff account.
   */
  private async loadAccountInformation (): Promise<any> {
    let currentAccount = null

    for (let i = 0; i < 50; i++) {
      const account = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
      if (account) {
        try {
          currentAccount = JSON.parse(account)
          break
        } catch (error) {
          console.error('Failed to parse account from sessionStorage', error)
        }
        await sleep(100)
      }
    }
    if (currentAccount) {
      const accountInfo: AccountInformationIF = {
        accountType: currentAccount.accountType,
        id: currentAccount.id,
        label: currentAccount.label,
        type: currentAccount.type
      }
      this.setAccountInformation(accountInfo)
    }
  }

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
  }

  /** Fetches Keycloak roles from JWT. */
  fetchKeycloakRoles (jwt: any): Array<string> {
    const keycloakRoles = jwt.roles
    if (keycloakRoles && keycloakRoles.length > 0) {
      return keycloakRoles
    }
    throw new Error('Error getting Keycloak roles')
  }

  storeAuthorizations (response: any): void {
    const authRoles: Array<AuthorizationRoles> = response?.roles || []
    if (authRoles && authRoles.length > 0) {
      this.setAuthRoles(authRoles)
    } else {
      throw new Error('Invalid auth roles')
    }
  }

  /** Updates Launch Darkly with current user info. */
  async updateLaunchDarkly (userInfo: any): Promise<void> {
    // since username is unique, use it as the user key
    const key: string = userInfo.username
    const email: string = userInfo.contacts[0]?.email || userInfo.email
    const firstName: string = userInfo?.firstname
    const lastName: string = userInfo?.lastname
    // store auth roles in custom object
    const custom = { roles: this.getAuthRoles } as any

    await UpdateLdUser(key, email, firstName, lastName, custom)
  }

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
  }

  storeNrData (nr: NameRequestIF, app: any): void {
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
    if (app.filing.header.status !== FilingStatus.COMPLETED) {
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
  }

  storeTasks (response: any): void {
    const tasks = response?.data?.tasks as ApiTaskIF[]
    if (tasks) {
      this.setTasks(tasks)
    } else {
      throw new Error('Invalid tasks')
    }
  }

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
  }

  storeParties (response: any): void {
    const parties = response?.data?.parties as PartyIF[]
    if (parties) {
      this.setParties(parties)
    } else {
      throw new Error('Invalid parties')
    }
  }

  /** Stores config object matching the specified entity type. */
  storeConfigObject (): void {
    const configObject = ConfigJson.find(x => x.entityType === this.getLegalType)
    this.setConfigObject(configObject)
  }

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
  }

  /** Handles Exit click event from dialogs. */
  onClickExit (): void {
    navigate(this.getBusinessesUrl)
  }

  /** Handles Retry click event from dialogs. */
  async onClickRetry (hard = false): Promise<void> {
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
      await this.fetchData()
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

.color-white {
  color: white;
}
</style>
