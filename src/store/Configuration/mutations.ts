import { ConfigurationStateIF, KeyValueIF } from '@/interfaces'
import Vue from 'vue'
import axios from '@/axios-auth'

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  },

  /**
   * Use this mutator to set a specific attribute in unit testing. Eg,
   * store.commit('setTestConfiguration', { key: 'PAY_API_URL', value: 'https://auth.web.url/' })
   */
  setTestConfiguration (state: ConfigurationStateIF, { key, value }: KeyValueIF) {
    if (!state.configuration) {
      Vue.set(state, 'configuration', {})
    }
    Vue.set(state.configuration, key, value)
  },

  setSessionVariables (_state: ConfigurationStateIF, responseData: any) {
    // The following four session variables are used by SBC Header (a common component):
    sessionStorage.setItem('AUTH_WEB_URL', responseData['AUTH_WEB_URL'])
    sessionStorage.setItem('BUSINESSES_URL', responseData['BUSINESSES_URL'])
    sessionStorage.setItem('REGISTRY_HOME_URL', responseData['REGISTRY_HOME_URL'])
    sessionStorage.setItem('AUTH_API_URL', responseData['AUTH_API_URL'] + responseData['AUTH_API_VERSION'] + '/')
    sessionStorage.setItem('STATUS_API_URL', responseData['STATUS_API_URL'] + responseData['STATUS_API_VERSION'])

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

  setAxiosBaseUrl (_state: ConfigurationStateIF, legalApiUrl: string) {
    axios.defaults.baseURL = legalApiUrl
  }
}
