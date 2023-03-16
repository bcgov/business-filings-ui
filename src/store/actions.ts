import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { FilingDataIF, OfficeAddressIF, ApiTaskIF, PartyIF } from '@/interfaces'
import { LegalServices } from '@/services/'

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
  setFetchingDataSpinner ({ commit }, val: boolean) {
    commit('fetchingDataSpinner', val)
  },
  setTasks ({ commit }, tasks: Array<ApiTaskIF>) {
    commit('tasks', tasks)
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
  setCorpTypeCd ({ commit }, val: CorpTypeCd) {
    commit('corpTypeCd', val)
  },

  /**
   * Fetches the state filing from the Legal API and, if successful, triggers mutation.
   * @param context the Vuex context (passed in automatically)
   */
  loadStateFiling ({ commit, rootGetters }): Promise<void> {
    // need to return a promise because action is called via dispatch
    return new Promise((resolve, reject) => {
      const stateFilingUrl = rootGetters.getStateFilingUrl

      // if there is no state filing url, return null
      if (!stateFilingUrl) resolve(null)

      LegalServices.fetchFiling(stateFilingUrl)
        .then(filing => {
          // commit data to store
          commit('stateFiling', filing)
          // return the filing object
          resolve(filing)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}
