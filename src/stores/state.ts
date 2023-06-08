import { StateIF } from '@/interfaces'

export const state: StateIF = {
  authRoles: [],
  currentDate: null,
  currentJsDate: null,
  entityStatus: null,
  keycloakRoles: [],
  stateFiling: null,
  userKeycloakGuid: null,

  businessEmail: null,
  businessPhone: null,
  businessPhoneExtension: null,
  corpTypeCd: null,

  ARFilingYear: null,
  arMaxDate: null,
  arMinDate: null,
  nextARDate: null,

  businessAddress: null,
  configObject: null,
  currentFilingStatus: null,
  fetchingDataSpinner: false,
  filingData: [],
  nameRequest: null,
  parties: [],
  recordsAddress: null,
  registeredAddress: null,
  tasks: []
}
