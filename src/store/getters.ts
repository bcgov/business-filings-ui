import { CorpTypeCd, EntityState, EntityStatus, FilingStatus, FilingTypes } from '@/enums'
import { ApiFilingIF, ApiTaskIF, DissolutionConfirmationResourceIF, OfficeAddressIF, PartyIF,
  StateIF, TodoListResourceIF, FilingHistoryListResourceIF, IsoDatePacific } from '@/interfaces'

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

  /** Is True if there are any pending tasks or filings. */
  hasBlocker (state: StateIF, getters): boolean {
    let blocker = (state.hasBlockerTask || state.hasBlockerFiling || state.isCoaPending)
    // check for complaints warnings for SP and GP
    if (getters.isFirm && getters.isNotInCompliance && !getters.isRoleStaff) {
      blocker = getters.isNotInCompliance
    }
    return blocker
  },

  /** Is True if a COA filing is pending. */
  isCoaPending (state: StateIF): boolean {
    return state.isCoaPending
  },

  /** The COA effective date (valid if a COA is pending). */
  getCoaEffectiveDate (state: StateIF): Date {
    return state.coaEffectiveDate
  },

  /** The business identifier (aka Incorporation Number). */
  getIdentifier (state: StateIF): string {
    return state.identifier
  },

  /** The business number (aka Tax ID). */
  getBusinessNumber (state: StateIF): string {
    return state.businessNumber
  },

  /** The entity name. */
  getEntityName (state: StateIF): string {
    return state.entityName
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a Sole Proprietorship or General Partnership. */
  isFirm (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.SOLE_PROP || state.entityType === CorpTypeCd.PARTNERSHIP)
  },

  /** Is True if entity is a Sole Proprietorship. */
  isSoleProp (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.SOLE_PROP)
  },

  /** Is True if entity is a General Partnership. */
  isPartnership (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.PARTNERSHIP)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_COMPANY)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_ULC_COMPANY)
  },

  /** Is True if Staff role is set. */
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
  isPendingDissolution (state: StateIF): boolean {
    return false // FUTURE: implement this
  },

  /** Is True if business is in good standing. */
  isGoodStanding (state: StateIF): boolean {
    return state.goodStanding
  },

  /** Is True if business is not in compliance. */
  isNotInCompliance (state: StateIF): boolean {
    return (state.complianceWarnings.length > 0)
  },

  /** Is True if this is a Draft Application. */
  isAppTask (state: StateIF): boolean {
    return (state.entityStatus === EntityStatus.DRAFT_APP)
  },

  /** Is True if this is a Paid or Completed Application. */
  isAppFiling (state: StateIF): boolean {
    return (state.entityStatus === EntityStatus.FILED_APP)
  },

  /** Is True if business is active. */
  isActive (state: StateIF): boolean {
    return (state.entityState === EntityState.ACTIVE)
  },

  /** Is True if business is historical (ie, dissolved). */
  isHistorical (state: StateIF): boolean {
    return (state.entityState === EntityState.HISTORICAL)
  },

  /** Is True if business is in liquidation. */
  isLiquidation (state: StateIF): boolean {
    return (state.entityState === EntityState.LIQUIDATION)
  },

  getNrNumber (state: StateIF): string {
    // workaround for old or new property name
    return (state.nameRequest?.nrNum || state.nameRequest?.nrNumber)
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

  /** The Entity Type. */
  getEntityType (state: StateIF): CorpTypeCd {
    return state.entityType
  },

  /** The Entity Status. */
  getEntityStatus (state: StateIF): EntityStatus {
    return state.entityStatus
  },

  /** The Entity Founding Date. */
  getEntityFoundingDate (state: StateIF): Date {
    return state.entityFoundingDate
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
  /** The entity FilingHistoryList resources. */
  getFilingHistoryListResource (state: StateIF): FilingHistoryListResourceIF {
    return state.configObject?.filingHistoryList
  }

}
