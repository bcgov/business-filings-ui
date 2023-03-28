import { ConfigurationStateIF, KeyValueIF } from '@/interfaces'
import Vue from 'vue'
import axios from '@/axios-auth'

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  },

  /**
   * Use this mutator to set a specific attribute in unit testing. Eg,
   * store.commit('setTestConfiguration', { key: 'VUE_APP_PAY_API_URL', value: 'https://auth.web.url/' })
   */
  setTestConfiguration (state: ConfigurationStateIF, { key, value }: KeyValueIF) {
    if (!state.configuration) {
      Vue.set(state, 'configuration', {})
    }
    Vue.set(state.configuration, key, value)
  },

  setSessionVariables (_state: ConfigurationStateIF, data: any) {
    // The following four session variables are used by SBC Header (a common component):
    sessionStorage.setItem('AUTH_WEB_URL', data.VUE_APP_AUTH_WEB_URL)
    sessionStorage.setItem('BUSINESSES_URL', data.VUE_APP_BUSINESSES_URL)
    sessionStorage.setItem('REGISTRY_HOME_URL', data.VUE_APP_REGISTRY_HOME_URL)
    sessionStorage.setItem('AUTH_API_URL', data.VUE_APP_AUTH_API_URL + data.VUE_APP_AUTH_API_VERSION + '/')
    sessionStorage.setItem('STATUS_API_URL', data.VUE_APP_STATUS_API_URL + data.VUE_APP_STATUS_API_VERSION)

    const hotjarId: string = data.VUE_APP_HOTJAR_ID;
    (<any>window).hotjarId = hotjarId

    const addressCompleteKey: string = data.VUE_APP_ADDRESS_COMPLETE_KEY;
    (<any>window).addressCompleteKey = addressCompleteKey

    const ldClientId: string = data.VUE_APP_BUSINESS_FILING_LD_CLIENT_ID;
    (<any>window).ldClientId = ldClientId

    const sentryDsn: string = data.VUE_APP_SENTRY_DSN;
    (<any>window).sentryDsn = sentryDsn

    const keycloakAuthUrl: string = data.VUE_APP_KEYCLOAK_AUTH_URL;
    (<any>window).keycloakAuthUrl = keycloakAuthUrl

    const keycloakRealm: string = data.VUE_APP_KEYCLOAK_REALM;
    (<any>window).keycloakRealm = keycloakRealm

    const keycloakClientId: string = data.VUE_APP_KEYCLOAK_CLIENTID;
    (<any>window).keycloakClientId = keycloakClientId
  },

  setAxiosBaseUrl (_state: ConfigurationStateIF, legalApiUrl: string) {
    axios.defaults.baseURL = legalApiUrl
  }
}
