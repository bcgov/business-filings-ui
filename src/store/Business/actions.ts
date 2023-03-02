import { DateUtilities, LegalServices } from '@/services/'
import { BusinessIF } from '@/interfaces'

export default {
  /**
   * Fetches the business info from the Legal API (including the state filing, if applicable)
   * and, if successful, triggers some mutations.
   */
  loadBusinessInfo (context, businessId: string): Promise<any> {
    // need to return a promise because action is called via dispatch
    // needs more research to understand fully
    return new Promise((resolve, reject) => {
      LegalServices.fetchBusinessInfo(businessId)
        .then(response => {
          const business = response?.data?.business as BusinessIF
          if (!business) {
            reject(new Error('Invalid business info'))
          } else {
            context.commit('setAdminFreeze', business.adminFreeze)
            if (business.taxId) {
              context.commit('setBusinessNumber', business.taxId)
            }
            if (Array.isArray(business.warnings)) {
              context.commit('setBusinessWarnings', business.warnings)
            }
            context.commit('setEntityFoundingDate', DateUtilities.apiToDate(business.foundingDate))
            context.commit('setEntityName', business.legalName)
            context.commit('setEntityState', business.state)
            context.commit('setEntityType', business.legalType)
            context.commit('setGoodStanding', business.goodStanding)
            context.commit('setHasCourtOrders', business.hasCourtOrders)
            context.commit('setIdentifier', business.identifier)
            if (business.lastAddressChangeDate) {
              context.commit('setLastAddressChangeDate', business.lastAddressChangeDate)
            }
            if (business.lastAnnualReportDate) {
              context.commit('setLastAnnualReportDate', business.lastAnnualReportDate)
            }
            if (business.lastDirectorChangeDate) {
              context.commit('setLastDirectorChangeDate', business.lastDirectorChangeDate)
            }

            // *** TODO: fetch state filing

            resolve(business)
          }
        })
        .catch(error => {
          reject(new Error('Error: ' + error))
        })
    })
  }
}
