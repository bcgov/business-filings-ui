import { CorpTypeCd, DissolutionTypes, EntityStatus, FilingStatus, FilingTypes } from '@/enums'
import { ApiFilingIF, ApiTaskIF, DissolutionConfirmationResourceIF, OfficeAddressIF, PartyIF,
  StateIF, TodoListResourceIF, IsoDatePacific } from '@/interfaces'
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
  hasBlockerExceptStaffApproval (state: StateIF, _getters, _rootState, rootGetters): boolean {
    return (
      state.hasBlockerTask ||
      state.hasBlockerFiling ||
      state.isCoaPending ||
      rootGetters.isAdminFreeze
    )
  },

  /** Is True if there is a blocker including firm compliance. */
  hasBlocker (_state: StateIF, _getters, _rootState, rootGetters): boolean {
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

  /**
   * A formatted concatenation of the name and the effective date of the filing.
   * Only used when entity is historical.
   */
  getReasonText (_state: StateIF, _getters, rootState, rootGetters): string {
    const stateFiling = rootState.stateFiling // may be null

    const filingType = stateFiling?.header?.name
    if (!filingType) return null // safety check

    // create reason text to display in the info header
    let name: string
    let date: string

    if (filingType === FilingTypes.DISSOLUTION) {
      name = EnumUtilities.dissolutionTypeToName(rootGetters.isFirm,
        (stateFiling?.dissolution?.dissolutionType as DissolutionTypes) ||
        DissolutionTypes.UNKNOWN)
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
   * Is True if business is in Limited Restoration state, ie
   * the last filing to change state was a Restoration filing.
   */
  isEntityInLimitedRestoration (_state: StateIF, _getters, rootState): boolean {
    const stateFiling = rootState.stateFiling // may be null

    return (stateFiling?.hasOwnProperty(FilingTypes.RESTORATION))
  },

  /**
   * Is True if business is in Authorized to Continue Out state, ie
   * the last filing to change state was a Consent to Continue Out filing.
   */
  isAuthorizedToContinueOut (_state: StateIF, _getters, rootState): boolean {
    const stateFiling = rootState.stateFiling // may be null

    return (stateFiling?.hasOwnProperty(FilingTypes.CONSENT_CONTINUATION_OUT))
  },

  /** The corp type code from Auth db (may be null). */
  getCorpTypeCd (state: StateIF): CorpTypeCd {
    return state.corpTypeCd
  },

  /** The Business ID string. */
  getBusinessId (_state: StateIF): string {
    return sessionStorage.getItem('BUSINESS_ID')
  },

  /** The Temporary Registration Number string. */
  getTempRegNumber (_state: StateIF): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }
}
