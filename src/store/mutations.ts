import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { FilingDataIF, ApiFilingIF, OfficeAddressIF, StateIF, ApiTaskIF, PartyIF } from '@/interfaces'

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

  tasks (state: StateIF, tasks: Array<ApiTaskIF>) {
    state.tasks = tasks
  },

  filings (state: StateIF, filings: Array<ApiFilingIF>) {
    state.filings = filings
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

  hasBlockerTask (state: StateIF, hasBlockerTask: boolean) {
    state.hasBlockerTask = hasBlockerTask
  },

  hasBlockerFiling (state: StateIF, hasBlockerFiling: boolean) {
    state.hasBlockerFiling = hasBlockerFiling
  },

  isCoaPending (state: StateIF, isCoaPending: boolean) {
    state.isCoaPending = isCoaPending
  },

  coaEffectiveDate (state: StateIF, coaEffectiveDate: Date) {
    state.coaEffectiveDate = coaEffectiveDate
  },

  corpTypeCd (state: StateIF, val: CorpTypeCd) {
    state.corpTypeCd = val
  },

  setStateFiling (state: StateIF, stateFilingResponse: any) {
    state.stateFiling = stateFilingResponse
  }
}
