import { defineStore } from 'pinia'
import { CorpTypeCd, EntityStatus, FilingStatus, FilingSubTypes, FilingTypes } from '@/enums'
import { ApiTaskIF, DissolutionConfirmationResourceIF, FilingDataIF, OfficeAddressIF, PartyIF, StateIF,
  TodoListResourceIF, IsoDatePacific, StateFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities, LegalServices } from '@/services'
import { useBusinessStore } from './businessStore'
import { useFilingHistoryListStore } from './filingHistoryListStore'

export const useRootStore = defineStore('root', {
  state: (): StateIF => ({
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
    currentFilingStatus: null,
    fetchingDataSpinner: false,
    filingData: [],
    nameRequest: null,
    parties: [],
    recordsAddress: null,
    registeredAddress: null,
    tasks: []
  }),

  getters: {
    /** The list of tasks from the API. */
    getTasks (state: StateIF): ApiTaskIF[] {
      return state.tasks
    },

    /**
     * The current JS Date object, which was refreshed when the dashload loaded.
     * NB: internally this is stored as UTC
     * NB: use date mixins to display this
     */
    getCurrentJsDate (state: StateIF): Date {
      return state.currentJsDate
    },

    /**
     * The current date (YYYY-MM-DD), which was refreshed when the dashload loaded,
     * in Pacific timezone.
     */
    getCurrentDate (state: StateIF): IsoDatePacific {
      return state.currentDate
    },

    /** The current year. */
    getCurrentYear (state: StateIF): number {
      return (state.currentDate ? +state.currentDate.substring(0, 4) : 0)
    },

    /** The business email. */
    getBusinessEmail (state: StateIF): string {
      return state.businessEmail
    },

    /** The business phone number and optional extension. */
    getFullPhoneNumber (state: StateIF): string {
      const phone = state.businessPhone
      const ext = state.businessPhoneExtension

      if (phone) {
        return (phone + `${ext ? (' x' + ext) : ''}`)
      }
      return null
    },

    /** The roles from the Keycloak token (JWT). */
    getKeycloakRoles (state: StateIF): Array<string> {
      return state.keycloakRoles
    },

    /** Is True if Staff role is set.
     * DEPRECATED - use authentication/isKeycloakRoleStaff() instead
     */
    isRoleStaff (state: StateIF): boolean {
      return state.keycloakRoles.includes('staff')
    },

    /** Is True if app permissions includes Edit role. */
    isRoleEdit (state: StateIF): boolean {
      return state.authRoles.includes('edit')
    },

    /** Is True if app permission includes View role. */
    isRoleView (state: StateIF): boolean {
      return state.authRoles.includes('view')
    },

    /** Is True if business is pending dissolution. */
    isPendingDissolution (): boolean {
      return false // FUTURE: implement this
    },

    /** Is True if this is a Draft Application. */
    isAppTask (state: StateIF): boolean {
      return (state.entityStatus === EntityStatus.DRAFT_APP)
    },

    /** Is True if this is a Paid or Completed Application. */
    isAppFiling (state: StateIF): boolean {
      return (state.entityStatus === EntityStatus.FILED_APP)
    },

    /** The Name Request (may be null). */
    getNameRequest (state: StateIF): any {
      return (state.nameRequest)
    },

    isCurrentFilingEditable (state: StateIF): boolean {
      return (state.currentFilingStatus === FilingStatus.NEW || state.currentFilingStatus === FilingStatus.DRAFT)
    },

    getReportState (state: StateIF): string {
      switch (state.currentFilingStatus) {
        case FilingStatus.NEW: return ''
        case FilingStatus.DRAFT: return 'Draft'
      }
      return state.currentFilingStatus
    },

    /** Whether to show the Fetching Data spinner. */
    showFetchingDataSpinner (state: StateIF): boolean {
      return state.fetchingDataSpinner
    },

    /**
     * This is used to show Legal Obligations only for a new business
     * that has no tasks and hasn't filed anything yet (except their IA).
     **/
    isBusinessWithNoMaintenanceFilings (state: StateIF): boolean {
      const filingHistoryListStore = useFilingHistoryListStore()
      return (
        // no todo items
        (state.tasks.length === 0) &&
        // only the IA or Registraion filing history item
        (filingHistoryListStore.getFilings.length === 1) && (
          EnumUtilities.isTypeIncorporationApplication(filingHistoryListStore.getFilings[0]) ||
          EnumUtilities.isTypeRegistration(filingHistoryListStore.getFilings[0])
        )
      )
    },

    /** The entity registered office address. */
    getRegisteredOfficeAddress (state: StateIF): OfficeAddressIF {
      return state.registeredAddress
    },

    /** The parties list from the API. */
    getParties (state: StateIF): Array<PartyIF> {
      return state.parties
    },

    /** The entity business address. */
    getBusinessAddress (state: StateIF): OfficeAddressIF {
      return state.businessAddress
    },

    /** The entity resource text for confirmation modal. */
    getDissolutionConfirmationResource (state: StateIF): DissolutionConfirmationResourceIF {
      return state.configObject?.dissolutionConfirmation
    },
    /** The entity TodoList resources. */
    getTodoListResource (state: StateIF): TodoListResourceIF {
      return state.configObject?.todoList
    },

    /** The corp type code from Auth db (may be null). */
    getCorpTypeCd (state: StateIF): CorpTypeCd {
      return state.corpTypeCd
    },

    //
    // State Filing getters
    //

    /** The filing that changed the business state, if there is one. */
    getStateFiling (state: StateIF): StateFilingIF {
      return state.stateFiling
    },

    /**
     * A formatted concatenation of the name and the effective date of the filing.
     * Only used when entity is historical.
     */
    getReasonText (): string {
      const businessStore = useBusinessStore()
      const stateFiling = this.getStateFiling as StateFilingIF // may be null

      const filingType = stateFiling?.header?.name
      if (!filingType) return null // safety check

      // create reason text to display in the info header
      let name: string
      let date: string

      if (filingType === FilingTypes.DISSOLUTION) {
        name = EnumUtilities.dissolutionTypeToName(
          businessStore.isFirm,
          (stateFiling?.dissolution?.dissolutionType as FilingSubTypes)
        )
        const dissolutionDate = DateUtilities.yyyyMmDdToDate(stateFiling.dissolution?.dissolutionDate)
        if (!dissolutionDate) throw new Error('Invalid dissolution date')
        date = DateUtilities.dateToPacificDate(dissolutionDate, true)
      } else {
        name = EnumUtilities.filingTypeToName(filingType)
        const effectiveDate = DateUtilities.apiToDate(stateFiling.header.effectiveDate)
        if (!effectiveDate) throw new Error('Invalid effective date')
        date = DateUtilities.dateToPacificDateTime(effectiveDate)
      }

      const enDash = '–' // ALT + 0150
      return `${name} ${enDash} ${date}`
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

    setCurrentFilingStatus (currentFilingStatus: FilingStatus) {
      this.currentFilingStatus = currentFilingStatus
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
