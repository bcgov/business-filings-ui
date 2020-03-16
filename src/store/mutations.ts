import { EntityTypes, EntityStatus, FilingStatus } from '@/enums'
import { FilingData } from '@/interfaces'

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
  lastAgmDate (state, lastAgmDate: string) {
    state.lastAgmDate = lastAgmDate
  },
  nextARDate (state, nextARDate: string) {
    state.nextARDate = nextARDate
  },
  ARFilingYear (state, ARFilingYear: number) {
    state.ARFilingYear = ARFilingYear
  },
  entityBusinessNo (state, entityBusinessNo: string) {
    state.entityBusinessNo = entityBusinessNo
  },
  entityName (state, entityName: string) {
    state.entityName = entityName
  },
  entityType (state, entityType: EntityTypes) {
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
  lastPreLoadFilingDate (state, lastPreLoadFilingDate: string) {
    state.lastPreLoadFilingDate = lastPreLoadFilingDate
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
  filingData (state, filingData: Array<FilingData>) {
    state.filingData = filingData
  }
}
