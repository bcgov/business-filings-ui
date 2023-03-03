import { DateUtilities, LegalServices } from '@/services/'
import { BusinessIF } from '@/interfaces'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@bcrs-shared-components/enums'

export default {
  /**
   * Fetches the business info from the Legal API (including the state filing, if applicable)
   * and, if successful, triggers some mutations.
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
          const business = response?.data?.business as BusinessIF
          if (!business) {
            reject(new Error('Invalid business info'))
            return
          }

          if (businessId !== business.identifier) {
            reject(new Error('Business identifier mismatch'))
            return
          }

          // safety check -- but continue processing
          // hopefully ops will see this error in Sentry
          if (corpTypeCd && corpTypeCd !== business.legalType) {
            // eslint-disable-next-line no-console
            console.error('WARNING: Legal Type in Legal db does not match Corp Type in Auth db!')
          }

          // commit data to store
          // FUTURE: save entire business info object to store
          //         then use getters to access individual properties
          commit('setAdminFreeze', business.adminFreeze)
          if (business.taxId) {
            commit('setBusinessNumber', business.taxId)
          }
          if (Array.isArray(business.warnings)) {
            commit('setBusinessWarnings', business.warnings)
          }
          commit('setEntityFoundingDate', DateUtilities.apiToDate(business.foundingDate))
          commit('setEntityName', business.legalName)
          commit('setEntityState', business.state)
          commit('setEntityType', business.legalType)
          commit('setGoodStanding', business.goodStanding)
          commit('setHasCourtOrders', business.hasCourtOrders)
          commit('setIdentifier', business.identifier)
          if (business.lastAddressChangeDate) {
            commit('setLastAddressChangeDate', business.lastAddressChangeDate)
          }
          if (business.lastAnnualReportDate) {
            commit('setLastAnnualReportDate', business.lastAnnualReportDate)
          }
          if (business.lastDirectorChangeDate) {
            commit('setLastDirectorChangeDate', business.lastDirectorChangeDate)
          }

          // load state filing if the URL was present in the business payload
          const stateFilingUrl = business.stateFiling
          if (stateFilingUrl) {
            const filing = stateFilingUrl && await LegalServices.fetchFiling(stateFilingUrl)
            const filingType = filing?.header?.name as FilingTypes
            if (!filing || !filingType) {
              console.log('Invalid state filing', filing, filingType) // eslint-disable-line no-console
              reject(Error('Invalid state filing'))
              return
            }
            commit('setStateFiling', filing)
          }

          // return the business info object
          resolve(business)
        })
        .catch(error => {
          reject(new Error('Error: ' + error))
        })
    })
  }
}
