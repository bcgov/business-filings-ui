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
  businessWarnings: [],
  entityName: null,
  entityType: null,
  entityState: null,
  entityStatus: null,
  entityFoundingDate: null,
  goodStanding: true,
  reasonText: null,
  lastAnnualReportDate: null,
  lastAddressChangeDate: null,
  lastDirectorChangeDate: null,
  hasCourtOrders: null,

  nextARDate: null,
  ARFilingYear: null,
  arMaxDate: null,
  arMinDate: null,

  tasks: [],
  filings: [],
  registeredAddress: null,
  recordsAddress: null,
  businessAddress: null,
  parties: [],
  nameRequest: null,

  currentFilingStatus: null,
  configObject: null,
  filingData: [],

  hasBlockerTask: false,
  hasBlockerFiling: false,
  isCoaPending: false,
  coaEffectiveDate: null
}
