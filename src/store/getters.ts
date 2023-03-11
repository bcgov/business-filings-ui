import { CorpTypeCd, EntityStatus, FilingStatus, FilingSubTypes, FilingTypes } from '@/enums'
import { ApiFilingIF, ApiTaskIF, DissolutionConfirmationResourceIF, OfficeAddressIF, PartyIF,
  StateIF, TodoListResourceIF, IsoDatePacific, StateFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'

export default {
  /** The list of filings from the API. */
  getFilings (state: StateIF): ApiFilingIF[] {
    return state.filings
  },

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

  /** Is True if there are any blockers, eg, pending tasks or filings. */
  hasBlockerExceptStaffApproval (state: StateIF, _getters: any, _rootState: any, rootGetters: any): boolean {
    return (
      state.hasBlockerTask ||
      state.hasBlockerFiling ||
      state.isCoaPending ||
      rootGetters.isAdminFreeze
    )
  },

  /** Is True if there is a blocker including firm compliance. */
  hasBlocker (_state: StateIF, _getters: any, _rootState: any, rootGetters: any): boolean {
    // check for compliance warning
    if (rootGetters.hasComplianceWarning) return true

    // check for missing info warning
    if (rootGetters.hasMissingInfoWarning) return true

    return rootGetters.hasBlockerExceptStaffApproval
  },

  /** Is True if a COA filing is pending. */
  isCoaPending (state: StateIF): boolean {
    return state.isCoaPending
  },

  /** The COA effective date (valid if a COA is pending). */
  getCoaEffectiveDate (state: StateIF): Date {
    return state.coaEffectiveDate
  },

  /** Is True if Staff role is set.
   * DEPRECATED - use authentication/isKeyCloakRoleStaff() instead
   * */
  isRoleStaff (state: StateIF): boolean {
    return state.keycloakRoles.includes('staff')
  },

  /** Is True if Edit role is set. */
  isRoleEdit (state: StateIF): boolean {
    return state.authRoles.includes('edit')
  },

  /** Is True if View role is set. */
  isRoleView (state: StateIF): boolean {
    return state.authRoles.includes('view')
  },

  /** Is True if business is pending dissolution. */
  isPendingDissolution (_state: StateIF): boolean {
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

  /**
   * This is used to show Legal Obligations only for a new business
   * that has no tasks and hasn't filed anything yet (except their IA).
   **/
  isBusinessWithNoMaintenanceFilings (state: StateIF): boolean {
    return (
      // no todo items
      state.tasks.length === 0 &&
      // only the IA filing history item
      state.filings.length === 1 &&
      [FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION].includes(state.filings[0].name)
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

  /** The entity busness address. */
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

  /** The filing that changed the business state, if there is one. */
  getStateFiling (state: StateIF): StateFilingIF {
    return state.stateFiling
  },

  /**
   * A formatted concatenation of the name and the effective date of the filing.
   * Only used when entity is historical.
   */
  getReasonText (_state: StateIF, _getters: any, rootState: any, rootGetters: any): string {
    const stateFiling = rootState.stateFiling // may be null

    const filingType = stateFiling?.header?.name
    if (!filingType) return null // safety check

    // create reason text to display in the info header
    let name: string
    let date: string

    if (filingType === FilingTypes.DISSOLUTION) {
      name = EnumUtilities.dissolutionTypeToName(
        rootGetters.isFirm,
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

  /**
   * True if the business is in limited restoration, ie, the state filing is a
   * Limited Restoration filing or Limited Restoration Extension filing.
   */
  isInLimitedRestoration (_state: StateIF, _getters: any, rootState: any): boolean {
    const stateFiling = rootState.stateFiling // may be null

    return (
      !!stateFiling && (
        EnumUtilities.isTypeRestorationLimited(stateFiling) ||
        EnumUtilities.isTypeRestorationExtension(stateFiling)
      )
    )
  },

  /**
   * True if the business is authorized to continue out, ie, the state filing is a
   * Consent to Continuation Out filing.
   */
  isAuthorizedToContinueOut (_state: StateIF, _getters: any, rootState: any): boolean {
    const stateFiling = rootState.stateFiling // may be null

    return (stateFiling?.hasOwnProperty(FilingTypes.CONSENT_CONTINUATION_OUT) || false)
  },

  /** The corp type code from Auth db (may be null). */
  getCorpTypeCd (state: StateIF): CorpTypeCd {
    return state.corpTypeCd
  }
}
