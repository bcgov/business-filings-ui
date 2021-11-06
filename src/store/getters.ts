import { CorpTypeCd, EntityStatus, FilingStatus, FilingTypes } from '@/enums'
import { ApiFilingIF, StateIF, ApiTaskIF, OfficeAddressIF } from '@/interfaces'

export default {
  /** The list of filings from the API. */
  getFilings (state: StateIF): ApiFilingIF[] {
    return state.filings
  },

  /** The list of tasks from the API. */
  getTasks (state: StateIF): ApiTaskIF[] {
    return state.tasks
  },

  /** The current date (YYYY-MM-DD). */
  getCurrentDate (state: StateIF): string {
    return state.currentDate
  },

  /** The current year. */
  getCurrentYear (state: StateIF): number {
    return (state.currentDate ? +state.currentDate.substring(0, 4) : 0)
  },

  /** Is True if there are any pending tasks or filings. */
  hasBlocker (state: StateIF): boolean {
    return (state.hasBlockerTask || state.hasBlockerFiling || state.isCoaPending)
  },

  /** Is True if a COA filing is pending. */
  isCoaPending (state: StateIF): boolean {
    return state.isCoaPending
  },

  /** The COA effective date (valid if a COA is pending). */
  getCoaEffectiveDate (state: StateIF): Date {
    return state.coaEffectiveDate
  },

  /** The entity identifier. */
  getEntityBusinessNo (state: StateIF): string {
    return state.entityBusinessNo
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

  /** Is True if business is in good standing. */
  isInGoodStanding (state: StateIF): boolean {
    return (state.entityStatus === EntityStatus.GOOD_STANDING)
  },

  /** Is True if business is pending dissolution. */
  isPendingDissolution (state: StateIF): boolean {
    return (state.entityStatus === EntityStatus.PENDING_DISSOLUTION)
  },

  /** Is True if business is not in compliance. */
  isNotInCompliance (state: StateIF): boolean {
    return (state.entityStatus === EntityStatus.NOT_IN_COMPLIANCE)
  },

  /** Is True if business is historical (dissolved). */
  isHistorical (state: StateIF): boolean {
    return false // *** TODO: get from business object
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
      state.filings[0].name === FilingTypes.INCORPORATION_APPLICATION
    )
  },

  /** The Entity Incorporation Number (aka business identifier). */
  getEntityIncNo (state: StateIF): string {
    return state.entityIncNo
  },

  /** The Entity Type. */
  getEntityType (state: StateIF): CorpTypeCd {
    return state.entityType
  },

  /** The Entity Status. */
  getEntityStatus (state: StateIF): EntityStatus {
    return state.entityStatus
  },

  /** The entity registered office address. */
  getRegisteredOfficeAddress (state: StateIF): OfficeAddressIF {
    return state.registeredAddress
  }
}
