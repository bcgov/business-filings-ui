import { CorpTypeCd, EntityState } from '@/enums'
import { BusinessIF, BusinessWarningIF } from '@/interfaces'
import { DateUtilities } from '@/services/'

export default {
  /** The business number (aka Tax ID). */
  getBusinessNumber (state: BusinessIF): string {
    return state.taxId
  },

  /** The business warnings list. */
  getBusinessWarnings (state: BusinessIF): Array<BusinessWarningIF> {
    return state.warnings
  },

  /** The business state. */
  getBusinessState (state: BusinessIF): EntityState {
    return state.state
  },

  /** The founding date. */
  getFoundingDate (state: BusinessIF): Date {
    return DateUtilities.apiToDate(state.foundingDate)
  },

  /** The business identifier (aka Incorporation Number). */
  getIdentifier (state: BusinessIF): string {
    return state.identifier
  },

  /** The last address change date. */
  getLastAddressChangeDate (state: BusinessIF): string {
    return state.lastAddressChangeDate
  },

  /** The last annual report change date. */
  getLastAnnualReportDate (state: BusinessIF): string {
    return state.lastAnnualReportDate
  },

  /** The last director change date. */
  getLastDirectorChangeDate (state: BusinessIF): string {
    return state.lastDirectorChangeDate
  },

  /** The legal name. */
  getLegalName (state: BusinessIF): string {
    return state.legalName
  },

  /** The legal type. */
  getLegalType (state: BusinessIF): CorpTypeCd {
    return state.legalType
  },

  /** The state filing URL (may be null). */
  getStateFilingUrl (state: BusinessIF): string {
    return state.stateFiling
  },

  /** Is true of the business has a court order filing */
  hasCourtOrders (state: BusinessIF): boolean {
    return state.hasCourtOrders
  },

  /** Is True if a firm has at least one "compliance" warning. */
  hasComplianceWarning (_state: BusinessIF, getters): boolean {
    return (
      getters.isFirm &&
      getters.getBusinessWarnings.some(item => item.warningType?.includes('COMPLIANCE'))
    )
  },

  /** Is True if a firm has at least one "missing required business info" warning. */
  hasMissingInfoWarning (_state: BusinessIF, getters): boolean {
    return (
      getters.isFirm &&
      getters.getBusinessWarnings.some(item => item.warningType === 'MISSING_REQUIRED_BUSINESS_INFO')
    )
  },

  /** Is True if business is active. */
  isActive (_state: BusinessIF, getters): boolean {
    return (getters.getBusinessState === EntityState.ACTIVE)
  },

  /** Is True if the business is frozen. */
  isAdminFreeze (state: BusinessIF): boolean {
    return state.adminFreeze
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state: BusinessIF): boolean {
    return (state.legalType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state: BusinessIF): boolean {
    return (state.legalType === CorpTypeCd.BC_COMPANY)
  },

  /** Is True if entity is a BEN/BC/CCC/ULC. */
  isBenBcCccUlc (_state: BusinessIF, getters): boolean {
    return (
      getters.isBComp ||
      getters.isBcCompany ||
      getters.isCcc ||
      getters.isUlc
    )
  },

  /** Is True if entity is a BC Community Contribution Company. */
  isCcc (state: BusinessIF): boolean {
    return (state.legalType === CorpTypeCd.BC_CCC)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state: BusinessIF): boolean {
    return (state.legalType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state: BusinessIF): boolean {
    return (state.legalType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a Sole Proprietorship or General Partnership. */
  isFirm (_state: BusinessIF, getters): boolean {
    return (getters.isSoleProp || getters.isPartnership)
  },

  /** Is True if business is in good standing. */
  isGoodStanding (state: BusinessIF): boolean {
    return state.goodStanding
  },

  /** Is True if business is historical (ie, dissolved). */
  isHistorical (_state: BusinessIF, getters): boolean {
    return (getters.getBusinessState === EntityState.HISTORICAL)
  },

  /** Is True if business is in liquidation. */
  isLiquidation (_state: BusinessIF, getters): boolean {
    return (getters.getBusinessState === EntityState.LIQUIDATION)
  },

  /** Is True if entity is a General Partnership. */
  isPartnership (_state: BusinessIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.PARTNERSHIP)
  },

  /** Is True if entity is a Sole Proprietorship. */
  isSoleProp (_state: BusinessIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.SOLE_PROP)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (_state: BusinessIF, getters): boolean {
    return (getters.getLegalType === CorpTypeCd.BC_ULC_COMPANY)
  }
}
