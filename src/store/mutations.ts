import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { FilingDataIF, OfficeAddressIF, StateIF, ApiTaskIF, PartyIF } from '@/interfaces'

export default {
  keycloakRoles (state: StateIF, keycloakRoles: Array<string>) {
    state.keycloakRoles = keycloakRoles
  },

  userKeycloakGuid (state: StateIF, userKeycloakGuid: string) {
    state.userKeycloakGuid = userKeycloakGuid
  },

  authRoles (state: StateIF, authRoles: Array<string>) {
    state.authRoles = authRoles
  },

  currentJsDate (state: StateIF, currentJsDate: Date) {
    state.currentJsDate = currentJsDate
  },

  currentDate (state: StateIF, currentDate: string) {
    state.currentDate = currentDate
  },

  nextARDate (state: StateIF, nextARDate: string) {
    state.nextARDate = nextARDate
  },

  nameRequest (state: StateIF, nameRequest: any) {
    state.nameRequest = nameRequest
  },

  ARFilingYear (state: StateIF, year: number) {
    state.ARFilingYear = year
  },

  arMaxDate (state: StateIF, date: string) {
    state.arMaxDate = date
  },

  arMinDate (state: StateIF, date: string) {
    state.arMinDate = date
  },

  entityStatus (state: StateIF, entityStatus: EntityStatus) {
    state.entityStatus = entityStatus
  },

  businessEmail (state: StateIF, businessEmail: string) {
    state.businessEmail = businessEmail
  },

  businessPhone (state: StateIF, businessPhone: string) {
    state.businessPhone = businessPhone
  },

  businessPhoneExtension (state: StateIF, businessPhoneExtension: string) {
    state.businessPhoneExtension = businessPhoneExtension
  },

  currentFilingStatus (state: StateIF, currentFilingStatus: FilingStatus) {
    state.currentFilingStatus = currentFilingStatus
  },

  mutateFetchingDataSpinner (state: StateIF, val: boolean) {
    state.fetchingDataSpinner = val
  },

  tasks (state: StateIF, tasks: Array<ApiTaskIF>) {
    state.tasks = tasks
  },

  registeredAddress (state: StateIF, registeredAddress: OfficeAddressIF) {
    state.registeredAddress = registeredAddress
  },

  recordsAddress (state: StateIF, recordsAddress: OfficeAddressIF) {
    state.recordsAddress = recordsAddress
  },

  businessAddress (state: StateIF, businessAddress: OfficeAddressIF) {
    state.businessAddress = businessAddress
  },

  parties (state: StateIF, parties: Array<PartyIF>) {
    state.parties = parties
  },

  configObject (state: StateIF, configObject: any) {
    state.configObject = configObject
  },

  filingData (state: StateIF, filingData: Array<FilingDataIF>) {
    state.filingData = filingData
  },

  corpTypeCd (state: StateIF, val: CorpTypeCd) {
    state.corpTypeCd = val
  },

  stateFiling (state: StateIF, stateFilingResponse: any) {
    state.stateFiling = stateFilingResponse
  }
}
