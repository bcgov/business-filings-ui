import { EntityState, CorpTypeCd } from '@/enums'
import { BusinessStateIF, BusinessWarningIF } from '@/interfaces'

export default {
  setAdminFreeze (state: BusinessStateIF, val: boolean) {
    state.adminFreeze = val
  },

  setBusinessNumber (state: BusinessStateIF, val: string) {
    state.businessNumber = val
  },

  setBusinessWarnings (state: BusinessStateIF, val: Array<BusinessWarningIF>) {
    state.businessWarnings = val
  },

  setEntityFoundingDate (state: BusinessStateIF, val: Date) {
    state.entityFoundingDate = val
  },

  setEntityName (state: BusinessStateIF, val: string) {
    state.entityName = val
  },

  setEntityState (state: BusinessStateIF, val: EntityState) {
    state.entityState = val
  },

  setEntityType (state: BusinessStateIF, val: CorpTypeCd) {
    state.entityType = val
  },

  setGoodStanding (state: BusinessStateIF, val: boolean) {
    state.goodStanding = val
  },

  setHasCourtOrders (state: BusinessStateIF, val: boolean) {
    state.hasCourtOrders = val
  },

  setIdentifier (state: BusinessStateIF, val: string) {
    state.identifier = val
  },

  setLastAddressChangeDate (state: BusinessStateIF, val: string) {
    state.lastAddressChangeDate = val
  },

  setLastAnnualReportDate (state: BusinessStateIF, val: string) {
    state.lastAnnualReportDate = val
  },

  setLastDirectorChangeDate (state: BusinessStateIF, val: string) {
    state.lastDirectorChangeDate = val
  }
}
