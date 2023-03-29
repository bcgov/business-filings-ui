import { EntityState } from '@/enums'
import { AllowedActionsIF, ApiBusinessIF, BusinessStateIF } from '@/interfaces'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

export default {
  setAdminFreeze (state: BusinessStateIF, val: boolean) {
    state.businessInfo.adminFreeze = val
  },

  setAllowedActions (state: BusinessStateIF, val: AllowedActionsIF) {
    state.businessInfo.allowedActions = val
  },

  setBusinessInfo (state: BusinessStateIF, val: ApiBusinessIF) {
    state.businessInfo = val
  },

  setFoundingDate (state: BusinessStateIF, val: string) {
    state.businessInfo.foundingDate = val
  },

  setGoodStanding (state: BusinessStateIF, val: boolean) {
    state.businessInfo.goodStanding = val
  },

  setIdentifier (state: BusinessStateIF, val: string) {
    state.businessInfo.identifier = val
  },

  setLastAddressChangeDate (state: BusinessStateIF, val: string) {
    state.businessInfo.lastAddressChangeDate = val
  },

  setLastAnnualReportDate (state: BusinessStateIF, val: string) {
    state.businessInfo.lastAnnualReportDate = val
  },

  setLastDirectorChangeDate (state: BusinessStateIF, val: string) {
    state.businessInfo.lastDirectorChangeDate = val
  },

  setLegalName (state: BusinessStateIF, val: string) {
    state.businessInfo.legalName = val
  },

  setLegalType (state: BusinessStateIF, val: CorpTypeCd) {
    state.businessInfo.legalType = val
  },

  setState (state: BusinessStateIF, val: EntityState) {
    state.businessInfo.state = val
  },

  setStateFiling (state: BusinessStateIF, val: string) {
    state.businessInfo.stateFiling = val
  },

  setTaxId (state: BusinessStateIF, val: string) {
    state.businessInfo.taxId = val
  }
}
