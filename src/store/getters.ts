import { CorpTypeCd, EntityState, EntityStatus, FilingStatus, FilingTypes } from '@/enums'
import {
  ApiFilingIF, ApiTaskIF, DissolutionConfirmationResourceIF, OfficeAddressIF, PartyIF,
  StateIF, TodoListResourceIF, IsoDatePacific, BusinessWarningIF
} from '@/interfaces'

export default {
  /** The user's Keycloak GUID. */
  getUserKeycloakGuid (state: StateIF): string {
    return state.userKeycloakGuid
  },

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
  hasBlockerExceptStaffApproval (state: StateIF): boolean {
    return (state.hasBlockerTask || state.hasBlockerFiling || state.isCoaPending)
  },

  /** Is True if there is a blocker including firm compliance. */
  hasBlocker (_state: StateIF, getters: any): boolean {
    // check for compliance warning
    if (getters.hasComplianceWarning) return true

    // check for missing info warning
    if (getters.hasMissingInfoWarning) return true

    return getters.hasBlockerExceptStaffApproval
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

  /** Is true of the business has a court order filing */
  hasCourtOrders (state: StateIF): boolean {
    return state.hasCourtOrders
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
  isFirm (_state: StateIF, getters: any): boolean {
    return (getters.isSoleProp || getters.isPartnership)
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

  /** Is True if entity is a BC Community Contribution Company. */
  isCcc (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_CCC)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_ULC_COMPANY)
  },

  /** Is True if entity is a BEN/BC/CCC/ULC. */
  isBenBcCccUlc (_state: StateIF, getters: any): boolean {
    return (getters.isBComp || getters.isBcCompany || getters.isCcc || getters.isUlc)
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPendingDissolution (state: StateIF): boolean {
    return false // FUTURE: implement this
  },

  /** Is True if business is in good standing. */
  isGoodStanding (state: StateIF): boolean {
    return state.goodStanding
  },

  /** The business warnings. */
  getBusinessWarnings (state: StateIF): BusinessWarningIF[] {
    return state.businessWarnings
  },

  /** Is True if a firm has at least one "compliance" warning. */
  hasComplianceWarning (state: StateIF, getters: any): boolean {
    return (
      getters.isFirm &&
      state.businessWarnings.some(item => item.warningType?.includes('COMPLIANCE'))
    )
  },

  /** Is True if a firm has at least one "missing required business info" warning. */
  hasMissingInfoWarning (state: StateIF, getters: any): boolean {
    return (
      getters.isFirm &&
      state.businessWarnings.some(item => item.warningType === 'MISSING_REQUIRED_BUSINESS_INFO')
    )
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

  /** Is True if the business is frozen */
  isAdminFreeze (state: StateIF): boolean {
    console.log('isAdminFreeze', state.adminFreeze)
    return state.adminFreeze
  },

  /** Is True if business is in liquidation. */
  isLiquidation (state: StateIF): boolean {
    return (state.entityState === EntityState.LIQUIDATION)
  },

  /** The Name Request number. */
  getNameRequestNumber (state: StateIF): string {
    return (state.nameRequest?.nrNum)
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
  }
}
