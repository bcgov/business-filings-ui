import { ConfigurationStateIF } from '@/interfaces'

export default {
  getAuthWebUrl (state: ConfigurationStateIF): string {
    return state.configuration.VUE_APP_AUTH_WEB_URL
  },

  getMyBusinessRegistryUrl (_state, getters): string {
    return getters.getAuthWebUrl + 'business'
  },

  getBusinessProfileUrl (_state, getters): string {
    return getters.getAuthWebUrl + 'businessprofile'
  },

  getRegHomeUrl (state: ConfigurationStateIF): string {
    return state.configuration?.VUE_APP_REGISTRY_HOME_URL || ''
  },

  getLoginUrl (_state, getters): string {
    return getters.getRegHomeUrl + 'login'
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

  getLegalApiUrl (state: ConfigurationStateIF): string {
    const root = state.configuration
    return root.VUE_APP_LEGAL_API_URL + root.VUE_APP_LEGAL_API_VERSION_2 + '/'
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
}
