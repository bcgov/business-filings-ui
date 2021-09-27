import { StateIF } from '@/interfaces'

export const state: StateIF = {
  keycloakRoles: [],
  authRoles: [],
  username: null,
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
  lastAnnualReportDate: null,
  lastCoaFilingDate: null,
  lastCodFilingDate: null,

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
