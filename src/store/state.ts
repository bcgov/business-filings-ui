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

  entityName: null,
  entityType: null,
  entityStatus: null,
  entityBusinessNo: null,
  entityIncNo: null,
  entityFoundingDate: null,
  entityDissolutionDate: null,
  entityDissolutionType: null,
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
