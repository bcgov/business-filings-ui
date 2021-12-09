import { EntityStatus, CorpTypeCd, FilingStatus, DissolutionTypes, EntityState } from '@/enums'
import { DirectorIF, FilingDataIF, ApiFilingIF, OfficeAddressIF, ApiTaskIF, ComplianceWarning }
  from '@/interfaces'

export default {
  setKeycloakRoles ({ commit }, keycloakRoles: Array<string>) {
    commit('keycloakRoles', keycloakRoles)
  },
  setAuthRoles ({ commit }, authRoles: Array<string>) {
    commit('authRoles', authRoles)
  },
  setCurrentJsDate ({ commit }, currentJsDate: Date) {
    commit('currentJsDate', currentJsDate)
  },
  setCurrentDate ({ commit }, currentDate: string) {
    commit('currentDate', currentDate)
  },
  setNextARDate ({ commit }, nextARDate: string) {
    commit('nextARDate', nextARDate)
  },
  setNameRequest ({ commit }, nameRequest: any) {
    commit('nameRequest', nameRequest)
  },
  setARFilingYear ({ commit }, year: number) {
    commit('ARFilingYear', year)
  },
  setArMinDate ({ commit }, date: string) {
    commit('arMinDate', date)
  },
  setArMaxDate ({ commit }, date: string) {
    commit('arMaxDate', date)
  },
  setBusinessId ({ commit }, businessId: string) {
    commit('businessId', businessId)
  },
  setBusinessNumber ({ commit }, businessNumber: string) {
    commit('businessNumber', businessNumber)
  },
  setComplianceWarnings ({ commit }, complianceWarnings: Array<ComplianceWarning>) {
    commit('complianceWarnings', complianceWarnings)
  },
  setEntityFoundingDate ({ commit }, entityFoundingDate: Date) {
    commit('entityFoundingDate', entityFoundingDate)
  },
  setEntityName ({ commit }, entityName: string) {
    commit('entityName', entityName)
  },
  setEntityState ({ commit }, entityState: EntityState) {
    commit('entityState', entityState)
  },
  setEntityStatus ({ commit }, entityStatus: EntityStatus) {
    commit('entityStatus', entityStatus)
  },
  setEntityType ({ commit }, entityType: CorpTypeCd) {
    commit('entityType', entityType)
  },
  setHistoricalText ({ commit }, text: string) {
    commit('historicalText', text)
  },
  setBusinessEmail ({ commit }, businessEmail: string) {
    commit('businessEmail', businessEmail)
  },
  setBusinessPhone ({ commit }, businessPhone: string) {
    commit('businessPhone', businessPhone)
  },
  setBusinessPhoneExtension ({ commit }, businessPhoneExtension: string) {
    commit('businessPhoneExtension', businessPhoneExtension)
  },
  setCurrentFilingStatus ({ commit }, currentFilingStatus: FilingStatus) {
    commit('currentFilingStatus', currentFilingStatus)
  },
  setTasks ({ commit }, tasks: Array<ApiTaskIF>) {
    commit('tasks', tasks)
  },
  setFilings ({ commit }, filings: Array<ApiFilingIF>) {
    commit('filings', filings)
  },
  setRegisteredAddress ({ commit }, registeredAddress: OfficeAddressIF) {
    commit('registeredAddress', registeredAddress)
  },
  setRecordsAddress ({ commit }, recordsAddress: OfficeAddressIF) {
    commit('recordsAddress', recordsAddress)
  },
  setDirectors ({ commit }, directors: Array<DirectorIF>) {
    commit('directors', directors)
  },
  setLastAnnualReportDate ({ commit }, date: string) {
    commit('lastAnnualReportDate', date)
  },
  setLastAddressChangeDate ({ commit }, date: string) {
    commit('lastAddressChangeDate', date)
  },
  setLastDirectorChangeDate ({ commit }, date: string) {
    commit('lastDirectorChangeDate', date)
  },
  setConfigObject ({ commit }, configObject: any) {
    commit('configObject', configObject)
  },
  setFilingData ({ commit }, filingData: Array<FilingDataIF>) {
    commit('filingData', filingData)
  },
  setHasBlockerTask ({ commit }, hasBlockerTask: boolean) {
    commit('hasBlockerTask', hasBlockerTask)
  },
  setHasBlockerFiling ({ commit }, hasBlockerFiling: boolean) {
    commit('hasBlockerFiling', hasBlockerFiling)
  },
  setIsCoaPending ({ commit }, isCoaPending: boolean) {
    commit('isCoaPending', isCoaPending)
  },
  setCoaEffectiveDate ({ commit }, coaEffectiveDate: Date) {
    commit('coaEffectiveDate', coaEffectiveDate)
  }
}
