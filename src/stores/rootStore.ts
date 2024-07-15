import { defineStore } from 'pinia'
import { CorpTypeCd, EntityStatus, FilingSubTypes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { ApiTaskIF, DissolutionConfirmationResourceIF, FilingDataIF, OfficeAddressIF, PartyIF,
  RootStateIF, TodoListResourceIF, IsoDatePacific, StateFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities, LegalServices } from '@/services'
import { useBusinessStore } from './businessStore'
import { useFilingHistoryListStore } from './filingHistoryListStore'

export const useRootStore = defineStore('root', {
  state: (): RootStateIF => ({
    authRoles: [],
    currentDate: null,
    currentJsDate: null,
    entityStatus: null,
    keycloakRoles: [],
    stateFiling: null,
    userKeycloakGuid: null,
    businessEmail: null,
    businessPhone: null,
    businessPhoneExtension: null,
    corpTypeCd: null,
    ARFilingYear: null,
    arMaxDate: null,
    arMinDate: null,
    nextARDate: null,
    businessAddress: null,
    configObject: null,
    fetchingDataSpinner: false,
    startingAmalgamationSpinner: false,
    filingData: [],
    nameRequest: null,
    parties: [],
    recordsAddress: null,
    registeredAddress: null,
    tasks: [],
    userInfo: null
  }),

  getters: {
    /** The list of tasks from the API. */
    getTasks (state: RootStateIF): ApiTaskIF[] {
      return state.tasks
    },

    /**
     * The current JS Date object, which was refreshed when the dashload loaded.
     * NB: internally this is stored as UTC
     * NB: use date mixins to display this
     */
    getCurrentJsDate (state: RootStateIF): Date {
      return state.currentJsDate
    },

    /**
     * The current date (YYYY-MM-DD), which was refreshed when the dashload loaded,
     * in Pacific timezone.
     */
    getCurrentDate (state: RootStateIF): IsoDatePacific {
      return state.currentDate
    },

    /** The current year. */
    getCurrentYear (state: RootStateIF): number {
      return (state.currentDate ? +state.currentDate.substring(0, 4) : 0)
    },

    /** The business email. */
    getBusinessEmail (state: RootStateIF): string {
      return state.businessEmail
    },

    /** The business phone number and optional extension. */
    getFullPhoneNumber (state: RootStateIF): string {
      const phone = state.businessPhone
      const ext = state.businessPhoneExtension

      if (phone) {
        return (phone + `${ext ? (' x' + ext) : ''}`)
      }
      return null
    },

    /**
     * The roles from the Keycloak token (JWT).
     * @deprecated Use `authenticationStore.getKeycloakRoles` instead.
     */
    getKeycloakRoles (state: RootStateIF): Array<string> {
      return state.keycloakRoles
    },

    /**
     * Is True if Staff role is set.
     * @deprecated Use `authenticationStore.isRoleStaff` instead.
     */
    isRoleStaff (state: RootStateIF): boolean {
      return state.keycloakRoles.includes('staff')
    },

    /** Is True if app permissions includes Edit role. */
    isRoleEdit (state: RootStateIF): boolean {
      return state.authRoles.includes('edit')
    },

    /** Is True if app permission includes View role. */
    isRoleView (state: RootStateIF): boolean {
      return state.authRoles.includes('view')
    },

    /** Is True if business is pending dissolution. */
    isPendingDissolution (): boolean {
      return false // FUTURE: implement this
    },

    /** The "entity status" for a bootstrap filing only. */
    getEntityStatus (state: RootStateIF): EntityStatus {
      return state.entityStatus
    },

    isDraftAmalgamation (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.DRAFT_AMALGAMATION)
    },

    isDraftContinuationIn (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.DRAFT_CONTINUATION_IN)
    },

    isDraftIncorpApp (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.DRAFT_INCORP_APP)
    },

    isDraftRegistration (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.DRAFT_REGISTRATION)
    },

    isFiledAmalgamation (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.FILED_AMALGAMATION)
    },

    isFiledContinuationIn (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.FILED_CONTINUATION_IN)
    },

    isFiledIncorpApp (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.FILED_INCORP_APP)
    },

    isFiledRegistration (state: RootStateIF): boolean {
      return (state.entityStatus === EntityStatus.FILED_REGISTRATION)
    },

    /** Is True if this is a bootstrap task (ie, Draft or Pending). */
    isBootstrapTask (): boolean {
      return (
        this.isDraftAmalgamation || this.isDraftIncorpApp || this.isDraftRegistration || this.isDraftContinuationIn
      )
    },

    /** Is True if this is a bootstrap filing (ie, Completed or Paid). */
    isBootstrapFiling (): boolean {
      return (
        this.isFiledAmalgamation || this.isFiledIncorpApp || this.isFiledRegistration || this.isFiledContinuationIn
      )
    },

    /** The Name Request (may be null). */
    getNameRequest (state: RootStateIF): any {
      return (state.nameRequest)
    },

    /** Whether to show the Fetching Data spinner. */
    showFetchingDataSpinner (state: RootStateIF): boolean {
      return state.fetchingDataSpinner
    },

    /** Whether to show the Starting Amalgamation spinner. */
    showStartingAmalgamationSpinner (state: RootStateIF): boolean {
      return state.startingAmalgamationSpinner
    },

    /**
     * This is used to show Legal Obligations only for a new business
     * that has no tasks and hasn't filed anything yet (except their application).
     */
    isBusinessWithNoMaintenanceFilings (state: RootStateIF): boolean {
      const filingHistoryListStore = useFilingHistoryListStore()
      return (
        // no todo items
        (state.tasks.length === 0) &&
        // only the Amalgamation/IA/Registration/Continuation In filing history item
        (filingHistoryListStore.getFilings.length === 1) && (
          EnumUtilities.isTypeAmalgamationApplication(filingHistoryListStore.getFilings[0]) ||
          EnumUtilities.isTypeIncorporationApplication(filingHistoryListStore.getFilings[0]) ||
          EnumUtilities.isTypeRegistration(filingHistoryListStore.getFilings[0]) ||
          EnumUtilities.isTypeContinuationIn(filingHistoryListStore.getFilings[0])
        )
      )
    },

    /** The entity registered office address. */
    getRegisteredOfficeAddress (state: RootStateIF): OfficeAddressIF {
      return state.registeredAddress
    },

    /** The parties list from the API. */
    getParties (state: RootStateIF): Array<PartyIF> {
      return state.parties
    },

    /** The entity business address. */
    getBusinessAddress (state: RootStateIF): OfficeAddressIF {
      return state.businessAddress
    },

    /** The entity resource text for confirmation modal. */
    getDissolutionConfirmationResource (state: RootStateIF): DissolutionConfirmationResourceIF {
      return state.configObject?.dissolutionConfirmation
    },
    /** The entity TodoList resources. */
    getTodoListResource (state: RootStateIF): TodoListResourceIF {
      return state.configObject?.todoList
    },

    /** The corp type code from Auth db (may be null). */
    getCorpTypeCd (state: RootStateIF): CorpTypeCd {
      return state.corpTypeCd
    },

    /** The user info from Auth db (may be null). */
    getUserInfo (state: RootStateIF): any {
      return state.userInfo
    },

    //
    // State Filing getters
    //

    /** The filing that changed the business state, if there is one. */
    getStateFiling (state: RootStateIF): StateFilingIF {
      return state.stateFiling
    },

    /** The historical reason text to display in the info header. */
    getReasonText (): string {
      const enDash = '–' // ALT + 0150
      const businessStore = useBusinessStore()

      if (!businessStore.isHistorical) return null // safety check

      // check if historical reason is amalgamation
      const amalgamatedInto = businessStore.getAmalgamatedInto
      if (amalgamatedInto) return reasonTextAmalgamation()

      // get state filing (may be null)
      const stateFiling = this.getStateFiling as StateFilingIF
      const filingType = stateFiling?.header?.name
      if (!filingType) return null // safety check

      // check if historical reason is dissolution
      if (filingType === FilingTypes.DISSOLUTION) return reasonTextDissolution()

      // check if historical reason is continuation out
      if (filingType === FilingTypes.CONTINUATION_OUT) return reasonTextContinuationOut()

      // fallback reason text
      return reasonTextOther()

      //
      // helper functions
      //

      /** The reason text for a business made historical by an amalgamation. */
      function reasonTextAmalgamation (): string {
        const name = 'Amalgamation'
        const amalgamationDate = DateUtilities.apiToDate(amalgamatedInto.amalgamationDate)
        if (!amalgamationDate) throw new Error('Invalid amalgamation date')
        const date = DateUtilities.dateToPacificDate(amalgamationDate, true)
        const identifier = amalgamatedInto.identifier || 'Unknown Company'
        return `${name} ${enDash} ${date} ${enDash} ${identifier}`
      }

      /** The reason text for a business made historical by a dissolution. */
      function reasonTextDissolution (): string {
        const name = EnumUtilities.dissolutionTypeToName(
          businessStore.isEntityFirm,
          (stateFiling.dissolution?.dissolutionType as FilingSubTypes)
        )
        const dissolutionDate = DateUtilities.yyyyMmDdToDate(stateFiling.dissolution?.dissolutionDate)
        if (!dissolutionDate) throw new Error('Invalid dissolution date')
        const date = DateUtilities.dateToPacificDate(dissolutionDate, true)
        return `${name} ${enDash} ${date}`
      }

      /** The reason text for a business made historical by a continuation out. */
      function reasonTextContinuationOut (): string {
        const name = 'Continued Out'
        const effectiveDate = DateUtilities.apiToDate(stateFiling.header?.effectiveDate)
        if (!effectiveDate) throw new Error('Invalid effective date')
        const dateTime = DateUtilities.dateToPacificDateTime(effectiveDate)
        return `${name} ${enDash} ${dateTime}`
      }

      /** The reason text for a business made historical by some other state filing. */
      function reasonTextOther (): string {
        const name = EnumUtilities.filingTypeToName(filingType)
        const effectiveDate = DateUtilities.apiToDate(stateFiling.header?.effectiveDate)
        if (!effectiveDate) throw new Error('Invalid effective date')
        const dateTime = DateUtilities.dateToPacificDateTime(effectiveDate)
        return `${name} ${enDash} ${dateTime}`
      }
    },

    /** The limited restoration active-until date, if it exists, otherwise null. */
    getLimitedRestorationActiveUntil (): string {
      const stateFiling = this.getStateFiling as StateFilingIF // may be null

      const date = DateUtilities.yyyyMmDdToDate(stateFiling?.restoration?.expiry)
      return DateUtilities.dateToPacificDate(date, true)
    },

    /**
     * True if the business is in limited restoration, ie, the state filing is a
     * Limited Restoration filing or Limited Restoration Extension filing.
     */
    isInLimitedRestoration (): boolean {
      const stateFiling = this.getStateFiling as StateFilingIF // may be null

      return (
        !!stateFiling && (
          EnumUtilities.isTypeRestorationLimited(stateFiling) ||
        EnumUtilities.isTypeRestorationLimitedExtension(stateFiling)
        )
      )
    }
  },

  actions: {
    setFetchingDataSpinner (val: boolean) {
      this.fetchingDataSpinner = val
    },

    setStartingAmalgamationSpinner (val: boolean) {
      this.startingAmalgamationSpinner = val
    },

    setStateFiling (stateFilingResponse: any) {
      this.stateFiling = stateFilingResponse
    },

    /** Set the roles from the Keycloak token (JWT). */
    setKeycloakRoles (keycloakRoles: Array<string>) {
      this.keycloakRoles = keycloakRoles
    },

    setUserKeycloakGuid (userKeycloakGuid: string) {
      this.userKeycloakGuid = userKeycloakGuid
    },

    setUserInfo (val: any) {
      this.userInfo = val
    },

    /** Set the app permissions. */
    setAuthRoles (authRoles: Array<string>) {
      this.authRoles = authRoles
    },

    setCurrentJsDate (currentJsDate: Date) {
      this.currentJsDate = currentJsDate
    },

    setCurrentDate (currentDate: string) {
      this.currentDate = currentDate
    },

    setNextARDate (nextARDate: string) {
      this.nextARDate = nextARDate
    },

    setNameRequest (nameRequest: any) {
      this.nameRequest = nameRequest
    },

    setARFilingYear (year: number) {
      this.ARFilingYear = year
    },

    setArMaxDate (date: string) {
      this.arMaxDate = date
    },

    setArMinDate (date: string) {
      this.arMinDate = date
    },

    setEntityStatus (entityStatus: EntityStatus) {
      this.entityStatus = entityStatus
    },

    setBusinessEmail (businessEmail: string) {
      this.businessEmail = businessEmail
    },

    setBusinessPhone (businessPhone: string) {
      this.businessPhone = businessPhone
    },

    setBusinessPhoneExtension (businessPhoneExtension: string) {
      this.businessPhoneExtension = businessPhoneExtension
    },

    setTasks (tasks: Array<ApiTaskIF>) {
      this.tasks = tasks
    },

    setRegisteredAddress (registeredAddress: OfficeAddressIF) {
      this.registeredAddress = registeredAddress
    },

    setRecordsAddress (recordsAddress: OfficeAddressIF) {
      this.recordsAddress = recordsAddress
    },

    setBusinessAddress (businessAddress: OfficeAddressIF) {
      this.businessAddress = businessAddress
    },

    setParties (parties: Array<PartyIF>) {
      this.parties = parties
    },

    setConfigObject (configObject: any) {
      this.configObject = configObject
    },

    setFilingData (filingData: Array<FilingDataIF>) {
      this.filingData = filingData
    },

    setCorpTypeCd (val: CorpTypeCd) {
      this.corpTypeCd = val
    },

    /**
     * Fetches the state filing from the Legal API and, if successful, triggers action.
     * @param context the Vuex context (passed in automatically)
     */
    loadStateFiling (): Promise<void> {
      const businessStore = useBusinessStore()
      // need to return a promise because action is called via dispatch
      return new Promise((resolve, reject) => {
        const stateFilingUrl = businessStore.getStateFilingUrl

        // if there is no state filing url, return null
        if (!stateFilingUrl) {
          resolve(null)
          return
        }

        LegalServices.fetchFiling(stateFilingUrl)
          .then(filing => {
            // set data to store
            this.setStateFiling(filing)
            // return the filing object
            resolve(filing)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
})
