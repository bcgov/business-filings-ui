import { RootStateIF } from '@/interfaces'

export const state: RootStateIF = {
  currentDate: null,
  currentJsDate: null,
  entityStatus: null,
  stateFiling: null,

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
  fetchingDataSpinner: false,
  startingAmalgamationSpinner: false,
  filingData: [],
  nameRequest: null,
  parties: [],
  recordsAddress: null,
  registeredAddress: null,
  tasks: [],
  userInfo: null
}
