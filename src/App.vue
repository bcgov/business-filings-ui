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

    <fetchErrorDialog
      :dialog="fetchErrorDialog"
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
    <div class="app-body">
      <!-- only show pages while signing in or once the data is loaded -->
      <main v-if="isSigninRoute || dataLoaded">
        <Breadcrumb :breadcrumbs="breadcrumbs" />
        <EntityInfo
          v-if="!isAmalgamationSelectionRoute"
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
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { GetCurrentAccount, GetFeatureFlag, IsAuthorized, GetKeycloakRoles, Navigate, Sleep, UpdateLdUser }
  from '@/utils'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import { Breadcrumb } from '@/components/common'
import EntityInfo from '@/components/EntityInfo.vue'
import { BusinessAuthErrorDialog, ConfirmDissolutionDialog, DownloadErrorDialog, FetchErrorDialog,
  NameRequestInvalidDialog, NotInGoodStandingDialog } from '@/components/dialogs'
import { ConfigJson } from '@/resources'
import { BreadcrumbMixin, CommonMixin, DateMixin, DirectorMixin, FilingMixin, NameRequestMixin } from '@/mixins'
import { AuthServices, EnumUtilities, LegalServices } from '@/services'
import { ApiFilingIF, ApiTaskIF, DocumentIF, NameRequestIF, OfficeAddressIF, PartyIF, TaskTodoIF, UserInfoIF }
  from '@/interfaces'
import { BreadcrumbIF } from '@bcrs-shared-components/interfaces'
import { AuthorizationRoles, AuthorizedActions, FilingStatus, NameRequestStates, NigsMessage, Routes } from '@/enums'
import { CorpTypeCd, GetCorpFullDescription, GetCorpNumberedDescription }
  from '@bcrs-shared-components/corp-type-module'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from './stores'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

