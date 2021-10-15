/* eslint-disable no-console */

import axios from '@/axios-auth'

/**
 * Fetches config from environment and API.
 * Also identifies Business ID from initial route.
 */
export async function fetchConfig (): Promise<void> {
  // get config from environment
  const processEnvBaseUrl: string = process.env.BASE_URL // eg, /business/
  const windowLocationPathname = window.location.pathname // eg, /business/CP1234567/...
  const windowLocationOrigin = window.location.origin // eg, http://localhost:8080

  if (!processEnvBaseUrl || !windowLocationPathname || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables'))
  }

  // fetch config from API
  // eg, http://localhost:8080/business/config/configuration.json
  // eg, https://dev.bcregistry.ca/business/config/configuration.json
  const url = `${windowLocationOrigin}${processEnvBaseUrl}config/configuration.json`
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-store'
  }

  const response = await axios.get(url, { headers }).catch(() => {
    return Promise.reject(new Error('Could not fetch configuration.json'))
  })

  if (!response?.data) {
    return Promise.reject(new Error('Invalid configuration.json'))
  }

  const authWebUrl: string = response.data['AUTH_WEB_URL']
  sessionStorage.setItem('AUTH_WEB_URL', authWebUrl)
  console.log('Set Auth Web URL to: ' + authWebUrl)

  const businessesUrl = response.data['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)
  console.info('Set Businesses URL to: ' + businessesUrl)

  const createUrl = response.data['BUSINESS_CREATE_URL']
  sessionStorage.setItem('CREATE_URL', createUrl)
  console.info('Set Create URL to: ' + createUrl)

  const editUrl = response.data['BUSINESS_EDIT_URL']
  sessionStorage.setItem('EDIT_URL', editUrl)
  console.info('Set Edit URL to: ' + editUrl)

  const legalApiUrl: string = response.data['LEGAL_API_URL'] + response.data['LEGAL_API_VERSION_2'] + '/'
  // set base URL for axios calls
  axios.defaults.baseURL = legalApiUrl
  console.log('Set Legal API URL to: ' + legalApiUrl)

  const authApiUrl: string = response.data['AUTH_API_URL'] + response.data['AUTH_API_VERSION'] + '/'
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)
  console.log('Set Auth API URL to: ' + authApiUrl)

  const payApiUrl: string = response.data['PAY_API_URL'] + response.data['PAY_API_VERSION'] + '/'
  sessionStorage.setItem('PAY_API_URL', payApiUrl)
  console.log('Set Pay API URL to: ' + payApiUrl)

  // for system alert banner (sbc-common-components)
  const statusApiUrl: string = response.data['STATUS_API_URL'] + response.data['STATUS_API_VERSION']
  sessionStorage.setItem('STATUS_API_URL', statusApiUrl)
  console.log('Set Status API URL to: ' + statusApiUrl)

  const keycloakConfigPath = response.data['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)
  console.info('Set KeyCloak Config Path to: ' + keycloakConfigPath)

  const addressCompleteKey = response.data['ADDRESS_COMPLETE_KEY']
  window['addressCompleteKey'] = addressCompleteKey
  addressCompleteKey && console.info('Set Address Complete Key.')

  const ldClientId = response.data['BUSINESS_FILING_LD_CLIENT_ID']
  window['ldClientId'] = ldClientId
  ldClientId && console.info('Set Launch Darkly Client ID.')

  const sentryEnable = response.data['SENTRY_ENABLE'];
  (<any>window).sentryEnable = sentryEnable

  const sentryDsn = response.data['SENTRY_DSN'];
  (<any>window).sentryDsn = sentryDsn
  sentryDsn && console.info('Set Sentry DSN.')

  // get Business ID / Temp Reg Number and validate that it looks OK
  // it should be first token after Base URL in Pathname
  // FUTURE: improve Business ID / Temp Reg Number validation
  const id = windowLocationPathname.replace(processEnvBaseUrl, '').split('/', 1)[0]
  if (id?.startsWith('CP') || id?.startsWith('BC')) {
    sessionStorage.setItem('BUSINESS_ID', id)
    // ensure we don't already have a Temp Reg Number in scope
    sessionStorage.removeItem('TEMP_REG_NUMBER')
  } else if (id?.startsWith('T')) {
    sessionStorage.setItem('TEMP_REG_NUMBER', id)
    // ensure we don't already have a Business ID in scope
    sessionStorage.removeItem('BUSINESS_ID')
  } else {
    return Promise.reject(new Error('Missing or invalid Business ID or Temp Reg Number.'))
  }

  // set Base for Vue Router
  // eg, "/business/CPxxx/" or "/business/Txxx/"
  const vueRouterBase = processEnvBaseUrl + id + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)
  console.info('Set Vue Router Base to: ' + vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/business/CPxxx/
  const baseUrl = windowLocationOrigin + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
  console.info('Set Base URL to: ' + baseUrl)
}
