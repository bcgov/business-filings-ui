import { StateIF } from '@/interfaces'

export const state: StateIF = {
  keycloakRoles: [],
  userKeycloakGuid: null,
  authRoles: [],
  currentJsDate: null,
  currentDate: null,

  businessEmail: null,
  businessPhone: null,
  businessPhoneExtension: null,

  entityStatus: null,

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
  coaEffectiveDate: null,
  stateFiling: null
}
