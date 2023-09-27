import { ConfigurationStateIF } from '@/interfaces'
import { defineStore } from 'pinia'
import axios from '@/axios-auth'

export const useConfigurationStore = defineStore('configuration', {
  state: (): ConfigurationStateIF => ({
    configuration: null
  }),

  getters: {
    getAuthWebUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_AUTH_WEB_URL
    },

    getMyBusinessRegistryUrl (): string {
      return this.getAuthWebUrl + 'business'
    },

    getBusinessProfileUrl (): string {
      return this.getAuthWebUrl + 'businessprofile'
    },

    getRegHomeUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_REGISTRY_HOME_URL || ''
    },

    getLoginUrl (): string {
      return this.getRegHomeUrl + 'login'
    },

    getBusinessUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESSES_URL || ''
    },

    getCreateUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_BUSINESS_CREATE_URL
    },

    getEditUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_BUSINESS_EDIT_URL
    },

    getLegalApiBaseUrl (state: ConfigurationStateIF): string {
      const configuration = state.configuration
      return configuration.VUE_APP_LEGAL_API_URL
    },

    getLegalApiUrl (state: ConfigurationStateIF): string {
      const configuration = state.configuration
      return configuration.VUE_APP_LEGAL_API_URL + configuration.VUE_APP_LEGAL_API_VERSION_2 + '/'
    },

    getAuthApiUrl (state: ConfigurationStateIF): string {
      if (state.configuration?.VUE_APP_AUTH_API_URL && state.configuration?.VUE_APP_AUTH_API_VERSION) {
        return state.configuration.VUE_APP_AUTH_API_URL + state.configuration.VUE_APP_AUTH_API_VERSION + '/'
      }
      return ''
    },

    getPayApiUrl (state: ConfigurationStateIF): string {
      if (state.configuration?.VUE_APP_PAY_API_URL && state.configuration?.VUE_APP_PAY_API_VERSION) {
        return state.configuration.VUE_APP_PAY_API_URL + state.configuration.VUE_APP_PAY_API_VERSION + '/'
      }
      return ''
    },

    getStatusApiUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_STATUS_API_URL + state.configuration.VUE_APP_STATUS_API_VERSION
    },

    getSiteminderLogoutUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_SITEMINDER_LOGOUT_URL
    },

    getHotJarId (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_HOTJAR_ID
    },

    getAddressCompleteKey (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_ADDRESS_COMPLETE_KEY
    },

    /** Get Launch Darkly Client ID */
    getBusinessFilingLdClientId (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_BUSINESS_FILING_LD_CLIENT_ID
    },

    getSentryDsn (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_SENTRY_DSN
    }
  },

  actions: {
    setConfiguration (data: any) {
      this.configuration = data
    },

    setSessionVariables (data: any) {
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

    setAxiosBaseUrl (legalApiUrl: string) {
      axios.defaults.baseURL = legalApiUrl
    },

    /** Fetches the configuration from the web server and, if successful, triggers some actions. */
    loadConfiguration (): Promise<any> {
      // need to return a promise because action is called via dispatch
      return new Promise((resolve) => {
        this.setConfiguration(import.meta.env)
        this.setSessionVariables(import.meta.env)
        this.setAxiosBaseUrl(this.getLegalApiUrl)

        resolve(import.meta.env)
      })
    }
  }
})
