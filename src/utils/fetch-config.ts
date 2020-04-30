/* eslint-disable no-console */

import axios from '@/axios-auth'

/**
 * Fetches config from environment and API.
 * Also identifies Business ID from initial route.
 */
export async function fetchConfig (): Promise<void> {
  // get config from environment
  const processEnvVueAppPath: string = process.env.VUE_APP_PATH // eg, cooperatives
  const processEnvBaseUrl: string = process.env.BASE_URL // eg, /cooperatives/
  const windowLocationPathname = window.location.pathname // eg, /cooperatives/CP1234567/...
  const windowLocationOrigin = window.location.origin // eg, http://localhost:8080

  if (!processEnvVueAppPath || !processEnvBaseUrl || !windowLocationPathname || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables'))
  }

  // fetch config from API
  // eg, http://localhost:8080/cooperatives/config/configuration.json
  // eg, https://dev.bcregistry.ca/cooperatives/config/configuration.json
  const url = `${windowLocationOrigin}${processEnvBaseUrl}config/configuration.json`
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-cache'
  }

  const response = await axios.get(url, { headers }).catch(() => {
    return Promise.reject(new Error('Could not fetch configuration.json'))
  })

  const businessesUrl = response.data['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)
  console.log('Set Businesses URL to: ' + businessesUrl)

  const authUrl = response.data['AUTH_URL']
  sessionStorage.setItem('AUTH_URL', authUrl)
  console.log('Set Auth URL to: ' + authUrl)

  const createUrl = response.data['CREATE_URL']
  sessionStorage.setItem('CREATE_URL', createUrl)
  console.log('Set Create URL to: ' + createUrl)

  const legalApiUrl = response.data['LEGAL_API_URL']
  // set base URL for axios calls
  axios.defaults.baseURL = legalApiUrl
  console.info('Set Legal API URL to: ' + legalApiUrl)

  const authApiUrl = response.data['AUTH_API_URL']
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)
  console.info('Set Auth API URL to: ' + authApiUrl)

  const payApiUrl = response.data['PAY_API_URL']
  sessionStorage.setItem('PAY_API_URL', payApiUrl)
  console.info('Set Pay API URL to: ' + payApiUrl)

  const keycloakConfigPath = response.data['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)
  console.info('Set KeyCloak Config Path to: ' + keycloakConfigPath)

  const addressCompleteKey = response.data['ADDRESS_COMPLETE_KEY']
  window['addressCompleteKey'] = addressCompleteKey
  console.info('Set Address Complete Key.')

  const ldClientId = response.data['LD_CLIENT_ID']
  window['ldClientId'] = ldClientId
  console.info('Set Launch Darkly Client ID.')

  // get Business ID / NR Number and validate that it looks OK
  // it should be first token after Base URL in Pathname
  // also change %20 to space for display and routing purposes
  // FUTURE: improve Business ID / NR Number validation
  const id = windowLocationPathname.replace(processEnvBaseUrl, '').split('/', 1)[0].replace(/(%20)/g, ' ')
  if (id?.startsWith('CP') || id?.startsWith('BC')) {
    sessionStorage.setItem('BUSINESS_ID', id)
    // ensure we don't already have a NR Number in scope
    sessionStorage.removeItem('NR_NUMBER')
  } else if (id?.startsWith('NR')) {
    sessionStorage.setItem('NR_NUMBER', id)
    // ensure we don't already have a Business ID in scope
    sessionStorage.removeItem('BUSINESS_ID')
  } else {
    return Promise.reject(new Error('Missing or invalid Business ID or NR Number.'))
  }

  // set Base for Vue Router
  // eg, "/cooperatives/CP1234567/" or "/cooperatives/NR 1234567/"
  const vueRouterBase = processEnvBaseUrl + id + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)
  console.log('Set Vue Router Base to: ' + vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/cooperatives/CP0000841/
  const baseUrl = windowLocationOrigin + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
  console.log('Set Base URL to: ' + baseUrl)
}
