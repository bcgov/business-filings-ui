import { CorpTypeCd, EntityState } from '@/enums'
import { AllowedActionsIF, BusinessStateIF, BusinessWarningIF } from '@/interfaces'
import { DateUtilities } from '@/services/'

export default {
  /** The allowed actions object. */
  getAllowedActions (state: BusinessStateIF): AllowedActionsIF {
    return state.businessInfo.allowedActions
  },

  /** The business number (aka Tax ID). */
  getBusinessNumber (state: BusinessStateIF): string {
    return state.businessInfo.taxId
  },

  /** The business warnings list. */
  getBusinessWarnings (state: BusinessStateIF): Array<BusinessWarningIF> {
    return state.businessInfo.warnings
  },

  /** The business state.businessInfo. */
  getBusinessState (state: BusinessStateIF): EntityState {
    return state.businessInfo.state
  },

  /** The founding date. */
  getFoundingDate (state: BusinessStateIF): Date {
    return DateUtilities.apiToDate(state.businessInfo.foundingDate)
  },

  /** The business identifier (aka Incorporation Number). */
  getIdentifier (state: BusinessStateIF): string {
    return state.businessInfo.identifier
  },

  /** The last address change date. */
  getLastAddressChangeDate (state: BusinessStateIF): string {
    return state.businessInfo.lastAddressChangeDate
  },

  /** The last annual report change date. */
  getLastAnnualReportDate (state: BusinessStateIF): string {
    return state.businessInfo.lastAnnualReportDate
  },

  /** The last director change date. */
  getLastDirectorChangeDate (state: BusinessStateIF): string {
    return state.businessInfo.lastDirectorChangeDate
  },

  /** The legal name. */
  getLegalName (state: BusinessStateIF): string {
    return state.businessInfo.legalName
  },

  /** The legal type. */
  getLegalType (state: BusinessStateIF): CorpTypeCd {
    return state.businessInfo.legalType
  },

  /** The state filing URL (may be null). */
  getStateFilingUrl (state: BusinessStateIF): string {
    return state.businessInfo.stateFiling
  },

  /** Is true of the business has a court order filing */
  hasCourtOrders (state: BusinessStateIF): boolean {
    return state.businessInfo.hasCourtOrders
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
    return (getters.getBusinessState === EntityState.ACTIVE)
  },

  /** Is True if the business is frozen. */
  isAdminFreeze (state: BusinessStateIF): boolean {
    return state.businessInfo.adminFreeze
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state: BusinessStateIF): boolean {
    return (state.businessInfo.legalType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state: BusinessStateIF): boolean {
    return (state.businessInfo.legalType === CorpTypeCd.BC_COMPANY)
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
    return (state.businessInfo.legalType === CorpTypeCd.BC_CCC)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state: BusinessStateIF): boolean {
    return (state.businessInfo.legalType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state: BusinessStateIF): boolean {
    return (state.businessInfo.legalType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a Sole Proprietorship or General Partnership. */
  isFirm (_state: BusinessStateIF, getters): boolean {
    return (getters.isSoleProp || getters.isPartnership)
  },

  /** Is True if business is in good standing. */
  isGoodStanding (state: BusinessStateIF): boolean {
    return state.businessInfo.goodStanding
  },

  /** Is True if business is historical (ie, dissolved). */
  isHistorical (_state: BusinessStateIF, getters): boolean {
    return (getters.getBusinessState === EntityState.HISTORICAL)
  },

  /** Is True if business is in liquidation. */
  isLiquidation (_state: BusinessStateIF, getters): boolean {
    return (getters.getBusinessState === EntityState.LIQUIDATION)
  },

  /** Is True if entity is a General Partnership. */
  isPartnership (_state: BusinessStateIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.PARTNERSHIP)
  },

  /** Is True if entity is a Sole Proprietorship. */
  isSoleProp (_state: BusinessStateIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.SOLE_PROP)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (_state: BusinessStateIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.BC_ULC_COMPANY)
  }
}
