import { LegalServices } from '@/services/'

export default {
  /**
   * Fetches the business info from the Legal API and, if successful, triggers some mutations.
   * @param context the Vuex context (passed in automatically)
   */
  loadBusinessInfo ({ commit, rootGetters }): Promise<any> {
    // need to return a promise because action is called via dispatch
    return new Promise((resolve, reject) => {
      const businessId = rootGetters.getBusinessId

      // if there is no business id, return error
      if (!businessId) reject(new Error('Missing business id'))

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
