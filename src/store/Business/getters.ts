import { CorpTypeCd, EntityState } from '@/enums'
import { BusinessStateIF, BusinessWarningIF } from '@/interfaces'

export default {
  /** The business number (aka Tax ID). */
  getBusinessNumber (state: BusinessStateIF): string {
    return state.businessNumber
  },

  /** The business warnings list. */
  getBusinessWarnings (state: BusinessStateIF): Array<BusinessWarningIF> {
    return state.businessWarnings
  },

  /** The entity founding date. */
  getEntityFoundingDate (state: BusinessStateIF): Date {
    return state.entityFoundingDate
  },

  /** The entity name. */
  getEntityName (state: BusinessStateIF): string {
    return state.entityName
  },

  /** The entity state. */
  getEntityState (state: BusinessStateIF): EntityState {
    return state.entityState
  },

  /** The entity type. */
  getEntityType (state: BusinessStateIF): CorpTypeCd {
    return state.entityType
  },

  /** The business identifier (aka Incorporation Number). */
  getIdentifier (state: BusinessStateIF): string {
    return state.identifier
  },

  /** The last address change date. */
  getLastAddressChangeDate (state: BusinessStateIF): string {
    return state.lastAddressChangeDate
  },

  /** The last annual report change date. */
  getLastAnnualReportDate (state: BusinessStateIF): string {
    return state.lastAnnualReportDate
  },

  /** The last director change date. */
  getLastDirectorChangeDate (state: BusinessStateIF): string {
    return state.lastDirectorChangeDate
  },

  /** Is true of the business has a court order filing */
  hasCourtOrders (state: BusinessStateIF): boolean {
    return state.hasCourtOrders
  },

  /** Is True if a firm has at least one "compliance" warning. */
  hasComplianceWarning (_state: BusinessStateIF, getters): boolean {
    return (
      getters.isFirm &&
      getters.getBusinessWarnings.some(item => item.warningType?.includes('COMPLIANCE'))
    )
  },

  /** Is True if a firm has at least one "missing required business info" warning. */
  hasMissingInfoWarning (_state: BusinessStateIF, getters): boolean {
    return (
      getters.isFirm &&
      getters.getBusinessWarnings.some(item => item.warningType === 'MISSING_REQUIRED_BUSINESS_INFO')
    )
  },

  /** Is True if business is active. */
  isActive (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityState === EntityState.ACTIVE)
  },

  /** Is True if the business is frozen. */
  isAdminFreeze (state: BusinessStateIF): boolean {
    return state.adminFreeze
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state: BusinessStateIF): boolean {
    return (state.entityType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state: BusinessStateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_COMPANY)
  },

  /** Is True if entity is a BEN/BC/CCC/ULC. */
  isBenBcCccUlc (_state: BusinessStateIF, getters): boolean {
    return (
      getters.isBComp ||
      getters.isBcCompany ||
      getters.isCcc ||
      getters.isUlc
    )
  },

  /** Is True if entity is a BC Community Contribution Company. */
  isCcc (state: BusinessStateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_CCC)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state: BusinessStateIF): boolean {
    return (state.entityType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state: BusinessStateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a Sole Proprietorship or General Partnership. */
  isFirm (_state: BusinessStateIF, getters): boolean {
    return (getters.isSoleProp || getters.isPartnership)
  },

  /** Is True if business is in good standing. */
  isGoodStanding (state: BusinessStateIF): boolean {
    return state.goodStanding
  },

  /** Is True if business is historical (ie, dissolved). */
  isHistorical (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityState === EntityState.HISTORICAL)
  },

  /** Is True if business is in liquidation. */
  isLiquidation (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityState === EntityState.LIQUIDATION)
  },

  /** Is True if entity is a General Partnership. */
  isPartnership (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityType === CorpTypeCd.PARTNERSHIP)
  },

  /** Is True if entity is a Sole Proprietorship. */
  isSoleProp (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityType === CorpTypeCd.SOLE_PROP)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (_state: BusinessStateIF, getters): boolean {
    return (getters.getEntityType === CorpTypeCd.BC_ULC_COMPANY)
  }
}
