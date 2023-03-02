import { EntityStatus, FilingStatus, FilingTypes } from '@/enums'
import { FilingDataIF, ApiFilingIF, OfficeAddressIF, ApiTaskIF, PartyIF } from '@/interfaces'
import { LegalServices } from '@/services'

export default {
  setKeycloakRoles ({ commit }, keycloakRoles: Array<string>) {
    commit('keycloakRoles', keycloakRoles)
  },
  setUserKeycloakGuid ({ commit }, userKeycloakGuid: string) {
    commit('userKeycloakGuid', userKeycloakGuid)
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
  setArMaxDate ({ commit }, date: string) {
    commit('arMaxDate', date)
  },
  setArMinDate ({ commit }, date: string) {
    commit('arMinDate', date)
  },
  setEntityStatus ({ commit }, entityStatus: EntityStatus) {
    commit('entityStatus', entityStatus)
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
  setBusinessAddress ({ commit }, businessAddress: OfficeAddressIF) {
    commit('businessAddress', businessAddress)
  },
  setParties ({ commit }, parties: Array<PartyIF>) {
    commit('parties', parties)
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
  },
  /** Fetches stateFiling from the API and, if successful, triggers mutation. */
  async retrieveStateFiling ({ commit }, stateFilingUrl: string): Promise<void> {
    const filing = stateFilingUrl && await LegalServices.fetchFiling(stateFilingUrl)
    const filingType = filing?.header?.name as FilingTypes
    return new Promise((resolve, reject) => {
      if (!filing || !filingType) {
        console.log('Invalid state filing', filing, filingType) // eslint-disable-line no-console
        reject(Error('Invalid state filing'))
      } else {
        commit('setStateFiling', filing)
        resolve(filing)
      }
    })
  }
}
