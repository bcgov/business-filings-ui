import { BusinessStateIF } from '@/interfaces'

export const state: BusinessStateIF = {
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
    warnings: []
  }
}
