import { EntityStatus, CorpTypeCd, FilingStatus, EntityState } from '@/enums'
import { FilingDataIF, ApiFilingIF, OfficeAddressIF, StateIF, ApiTaskIF, BusinessWarningIF, PartyIF }
  from '@/interfaces'

export default {
  keycloakRoles (state: StateIF, keycloakRoles: Array<string>) {
    state.keycloakRoles = keycloakRoles
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
  adminFreeze (state: StateIF, adminFreeze: boolean) {
    state.adminFreeze = adminFreeze
  },
  arMaxDate (state: StateIF, date: string) {
    state.arMaxDate = date
  },
  arMinDate (state: StateIF, date: string) {
    state.arMinDate = date
  },
  identifier (state: StateIF, identifier: string) {
    state.identifier = identifier
  },
  businessNumber (state: StateIF, businessNumber: string) {
    state.businessNumber = businessNumber
  },
  businessWarnings (state: StateIF, warnings: Array<BusinessWarningIF>) {
    state.businessWarnings = warnings
  },
  entityFoundingDate (state: StateIF, entityFoundingDate: Date) {
    state.entityFoundingDate = entityFoundingDate
  },
  entityName (state: StateIF, entityName: string) {
    state.entityName = entityName
  },
  entityState (state: StateIF, entityState: EntityState) {
    state.entityState = entityState
  },
  entityStatus (state: StateIF, entityStatus: EntityStatus) {
    state.entityStatus = entityStatus
  },
  entityType (state: StateIF, entityType: CorpTypeCd) {
    state.entityType = entityType
  },
  goodStanding (state: StateIF, goodStanding: boolean) {
    state.goodStanding = goodStanding
  },
  hasCourtOrders (state: StateIF, hasCourtOrders: boolean) {
    state.hasCourtOrders = hasCourtOrders
  },
  reasonText (state: StateIF, text: string) {
    state.reasonText = text
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
  lastAnnualReportDate (state: StateIF, date: string) {
    state.lastAnnualReportDate = date
  },
  lastAddressChangeDate (state: StateIF, date: string) {
    state.lastAddressChangeDate = date
  },
  lastDirectorChangeDate (state: StateIF, date: string) {
    state.lastDirectorChangeDate = date
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
  }
}
