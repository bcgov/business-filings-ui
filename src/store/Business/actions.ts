import { DateUtilities, LegalServices } from '@/services/'
import { BusinessIF } from '@/interfaces'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@bcrs-shared-components/enums'

export default {
  /**
   * Fetches the business info from the Legal API and, if successful, triggers some mutations.
   * @param context the Vuex context (passed in automatically)
   * @param businessId the business identifier
   */
  loadBusinessInfo ({ commit, rootGetters }, businessId: string): Promise<any> {
    const corpTypeCd = rootGetters.getCorpTypeCd as CorpTypeCd

    // need to return a promise because action is called via dispatch
    // needs more research to understand fully
    return new Promise((resolve, reject) => {
      LegalServices.fetchBusinessInfo(businessId)
        .then(async (response) => {
          const businessInfo = response?.data?.business as BusinessIF
          if (!businessInfo) {
            reject(new Error('Invalid business info'))
            return
          }

          if (businessId !== businessInfo.identifier) {
            reject(new Error('Business identifier mismatch'))
            return
          }

          // safety check -- but continue processing
          // hopefully ops will see this error in Sentry
          if (corpTypeCd && corpTypeCd !== businessInfo.legalType) {
            // eslint-disable-next-line no-console
            console.error('WARNING: Legal Type in Legal db does not match Corp Type in Auth db!')
          }

          // commit data to store
          commit('setBusinessInfo', businessInfo)

          // *** TODO: delete these and use getters to access individual properties
          commit('setAdminFreeze', businessInfo.adminFreeze)
          if (businessInfo.taxId) {
            commit('setBusinessNumber', businessInfo.taxId)
          }
          if (Array.isArray(businessInfo.warnings)) {
            commit('setBusinessWarnings', businessInfo.warnings)
          }
          commit('setEntityFoundingDate', DateUtilities.apiToDate(businessInfo.foundingDate))
          commit('setEntityName', businessInfo.legalName)
          commit('setEntityState', businessInfo.state)
          commit('setEntityType', businessInfo.legalType)
          commit('setGoodStanding', businessInfo.goodStanding)
          commit('setHasCourtOrders', businessInfo.hasCourtOrders)
          commit('setIdentifier', businessInfo.identifier)
          if (businessInfo.lastAddressChangeDate) {
            commit('setLastAddressChangeDate', businessInfo.lastAddressChangeDate)
          }
          if (businessInfo.lastAnnualReportDate) {
            commit('setLastAnnualReportDate', businessInfo.lastAnnualReportDate)
          }
          if (businessInfo.lastDirectorChangeDate) {
            commit('setLastDirectorChangeDate', businessInfo.lastDirectorChangeDate)
          }

          // return the business info object
          resolve(businessInfo)
        })
        .catch(error => {
          reject(new Error('Error: ' + error))
        })
    })
  },

  /** Fetches stateFiling from the Legal API and, if successful, triggers mutation. */
  async loadStateFiling ({ commit }, stateFilingUrl: string): Promise<void> {
    // *** TODO: refactor this into then and catch as above (then remove async)
    if (stateFilingUrl) {
      const filing = await LegalServices.fetchFiling(stateFilingUrl)
      const filingType = filing?.header?.name as FilingTypes
      return new Promise((resolve, reject) => {
        if (!filingType) {
          reject(Error('Invalid state filing type'))
        } else {
          commit('setStateFiling', filing)
          resolve(filing)
        }
      })
    }
    // *** TODO: need to resolve here?
  }
}
