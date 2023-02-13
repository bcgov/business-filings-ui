import { ConfigurationStateIF } from '@/interfaces'
import axios from '@/axios-auth'

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  },
  setSessionVariables (state: ConfigurationStateIF, responseData: any) {
    const authWebUrl: string = responseData['AUTH_WEB_URL']
    sessionStorage.setItem('AUTH_WEB_URL', authWebUrl)
    console.info('Set Auth Web URL to: ' + authWebUrl)

    const registryHomeUrl: string = responseData['REGISTRY_HOME_URL']
    sessionStorage.setItem('REGISTRY_HOME_URL', registryHomeUrl)
    console.info('Set Registry Home URL to: ' + registryHomeUrl)

    const businessesUrl: string = responseData['BUSINESSES_URL']
    sessionStorage.setItem('BUSINESSES_URL', businessesUrl)
    console.info('Set Businesses URL to: ' + businessesUrl)

    const createUrl: string = responseData['BUSINESS_CREATE_URL']
    sessionStorage.setItem('CREATE_URL', createUrl)
    console.info('Set Create URL to: ' + createUrl)

    const editUrl: string = responseData['BUSINESS_EDIT_URL']
    sessionStorage.setItem('EDIT_URL', editUrl)
    console.info('Set Edit URL to: ' + editUrl)

    const authApiUrl: string = responseData['AUTH_API_URL'] + responseData['AUTH_API_VERSION'] + '/'
    sessionStorage.setItem('AUTH_API_URL', authApiUrl)
    console.info('Set Auth API URL to: ' + authApiUrl)

    const payApiUrl: string = responseData['PAY_API_URL'] + responseData['PAY_API_VERSION'] + '/'
    sessionStorage.setItem('PAY_API_URL', payApiUrl)
    console.info('Set Pay API URL to: ' + payApiUrl)

    // for system alert banner (sbc-common-components)
    const statusApiUrl: string = responseData['STATUS_API_URL'] + responseData['STATUS_API_VERSION']
    sessionStorage.setItem('STATUS_API_URL', statusApiUrl)
    console.info('Set Status API URL to: ' + statusApiUrl)

    const keycloakConfigPath: string = responseData['KEYCLOAK_CONFIG_PATH']
    sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)
    console.info('Set KeyCloak Config Path to: ' + keycloakConfigPath)

    const siteminderLogoutUrl: string = responseData['SITEMINDER_LOGOUT_URL']
    if (siteminderLogoutUrl) {
      sessionStorage.setItem('SITEMINDER_LOGOUT_URL', siteminderLogoutUrl)
      console.info('Set Siteminder Logout Url to: ' + siteminderLogoutUrl)
    }

    const hotjarId: string = responseData['HOTJAR_ID'];
    (<any>window).hotjarId = hotjarId
    hotjarId && console.info('Set Hotjar ID.')

    const addressCompleteKey: string = responseData['ADDRESS_COMPLETE_KEY'];
    (<any>window).addressCompleteKey = addressCompleteKey
    addressCompleteKey && console.info('Set Address Complete Key.')

    const ldClientId: string = responseData['BUSINESS_FILING_LD_CLIENT_ID'];
    (<any>window).ldClientId = ldClientId
    ldClientId && console.info('Set Launch Darkly Client ID.')

    const sentryDsn: string = responseData['SENTRY_DSN'];
    (<any>window).sentryDsn = sentryDsn
    sentryDsn && console.info('Set Sentry DSN.')

    const sentryEnable: string = responseData['SENTRY_ENABLE'];
    (<any>window).sentryEnable = sentryEnable
  },

  setAxiosBaseUrl (state, legalApiUrl: string) {
    axios.defaults.baseURL = legalApiUrl
    console.info('Set Legal API URL to: ' + legalApiUrl)
  }
}
