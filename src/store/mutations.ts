import { EntityStatus, CorpTypeCd, FilingStatus } from '@/enums'
import { FilingDataIF } from '@/interfaces'

export default {
  keycloakRoles (state, keycloakRoles: Array<string>) {
    state.keycloakRoles = keycloakRoles
  },
  authRoles (state, authRoles: Array<string>) {
    state.authRoles = authRoles
  },
  currentDate (state, currentDate: string) {
    state.currentDate = currentDate
  },
  nextARDate (state, nextARDate: string) {
    state.nextARDate = nextARDate
  },
  nameRequest (state, nameRequest: object) {
    state.nameRequest = nameRequest
  },
  ARFilingYear (state, year: number) {
    state.ARFilingYear = year
  },
  arMinDate (state, date: string) {
    state.arMinDate = date
  },
  arMaxDate (state, date: string) {
    state.arMaxDate = date
  },
  entityBusinessNo (state, entityBusinessNo: string) {
    state.entityBusinessNo = entityBusinessNo
  },
  entityName (state, entityName: string) {
    state.entityName = entityName
  },
  entityType (state, entityType: CorpTypeCd) {
    state.entityType = entityType
  },
  entityStatus (state, entityStatus: EntityStatus) {
    state.entityStatus = entityStatus
  },
  entityIncNo (state, entityIncNo: string) {
    state.entityIncNo = entityIncNo
  },
  entityFoundingDate (state, entityFoundingDate: string) {
    state.entityFoundingDate = entityFoundingDate
  },
  businessEmail (state, businessEmail: string) {
    state.businessEmail = businessEmail
  },
  businessPhone (state, businessPhone: string) {
    state.businessPhone = businessPhone
  },
  businessPhoneExtension (state, businessPhoneExtension: string) {
    state.businessPhoneExtension = businessPhoneExtension
  },
  currentFilingStatus (state, currentFilingStatus: FilingStatus) {
    state.currentFilingStatus = currentFilingStatus
  },
  tasks (state, tasks: Array<object>) {
    state.tasks = tasks
  },
  filings (state, filings: Array<object>) {
    state.filings = filings
  },
  registeredAddress (state, registeredAddress: object) {
    state.registeredAddress = registeredAddress
  },
  recordsAddress (state, recordsAddress: object) {
    state.recordsAddress = recordsAddress
  },
  directors (state, directors: Array<object>) {
    state.directors = directors
  },
  lastAnnualReportDate (state, lastAnnualReportDate: string) {
    state.lastAnnualReportDate = lastAnnualReportDate
  },
  configObject (state, configObject: object) {
    state.configObject = configObject
  },
  filingData (state, filingData: Array<FilingDataIF>) {
    state.filingData = filingData
  },
  hasBlockerTask (state, hasBlockerTask: boolean) {
    state.hasBlockerTask = hasBlockerTask
  }
}
