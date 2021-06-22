import { StateIF } from '@/interfaces'

const state: StateIF = {
  // tombstone data
  keycloakRoles: [],
  authRoles: [],
  username: null,
  currentDate: null,

  // entity info
  entityName: null,
  entityType: null,
  entityStatus: null,
  entityBusinessNo: null,
  entityIncNo: null,
  entityFoundingDate: null,
  businessEmail: null,
  businessPhone: null,
  lastAnnualReportDate: null,
  lastFilingDate: null,
  lastCoaFilingDate: null,
  lastCodFilingDate: null,
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
  hasBlockerTask: null
}

export default state
