
/** The state model for the configuration store module. */
export interface ConfigurationStateIF {
  configuration: {
    ADDRESS_COMPLETE_KEY: string,
    AUTH_API_URL: string,
    AUTH_API_VERSION: string
    AUTH_WEB_URL: string,
    BUSINESS_CREATE_URL: string,
    BUSINESS_EDIT_URL: string,
    BUSINESS_FILING_LD_CLIENT_ID: string,
    BUSINESSES_URL: string,
    DASHBOARD_URL: string,
    HOTJAR_ID: string
    KEYCLOAK_CONFIG_PATH: string,
    LEGAL_API_URL: string,
    LEGAL_API_VERSION_2: string
    PAY_API_URL: string,
    PAY_API_VERSION: string
    REGISTRY_HOME_URL: string,
    SENTRY_DSN: string,
    SENTRY_ENABLE: string,
    SITEMINDER_LOGOUT_URL: string,
    STATUS_API_URL: string,
    STATUS_API_VERSION: string
  }
}
