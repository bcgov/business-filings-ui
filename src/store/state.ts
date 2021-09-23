import { StateIF } from '@/interfaces'

export const state: StateIF = {
  keycloakRoles: [],
  authRoles: [],
  username: null,
  currentDate: null,

  entityName: null,
  entityType: null,
  entityStatus: null,
  entityBusinessNo: null,
  entityIncNo: null,
  entityFoundingDate: null,
  businessEmail: null,
  businessPhone: null,
  lastAnnualReportDate: null,
  businessPhoneExtension: null,
  nextARDate: null,
  nameRequest: null,

  ARFilingYear: null,
  arMinDate: null,
  arMaxDate: null,

  tasks: [],
  filings: [],
  registeredAddress: null,
  recordsAddress: null,
  directors: [],

  currentFilingStatus: null,
  configObject: null,
  filingData: [],

  hasBlockerTask: false,
  hasBlockerFiling: false,
  isCoaPending: false,
  coaEffectiveDate: null
}
