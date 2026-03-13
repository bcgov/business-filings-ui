import { ConfigurationStateIF } from '@/interfaces'
import { defineStore } from 'pinia'

export const useConfigurationStore = defineStore('configuration', {
  state: (): ConfigurationStateIF => ({
    configuration: null
  }),

  getters: {
    getAuthWebUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_AUTH_WEB_URL
    },

    getMyBusinessRegistryUrl (): string {
      return this.getAuthWebUrl + 'business'
    },

    getBusinessRegistryDashboardUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_REGISTRY_URL
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

    getBusinessRegistryUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_REGISTRY_URL || ''
    },

    getBusinessDashUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_DASH_URL || ''
    },

    getCorporateOnlineUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_CORPORATE_ONLINE_URL || ''
    },

    getCreateUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_CREATE_URL
    },

    getDashboardUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_DASHBOARD_URL
    },

    getEditUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_EDIT_URL
    },

    getBusinessApiUrl (state: ConfigurationStateIF): string {
      const businessApiUrl = state.configuration?.VUE_APP_BUSINESS_API_URL
      const businessApiVersion2 = state.configuration?.VUE_APP_BUSINESS_API_VERSION_2
      if (businessApiUrl && businessApiVersion2) {
        return businessApiUrl + businessApiVersion2 + '/'
      }
      return ''
    },

    getAuthApiUrl (state: ConfigurationStateIF): string {
      const authApiUrl = state.configuration?.VUE_APP_AUTH_API_URL
      const authApiVersion = state.configuration?.VUE_APP_AUTH_API_VERSION
      if (authApiUrl && authApiVersion) {
        return authApiUrl + authApiVersion + '/'
      }
      return ''
    },

    getPayApiUrl (state: ConfigurationStateIF): string {
      const payApiUrl = state.configuration?.VUE_APP_PAY_API_URL
      const payApiVersion = state.configuration?.VUE_APP_PAY_API_VERSION
      if (payApiUrl && payApiVersion) {
        return payApiUrl + payApiVersion + '/'
      }
      return ''
    },

    getStatusApiUrl (state: ConfigurationStateIF): string {
      return state.configuration.VUE_APP_STATUS_API_URL + state.configuration.VUE_APP_STATUS_API_VERSION
    },

    getSiteminderLogoutUrl (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_SITEMINDER_LOGOUT_URL
    },

    getHotJarId (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_HOTJAR_ID
    },

    getAddressCompleteKey (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_ADDRESS_COMPLETE_KEY
    },

    /** Get Launch Darkly Client ID */
    getBusinessFilingLdClientId (state: ConfigurationStateIF): string {
      return state.configuration?.VUE_APP_BUSINESS_FILING_LD_CLIENT_ID
    }
  },

  actions: {
    setConfiguration (data: any) {
      this.configuration = data
    },

    setSessionVariables (data: any) {
      // NB: some session variables are needed by SBC common components
      sessionStorage.setItem('AUTH_WEB_URL', data.VUE_APP_AUTH_WEB_URL)
      sessionStorage.setItem('REGISTRY_HOME_URL', data.VUE_APP_REGISTRY_HOME_URL)
      sessionStorage.setItem('AUTH_API_URL', data.VUE_APP_AUTH_API_URL + data.VUE_APP_AUTH_API_VERSION + '/')
      // eslint-disable-next-line max-len
      sessionStorage.setItem('BUSINESS_API_URL', data.VUE_APP_BUSINESS_API_URL + data.VUE_APP_BUSINESS_API_VERSION_2 + '/')
      sessionStorage.setItem('STATUS_API_URL', data.VUE_APP_STATUS_API_URL + data.VUE_APP_STATUS_API_VERSION)
      sessionStorage.setItem('PAY_API_URL', data.VUE_APP_PAY_API_URL + data.VUE_APP_PAY_API_VERSION)

      const hotjarId: string = data.VUE_APP_HOTJAR_ID;
      (<any>window).hotjarId = hotjarId

      const addressCompleteKey: string = data.VUE_APP_ADDRESS_COMPLETE_KEY;
      (<any>window).addressCompleteKey = addressCompleteKey

      const ldClientId: string = data.VUE_APP_BUSINESS_FILING_LD_CLIENT_ID;
      (<any>window).ldClientId = ldClientId

      const keycloakAuthUrl: string = data.VUE_APP_KEYCLOAK_AUTH_URL;
      (<any>window).keycloakAuthUrl = keycloakAuthUrl

      const keycloakRealm: string = data.VUE_APP_KEYCLOAK_REALM;
      (<any>window).keycloakRealm = keycloakRealm

      const keycloakClientId: string = data.VUE_APP_KEYCLOAK_CLIENTID;
      (<any>window).keycloakClientId = keycloakClientId
    },

    /** Fetches the configuration from the web server and, if successful, triggers some actions. */
    loadConfiguration (env = import.meta.env): Promise<any> {
      // need to return a promise because action is called via dispatch
      return new Promise((resolve) => {
        this.setConfiguration(env)
        this.setSessionVariables(env)

        resolve(import.meta.env)
      })
    }
  }
})