@Component({
  components: {
    Breadcrumb,
    ConfirmDissolutionDialog,
    DownloadErrorDialog,
    BusinessAuthErrorDialog,
    FetchErrorDialog,
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
  authRoles = [] as Array<AuthorizationRoles>
  confirmDissolutionDialog = false
  downloadErrorDialog = false
  dataLoaded = false
  businessAuthErrorDialog = false
  fetchErrorDialog = false
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

  // business store references
  @Getter(useBusinessStore) isEntitySoleProp!: boolean

  @Action(useBusinessStore) loadBusinessInfo!: () => Promise<void>
  @Action(useBusinessStore) setGoodStanding!: (x: boolean) => Promise<void>
  @Action(useBusinessStore) setLegalName!: (x: string) => Promise<void>
  @Action(useBusinessStore) setLegalType!: (x: CorpTypeCd) => Promise<void>
  @Action(useBusinessStore) setIdentifier!: (x: string) => Promise<void>
  @Action(useBusinessStore) setFoundingDate!: (x: string) => Promise<void>

  // configuration store references
  @Getter(useConfigurationStore) getAuthApiGwUrl!: string
  @Getter(useConfigurationStore) getCreateUrl!: string
  @Getter(useConfigurationStore) getBusinessRegistryDashboardUrl!: string

  // root store references
  @Getter(useRootStore) getUserInfo!: UserInfoIF
  @Getter(useRootStore) isAuthorizationStatus!: boolean
  @Getter(useRootStore) isBootstrapFiling!: boolean
  @Getter(useRootStore) isBootstrapPending!: boolean
  @Getter(useRootStore) isBootstrapTodo!: boolean
  @Getter(useRootStore) showFetchingDataSpinner!: boolean
  @Getter(useRootStore) showStartingAmalgamationSpinner!: boolean

  @Action(useRootStore) loadStateFiling!: () => Promise<void>
  @Action(useRootStore) setAuthorizedActions!: (x: Array<AuthorizedActions>) => void
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
  @Action(useRootStore) setFolioNumber!: (x: string) => void
  @Action(useRootStore) setNameRequest!: (x: any) => void
  @Action(useRootStore) setParties!: (x: Array<PartyIF>) => void
  @Action(useRootStore) setPendingsList!: (x: Array<any>) => void
  @Action(useRootStore) setRecordsAddress!: (x: OfficeAddressIF) => void
  @Action(useRootStore) setRegisteredAddress!: (x: OfficeAddressIF) => void
  @Action(useRootStore) setTasks!: (x: Array<ApiTaskIF>) => void
  @Action(useRootStore) setUserInfo!: (x: UserInfoIF) => void

  // filing store references
  @Action(useFilingHistoryListStore) loadFilings!: (x: string) => Promise<void>
  @Action(useFilingHistoryListStore) setFilings!: (x: ApiFilingIF[]) => void

  /** The Business ID string. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Temporary Registration Number string. */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** True if route is Signin. */
  get isSigninRoute (): boolean {
    return (this.$route.name === Routes.SIGNIN)
  }

  /** True if route is Signout. */
  get isSignoutRoute (): boolean {
    return (this.$route.name === Routes.SIGNOUT)
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
    const isAuthenticated = !!sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    if (!isAuthenticated) return

    // wait up to 5 seconds for account id to become available
    // if not found, some things may fail, but proceed anyway
    if (!this.isVitestRunning) {
      for (let i = 0; i < 50; i++) {
        if (GetCurrentAccount()?.id) break
        await Sleep(100)
      }
    }

    await this.fetchData()
  }

  /** Called just before this component is destroyed. */
  beforeUnmount (): void {
    // stop listening for reload data events
    this.$root.$off('reloadData')
  }

  /** Fetches business data / incorp app data. */
  async fetchData (): Promise<void> {
    this.dataLoaded = false

    try {
      // store today's date every time the dashboard is loaded
      const jsDate: Date = await this.getServerDate()
      if (!this.isVitestRunning) {
      // eslint-disable-next-line no-console
        console.info(`It is currently ${this.dateToPacificDateTime(jsDate)}.`)
      }
      this.setCurrentJsDate(jsDate)
      this.setCurrentDate(this.dateToYyyyMmDd(jsDate))

      // load authorized actions (aka permissions)
      // must be called after we have current account info
      await this.loadAuthorizedActions().catch(error => {
        console.log('Authorized actions error =', error) // eslint-disable-line no-console
        this.businessAuthErrorDialog = true
        throw error // go to catch()
      })
      // load auth roles and store locally
      this.authRoles = await this.loadAuthRoles().catch(error => {
        console.log('Auth roles error =', error) // eslint-disable-line no-console
        this.businessAuthErrorDialog = true
        throw error
      })
    } catch (error) {
      // show fetch error dialog if businessAuthErrorDialog isn't already showing
      if (this.businessAuthErrorDialog === false) {
        this.fetchErrorDialog = true
      }
      // Log error in console either way.
      console.log('Fetch data error = ', error) // eslint-disable-line no-console
    }
    // If the error dialogs have been tripped, then don't proceed
    if (this.businessAuthErrorDialog === true ||
      this.fetchErrorDialog === true) {
      return
    }

    // fetch user info and update Launch Darkly
    this.setupLaunchDarkly()

    // Business id safety check
    if (!this.businessId && !this.tempRegNumber) {
      throw new Error('Missing Business Id or Temporary Registration Number')
    }
    // is this a business entity?
    if (this.businessId) {
      try {
        await this.fetchBusinessData() // throws on error
        await this.fetchStoreAddressData() // business address
        this.dataLoaded = true
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
        this.fetchErrorDialog = true
      }
    }
    // is this a bootstrap filing? (eg, incorporation/registration/amalgamation/continuation)
    if (this.tempRegNumber) {
      try {
        this.nameRequestInvalidType = null // reset for new fetches

        // fetch the bootstrap filing and store the bootstrap item
        const response = await LegalServices.fetchBootstrapFiling(this.tempRegNumber)
        this.storeBootstrapItem(response)

        // if it is a todo or a pending filing, and it has a NR, load it
        // (this is to display the NR details in the Todo List/Pending List)
        if ((this.isBootstrapTodo || this.isBootstrapPending) && this.localNrNumber) {
          const nr = await LegalServices.fetchNameRequest(this.localNrNumber)
          this.storeNrData(nr, response)
        }

        this.dataLoaded = true
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
        this.nameRequestInvalidDialog = true
      }
    }
  }

  /** Fetches and stores authorized actions (aka permissions). */
  private async loadAuthorizedActions (): Promise<void> {
    // NB: will throw if API error
    const authorizedActions = await LegalServices.fetchAuthorizedActions()
    // verify we have _some_ authorized actions
    if (!Array.isArray(authorizedActions) || authorizedActions.length < 1) {
      throw new Error('Invalid or missing authorized actions')
    }
    this.setAuthorizedActions(authorizedActions)
  }

  /** Fetches auth roles. */
  private async loadAuthRoles (): Promise<AuthorizationRoles[]> {
    // get roles from KC token
    const authRoles = GetKeycloakRoles()
    // safety check
    if (!Array.isArray(authRoles)) {
      throw new Error('Invalid roles')
    }
    return authRoles
  }

  /** Fetches and stores the business data. */
  async fetchBusinessData (): Promise<void> {
    const data = await Promise.all([
      // FUTURE: all of these should be store actions
      AuthServices.fetchEntityInfo(this.businessId),
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
        error.response.data?.rootCause?.message.includes('address not found')) hasBAError = true
    })

    if (data) {
      this.storeAddresses(data)
    } else if (hasBAError) { // if 404 and business address not found
      this.storeAddresses({ data: { businessOffice: null } })
    } else {
      throw new Error('Incomplete business data')
    }
  }

  /* Gather info for LD and save user's Keycloak GUID */
  async setupLaunchDarkly (): Promise<void> {
    try {
      const userInfo = await AuthServices.fetchUserInfo()
      this.setUserInfo(userInfo)
      await this.updateLaunchDarkly()
    } catch (error) {
      // just log the error -- no need to halt app
      // eslint-disable-next-line no-console
      console.log('Error fetching user info or updating Launch Darkly =', error)
    }
  }

  /** Updates Launch Darkly with current user info. */
  async updateLaunchDarkly (): Promise<void> {
    // don't run when Vitest is running the code
    if (import.meta.env.VITEST) return

    const userInfo = this.getUserInfo
    const userContext = userInfo && {
      kind: 'user',
      key: userInfo.keycloakGuid,
      roles: this.authRoles,
      appSource: import.meta.env.APP_NAME,
      loginSource: userInfo.loginSource,
      lastName: userInfo.lastname,
      firstName: userInfo.firstname,
      email: userInfo.contacts[0]?.email || userInfo.email
    }

    const currentAccount = GetCurrentAccount()
    const orgContext = currentAccount && {
      kind: 'org',
      key: currentAccount.id.toString(),
      type: currentAccount.type,
      accountStatus: currentAccount.accountStatus,
      accountType: currentAccount.accountType,
      appSource: import.meta.env.APP_NAME,
      label: currentAccount.label
    }

    await UpdateLdUser(userContext, orgContext)
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

      // store Folio Number if present
      const folioNumber = response?.data?.folioNumber
      if (folioNumber) this.setFolioNumber(folioNumber)
    } else {
      throw new Error('Invalid entity contact info')
    }
  }
  /**
   * Verifies and stores a bootstrap item's data to make this UI (entity dashboard)
   * look like a business.
   */
  storeBootstrapItem (response: any): void {
    const filing = response?.filing
    const filingName = filing.header?.name as FilingTypes
    const status = filing.header.status as FilingStatus
    const foundingDate = filing.header?.effectiveDate || null // use the FE date as the founding date
    const email =
        filing.incorporationApplication?.contactPoint?.email ||
        filing.amalgamationApplication?.contactPoint?.email ||
        filing.continuationIn?.contactPoint?.email ||
        filing.registration?.contactPoint?.email || null

    if (!filing || !filing.business || !filing.header || !filingName || !status) {
      throw new Error(`Invalid boostrap filing - missing required property = ${filing}`)
    }

    // special check for amalgamation application
    if (filingName === FilingTypes.AMALGAMATION_APPLICATION && !filing.amalgamationApplication.type) {
      throw new Error('Invalid bootstrap filing - missing amalgamation type')
    }

    // NB: different object from actual NR
    const nameRequest = filing[filingName].nameRequest as {
      legalName?: string
      legalType: CorpTypeCd
      nrNumber: string
    }
    if (!nameRequest) {
      throw new Error('Invalid bootstrap filing - missing name request object')
    }

    // verify that this is a supported entity type
    const legalType = nameRequest.legalType
    if (!legalType || !this.supportedEntityTypes.includes(legalType)) {
      throw new Error(`Invalid bootstrap filing - missing or unsupported legal type = ${legalType}`)
    }

    // store business info
    this.setBootstrapFilingStatus(status)
    this.setBootstrapFilingType(filingName)
    this.setIdentifier(this.tempRegNumber)
    this.setLegalType(legalType)
    this.setGoodStanding(true) // draft apps are always in good standing
    this.setFoundingDate(foundingDate)
    this.setBusinessEmail(email)

    // save local NR Number if present
    if (nameRequest.nrNumber) this.localNrNumber = nameRequest.nrNumber

    // store Legal Name if present
    // special case to identify numbered amalgamations
    if (filingName === FilingTypes.AMALGAMATION_APPLICATION) {
      this.setLegalName(nameRequest.legalName || 'Numbered Amalgamated Company')
    } else { this.setLegalName(nameRequest.legalName || GetCorpNumberedDescription(this.getLegalType)) }

    // store the bootstrap item in the right list
    if (this.isBootstrapTodo) this.storeBootstrapTodo(response)
    else if (this.isBootstrapPending) this.storeBootstrapPending(response)
    else if (this.isBootstrapFiling) this.storeBootstrapFiling(response)
    else throw new Error(`Invalid boostrap filing - not a task or pending or filing = ${filing}`)
  }

  /** Stores bootstrap item in the Todo List. */
  storeBootstrapTodo (response: any): void {
    const filing = response.filing as TaskTodoIF
    // NB: these were already validated in storeBootstrapItem()
    const header = filing.header
    const data = filing[header.name]
    const status = header.status

    const description = GetCorpFullDescription(data.nameRequest.legalType)
    const dba = this.isEntitySoleProp ? ' / Doing Business As (DBA) ' : ' '
    const filingName = EnumUtilities.filingTypeToName(header.name, null, data.type, status)

    // save display name for later
    filing.displayName = EnumUtilities.isTypeAmalgamationApplication(header)
      ? filingName
      : `${description}${dba}${filingName}`

    // add this as a task item
    const taskItem: ApiTaskIF = {
      enabled: true,
      order: 1,
      task: { filing }
    }
    this.setTasks([taskItem])
  }

  /** Stores bootstrap item in the Pending List. */
  storeBootstrapPending (response: any): void {
    const filing = response.filing as TaskTodoIF
    // NB: these were already validated in storeBootstrapItem()
    const header = filing.header
    const data = filing[header.name]
    const status = header.status

    // set addresses
    this.storeAddresses({ data: data.offices || [] })

    // set parties
    this.storeParties({ data: { parties: data.parties || [] } })

    const description = GetCorpFullDescription(data.nameRequest.legalType)
    const filingName = EnumUtilities.filingTypeToName(header.name, null, data.type, status)

    // save display name for later
    filing.displayName = `${description} ${filingName}`

    // add this as a pending item
    this.setPendingsList([filing])
  }

  /** Stores bootstrap item in the Filing History List. */
  storeBootstrapFiling (response: any): void {
    const filing = response.filing as TaskTodoIF
    // NB: these were already validated in storeBootstrapItem()
    const header = filing.header
    const data = filing[header.name]
    const status = header.status

    // set addresses
    this.storeAddresses({ data: data.offices || [] })

    // set parties
    this.storeParties({ data: { parties: data.parties || [] } })

    const description = GetCorpFullDescription(data.nameRequest.legalType)
    const filingName = EnumUtilities.filingTypeToName(header.name, null, data.type, status)
    const displayName = EnumUtilities.isTypeAmalgamationApplication(header)
      ? filingName
      : `${description} ${filingName}`

    // add this as a filing item
    const filingItem = {
      availableOnPaperOnly: header.availableOnPaperOnly,
      businessIdentifier: filing.business.identifier || this.getIdentifier,
      commentsCount: response.commentsCount,
      commentsLink: response.commentsLink,
      displayLedger: response.displayLedger,
      displayName,
      documentsLink: response.documentsLink,
      effectiveDate: this.apiToUtcString(header.effectiveDate),
      filingId: header.filingId,
      filingLink: response.filingLink,
      filingSubType: data.type,
      isFutureEffective: header.isFutureEffective,
      name: header.name,
      status: header.status,
      submittedDate: this.apiToUtcString(header.date),
      submitter: header.submitter,
      data: {
        applicationDate: this.dateToYyyyMmDd(this.apiToDate(header.date)),
        legalFilings: [header.name],
        order: data.courtOrder
      },
      latestReviewComment: header.latestReviewComment
    } as ApiFilingIF
    this.setFilings([filingItem])
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
    Navigate(url)
  }

  /** Handles Exit click event from dialogs. */
  onClickExit (): void {
    Navigate(this.getBusinessRegistryUrl)
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
      this.businessAuthErrorDialog = false
      this.fetchErrorDialog = false
      this.nameRequestInvalidDialog = false
      await this.fetchData()
    }
  }
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
  }
  /** Direct to Digital Credentials. **/
  viewAddDigitalCredentials (): void {
    this.$router.push({ name: Routes.DIGITAL_CREDENTIALS })
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
