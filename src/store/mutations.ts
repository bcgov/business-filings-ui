import { EntityStatus, CorpTypeCd, FilingStatus } from '@/enums'
import { DirectorIF, FilingDataIF, ApiFilingIF, OfficeAddressIF, StateIF, ApiTaskIF } from '@/interfaces'

export default {
  keycloakRoles (state: StateIF, keycloakRoles: Array<string>) {
    state.keycloakRoles = keycloakRoles
  },
  authRoles (state: StateIF, authRoles: Array<string>) {
    state.authRoles = authRoles
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
  arMinDate (state: StateIF, date: string) {
    state.arMinDate = date
  },
  arMaxDate (state: StateIF, date: string) {
    state.arMaxDate = date
  },
  entityBusinessNo (state: StateIF, entityBusinessNo: string) {
    state.entityBusinessNo = entityBusinessNo
  },
  entityName (state: StateIF, entityName: string) {
    state.entityName = entityName
  },
  entityType (state: StateIF, entityType: CorpTypeCd) {
    state.entityType = entityType
  },
  entityStatus (state: StateIF, entityStatus: EntityStatus) {
    state.entityStatus = entityStatus
  },
  entityIncNo (state: StateIF, entityIncNo: string) {
    state.entityIncNo = entityIncNo
  },
  entityFoundingDate (state: StateIF, entityFoundingDate: string) {
    state.entityFoundingDate = entityFoundingDate
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
  directors (state: StateIF, directors: Array<DirectorIF>) {
    state.directors = directors
  },
  lastAnnualReportDate (state: StateIF, date: string) {
    state.lastAnnualReportDate = date
  },
  lastFilingDate (state: StateIF, date: Date) {
    state.lastFilingDate = date
  },
  lastCoaFilingDate (state: StateIF, date: Date) {
    state.lastCoaFilingDate = date
  },
  lastCodFilingDate (state: StateIF, date: Date) {
    state.lastCodFilingDate = date
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
