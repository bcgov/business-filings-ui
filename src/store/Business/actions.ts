import { LegalServices } from '@/services/'

export default {
  /**
   * Fetches the business info from the Legal API and, if successful, triggers some mutations.
   * @param context the Vuex context (passed in automatically)
   * @param businessId the business identifier
   */
  // *** TODO: get businessId from store instead of passing it in
  loadBusinessInfo ({ commit }, businessId: string): Promise<any> {
    // need to return a promise because action is called via dispatch
    return new Promise((resolve, reject) => {
      LegalServices.fetchBusinessInfo(businessId)
        .then(businessInfo => {
          // commit data to store
          commit('setBusinessInfo', businessInfo)
          // return the business info object
          resolve(businessInfo)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}
