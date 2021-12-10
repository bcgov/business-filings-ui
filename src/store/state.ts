import { StateIF } from '@/interfaces'

export const state: StateIF = {
  keycloakRoles: [],
  authRoles: [],
  username: null,
  currentJsDate: null,
  currentDate: null,

  businessEmail: null,
  businessPhone: null,
  businessPhoneExtension: null,

  adminFreeze: null,
  identifier: null,
  businessNumber: null,
  complianceWarnings: [],
  entityName: null,
  entityType: null,
  entityState: null,
  entityStatus: null,
  entityFoundingDate: null,
  goodStanding: null,
  historicalText: null,
  lastAnnualReportDate: null,
  lastAddressChangeDate: null,
  lastDirectorChangeDate: null,

  nextARDate: null,
  ARFilingYear: null,
  arMaxDate: null,
  arMinDate: null,

  tasks: [],
  filings: [],
  registeredAddress: null,
  recordsAddress: null,
  directors: [],
  nameRequest: null,

  currentFilingStatus: null,
  configObject: null,
  filingData: [],

  hasBlockerTask: false,
  hasBlockerFiling: false,
  isCoaPending: false,
  coaEffectiveDate: null
}
