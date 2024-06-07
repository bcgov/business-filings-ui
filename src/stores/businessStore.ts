import { AllowedActionsIF, AmalgamatedIntoIF, ApiBusinessIF, ApiDateTimeUtc, BusinessStateIF, BusinessWarningIF }
  from '@/interfaces'
import { defineStore } from 'pinia'
import { CorpTypeCd, EntityState, WarningTypes } from '@/enums'
import { DateUtilities, LegalServices } from '@/services/'
import { GetCorpNumberedDescription } from '@bcrs-shared-components/corp-type-module'
import { useRootStore } from './rootStore'
import { GetFeatureFlag } from '@/utils'

export const useBusinessStore = defineStore('business', {
  state: (): BusinessStateIF => ({
    businessInfo: {
      adminFreeze: null,
      allowedActions: null,
      associationType: null,
      foundingDate: null,
      goodStanding: null,
      hasCorrections: null,
      hasCourtOrders: null,
      hasRestrictions: null,
      identifier: null,
      lastAddressChangeDate: null,
      lastAnnualReportDate: null,
      lastDirectorChangeDate: null,
      legalName: null,
      legalType: null,
      naicsCode: null,
      naicsDescription: null,
      naicsKey: null,
      nextAnnualReport: null,
      state: null,
      stateFiling: null,
      startDate: null,
      warnings: []
    }
  }),

  getters: {
    /** The Allowed Actions object. */
    getAllowedActions (state: BusinessStateIF): AllowedActionsIF {
      return state.businessInfo.allowedActions
    },

    /** The Amalgamated Info object. */
    getAmalgamatedInto (state: BusinessStateIF): AmalgamatedIntoIF {
      return state.businessInfo.amalgamatedInto
    },

    /** The business number (aka Tax ID). */
    getBusinessNumber (state: BusinessStateIF): string {
      return state.businessInfo.taxId
    },

    /** The business warnings list. */
    getBusinessWarnings (state: BusinessStateIF): Array<BusinessWarningIF> {
      return state.businessInfo.warnings
    },

    /** The business state. */
    getBusinessState (state: BusinessStateIF): EntityState {
      return state.businessInfo.state
    },

    /** The founding date. */
    getFoundingDate (state: BusinessStateIF): Date {
      return DateUtilities.apiToDate(state.businessInfo.foundingDate)
    },

    /** The start date. */
    getStartDate (state: BusinessStateIF): string {
      return state.businessInfo.startDate
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

    /** The legal name or alternate name if is firm. */
    getLegalName (state: BusinessStateIF): string {
      const rootStore = useRootStore()

      if (!GetFeatureFlag('enable-legal-name-fix')) {
        return state.businessInfo.legalName
      }
      if (this.isFirm && !rootStore.isDraftRegistration && !rootStore.isFiledRegistration) {
        return this.getAlternateName
      } else {
        return state.businessInfo.legalName
      }
    },

    /** The alternate name. */
    getAlternateName (state: BusinessStateIF): string {
      const { alternateNames, identifier } = state.businessInfo
      const name = alternateNames?.find((x) => x.identifier === identifier)?.name
      return name || null
    },

    /** The legal type. */
    getLegalType (state: BusinessStateIF): CorpTypeCd {
      return state.businessInfo.legalType
    },

    /** The entity name, or numbered description, or empty string. */
    getEntityName (): string {
      const rootStore = useRootStore()

      if (rootStore.isDraftAmalgamation || rootStore.isFiledAmalgamation) {
        return this.getLegalName || 'Numbered Amalgamated Company'
      } else {
        return (this.getLegalName || GetCorpNumberedDescription(this.getLegalType))
      }
    },

    /** The state filing URL (may be null). */
    getStateFilingUrl (state: BusinessStateIF): string {
      return state.businessInfo.stateFiling
    },

    /** Is true of the business has a court order filing. */
    hasCourtOrders (state: BusinessStateIF): boolean {
      return state.businessInfo.hasCourtOrders
    },

    /** Is True if a firm has at least one "compliance" warning. */
    hasComplianceWarning (): boolean {
      return (
        this.isFirm &&
        this.getBusinessWarnings.some(item => item.warningType?.includes(WarningTypes.COMPLIANCE))
      )
    },

    /** Is True if the business is in the process of being dissolved via involuntary dissolution. */
    hasInvoluntaryDissolutionWarning (): boolean {
      return this.getBusinessWarnings.some(item => item.warningType === WarningTypes.INVOLUNTARY_DISSOLUTION)
    },

    /** Is True if a firm has at least one "missing required business info" warning. */
    hasMissingInfoWarning (): boolean {
      return (
        this.isFirm &&
        this.getBusinessWarnings.some(item => item.warningType === WarningTypes.MISSING_REQUIRED_BUSINESS_INFO)
      )
    },

    /** Is True if the business is part of a future effective amalgamation filing. */
    isFutureEffectiveAmalgamation (): boolean {
      return this.getBusinessWarnings.some(item => item.warningType === WarningTypes.FUTURE_EFFECTIVE_AMALGAMATION)
    },

    /** Is True if business is active. */
    isActive (): boolean {
      return (this.getBusinessState === EntityState.ACTIVE)
    },

    /** Is True if the business is frozen. */
    isAdminFrozen (state: BusinessStateIF): boolean {
      return state.businessInfo.adminFreeze
    },

    /** Is True if entity is a Benefit Company. */
    isBComp (): boolean {
      return (this.getLegalType === CorpTypeCd.BENEFIT_COMPANY)
    },

    /** Is True if entity is a BC Company. */
    isBcCompany (): boolean {
      return (this.getLegalType === CorpTypeCd.BC_COMPANY)
    },

    /** Is True if entity is a BC Community Contribution Company. */
    isCcc (): boolean {
      return (this.getLegalType === CorpTypeCd.BC_CCC)
    },

    /** Is True if entity is a BC ULC Company. */
    isUlc (): boolean {
      return (this.getLegalType === CorpTypeCd.BC_ULC_COMPANY)
    },

    /** Is True if entity is a BEN/BC/CCC/ULC. */
    isBenBcCccUlc (): boolean {
      return (
        this.isBComp ||
        this.isBcCompany ||
        this.isCcc ||
        this.isUlc
      )
    },

    /** Is True if entity is a Continue In Benefit Company. */
    isContinuationInBen (): boolean {
      return (this.getLegalType === CorpTypeCd.BEN_CONTINUE_IN)
    },

    /** Is True if entity is a Continue In Ltd Company. */
    isContinuationInC (): boolean {
      return (this.getLegalType === CorpTypeCd.CONTINUE_IN)
    },

    /** Is True if entity is a Continue In Community Contribution Company. */
    isContinuationInCcc (): boolean {
      return (this.getLegalType === CorpTypeCd.CCC_CONTINUE_IN)
    },

    /** Is True if entity is a Continue In ULC Company. */
    isContinuationInUlc (): boolean {
      return (this.getLegalType === CorpTypeCd.ULC_CONTINUE_IN)
    },

    /** Is True if entity is a Cooperative. */
    isCoop (): boolean {
      return (this.getLegalType === CorpTypeCd.COOP)
    },

    /** Is True if entity is a Corporation. */
    isCorp (): boolean {
      return (this.getLegalType === CorpTypeCd.CORPORATION)
    },

    /** Is True if entity is a General Partnership. */
    isPartnership (): boolean {
      return (this.getLegalType === CorpTypeCd.PARTNERSHIP)
    },

    /** Is True if entity is a Sole Proprietorship. */
    isSoleProp (): boolean {
      return (this.getLegalType === CorpTypeCd.SOLE_PROP)
    },

    /** Is True if entity is a Sole Proprietorship or General Partnership. */
    isFirm (): boolean {
      return (this.isSoleProp || this.isPartnership)
    },

    /** Is True if business is in good standing. */
    isGoodStanding (state: BusinessStateIF): boolean {
      return state.businessInfo.goodStanding
    },

    /** Is True if business is historical (ie, dissolved). */
    isHistorical (): boolean {
      return (this.getBusinessState === EntityState.HISTORICAL)
    },

    /** Is True if business is in liquidation. */
    isLiquidation (): boolean {
      return (this.getBusinessState === EntityState.LIQUIDATION)
    },

    /**
     * Is True for non-BEN corps if FF is disabled.
     * Is False for BENs and other entity types.
     * Used to apply special pre-go-live functionality.
     */
    isDisableNonBenCorps (): boolean {
      if (this.isBcCompany || this.isCcc || this.isUlc) {
        return !GetFeatureFlag('enable-non-ben-corps')
      }
      return false
    },

    //
    // Alerts getters
    //

    /** Whether to show Amalgamation alert. */
    isAmalgamationAlert (): boolean {
      return this.isFutureEffectiveAmalgamation
    },

    /** Whether to show Frozen Information alert. */
    isFrozenInformationAlert (): boolean {
      return this.isAdminFrozen
    },

    /** Whether to show In Dissolution alert. */
    isInDissolutionAlert (): boolean {
      return this.hasInvoluntaryDissolutionWarning
    },

    /** Whether to show Missing Information alert. */
    isMissingInformationAlert (): boolean {
      return this.hasMissingInfoWarning
    },

    /** Whether to show Not In Compliance alert. */
    isNotInComplianceAlert (): boolean {
      return this.hasComplianceWarning
    },

    /** Whether to show Not In Good Standing alert. */
    isNotInGoodStandingAlert (): boolean {
      return !this.isGoodStanding
    }
  },

  actions: {
    setAdminFreeze (val: boolean) {
      this.businessInfo.adminFreeze = val
    },

    setAllowedActions (val: AllowedActionsIF) {
      this.businessInfo.allowedActions = val
    },

    setBusinessInfo (val: ApiBusinessIF) {
      this.businessInfo = val
    },

    setFoundingDate (val: string) {
      this.businessInfo.foundingDate = val
    },

    setStartDate (val: ApiDateTimeUtc) {
      this.businessInfo.startDate = val
    },

    setGoodStanding (val: boolean) {
      this.businessInfo.goodStanding = val
    },

    setIdentifier (val: string) {
      this.businessInfo.identifier = val
    },

    setLastAddressChangeDate (val: string) {
      this.businessInfo.lastAddressChangeDate = val
    },

    setLastAnnualReportDate (val: string) {
      this.businessInfo.lastAnnualReportDate = val
    },

    setLastDirectorChangeDate (val: string) {
      this.businessInfo.lastDirectorChangeDate = val
    },

    setLegalName (val: string) {
      this.businessInfo.legalName = val
    },

    setLegalType (val: CorpTypeCd) {
      this.businessInfo.legalType = val
    },

    setState (val: EntityState) {
      this.businessInfo.state = val
    },

    setStateFiling (val: string) {
      this.businessInfo.stateFiling = val
    },

    setTaxId (val: string) {
      this.businessInfo.taxId = val
    },

    /**
     * Fetches the business object from the Legal API and, if successful, triggers some actions.
     * @param context the Vuex context (passed in automatically)
     */
    loadBusinessInfo (): Promise<any> {
      // need to return a promise because action is called via dispatch
      return new Promise((resolve, reject) => {
        const businessId = sessionStorage.getItem('BUSINESS_ID')

        // if there is no business id, return error
        if (!businessId) {
          reject(new Error('Missing business id'))
          return
        }

        LegalServices.fetchBusiness(businessId)
          .then(businessInfo => {
            // set data to store
            this.setBusinessInfo(businessInfo)
            // return the business info object
            resolve(businessInfo)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
})
