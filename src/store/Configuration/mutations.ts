import { ConfigurationStateIF } from '@/interfaces'
import Vue from "vue";
import axios from '@/axios-auth'

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  },
  /** Use this mutator to set a specific attribute in unit testing.
   * Like this: store.commit('setTestConfiguration', ['AUTH_WEB_URL', 'https://auth.web.url/'])
   * */
  setTestConfiguration (state: ConfigurationStateIF, payload: any) {
    if (!state.configuration) {
      Vue.set(state, "configuration", {})
    }
    Vue.set(state.configuration, payload[0], payload[1])
  },
  setSessionVariables (state: ConfigurationStateIF, responseData: any) {
    const hotjarId: string = responseData['HOTJAR_ID'];
    (<any>window).hotjarId = hotjarId

    const addressCompleteKey: string = responseData['ADDRESS_COMPLETE_KEY'];
    (<any>window).addressCompleteKey = addressCompleteKey

    const ldClientId: string = responseData['BUSINESS_FILING_LD_CLIENT_ID'];
    (<any>window).ldClientId = ldClientId

    const sentryDsn: string = responseData['SENTRY_DSN'];
    (<any>window).sentryDsn = sentryDsn

    const sentryEnable: string = responseData['SENTRY_ENABLE'];
    (<any>window).sentryEnable = sentryEnable
  },

  setAxiosBaseUrl (state, legalApiUrl: string) {
    axios.defaults.baseURL = legalApiUrl
  }
}
