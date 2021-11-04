import { EntityStatus, CorpTypeCd, FilingStatus, DissolutionTypes } from '@/enums'
import { DirectorIF, FilingDataIF, ApiFilingIF, OfficeAddressIF, ApiTaskIF } from '@/interfaces'

export default {
  setKeycloakRoles ({ commit }, keycloakRoles: Array<string>) {
    commit('keycloakRoles', keycloakRoles)
  },
  setAuthRoles ({ commit }, authRoles: Array<string>) {
    commit('authRoles', authRoles)
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
  setEntityBusinessNo ({ commit }, entityBusinessNo: string) {
    commit('entityBusinessNo', entityBusinessNo)
  },
  setEntityName ({ commit }, entityName: string) {
    commit('entityName', entityName)
  },
  setEntityType ({ commit }, entityType: CorpTypeCd) {
    commit('entityType', entityType)
  },
  setEntityStatus ({ commit }, entityStatus: EntityStatus) {
    commit('entityStatus', entityStatus)
  },
  setEntityIncNo ({ commit }, entityIncNo: string) {
    commit('entityIncNo', entityIncNo)
  },
  setEntityFoundingDate ({ commit }, entityFoundingDate: Date) {
    commit('entityFoundingDate', entityFoundingDate)
  },
  setEntityDissolutionDate ({ commit }, entityDissolutionDate: Date) {
    commit('entityDissolutionDate', entityDissolutionDate)
  },
  setEntityDissolutionType ({ commit }, entityDissolutionType: DissolutionTypes) {
    commit('entityDissolutionType', entityDissolutionType)
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
