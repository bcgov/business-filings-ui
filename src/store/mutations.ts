import { EntityStatus, CorpTypeCd, FilingStatus } from '@/enums'
import { FilingDataIF, StateIF } from '@/interfaces'

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
  nameRequest (state: StateIF, nameRequest: object) {
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
  tasks (state: StateIF, tasks: Array<any>) {
    state.tasks = tasks
  },
  filings (state: StateIF, filings: Array<any>) {
    state.filings = filings
  },
  registeredAddress (state: StateIF, registeredAddress: any) {
    state.registeredAddress = registeredAddress
  },
  recordsAddress (state: StateIF, recordsAddress: any) {
    state.recordsAddress = recordsAddress
  },
  directors (state: StateIF, directors: Array<any>) {
    state.directors = directors
  },
  lastAnnualReportDate (state: StateIF, lastAnnualReportDate: string) {
    state.lastAnnualReportDate = lastAnnualReportDate
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
  coaEffectiveDate (state: StateIF, coaEffectiveDate: string) {
    state.coaEffectiveDate = coaEffectiveDate
  }
}
