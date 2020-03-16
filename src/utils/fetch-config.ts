/* eslint-disable no-console */

import axios from '@/axios-auth'

/**
 * Fetches config from environment and API.
 * Also identifies Business ID.
 */
export function fetchConfig (): Promise<void> {
  //
  // get config from environment
  //
  const processEnvVueAppPath: string = process.env.VUE_APP_PATH // eg, cooperatives
  const processEnvBaseUrl: string = process.env.BASE_URL // eg, /cooperatives/
  const windowLocationPathname: string = window.location.pathname // eg, /cooperatives/CP0000841/...
  const windowLocationOrigin: string = window.location.origin // eg, http://localhost:8080

  if (!processEnvVueAppPath || !processEnvBaseUrl || !windowLocationPathname || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables'))
  }

  // get Business ID and validate that it looks OK
  // it should be first token after Base URL in Pathname
  const businessId = windowLocationPathname.replace(processEnvBaseUrl, '').split('/', 1)[0]
  if (!businessId?.startsWith('CP') && !businessId?.startsWith('BC') && !businessId?.startsWith('NR')) {
    return Promise.reject(new Error('Missing or invalid Business ID.'))
  }
  sessionStorage.setItem('BUSINESS_ID', businessId)

  // set Base for Vue Router
  // eg, /cooperatives/CP0000841/
  const vueRouterBase = processEnvBaseUrl + businessId + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)
  console.log('Set Vue Router Base to: ' + vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/cooperatives/CP0000841/
  const baseUrl = windowLocationOrigin + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
  console.log('Set Base URL to: ' + baseUrl)

  //
  // fetch config from API
  //
  const url = `/${processEnvVueAppPath}/config/configuration.json`
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-cache'
  }

  return axios
    .get(url, { headers })
    .then(response => {
      const businessesUrl = response.data['BUSINESSES_URL']
      sessionStorage.setItem('BUSINESSES_URL', businessesUrl)
      console.log('Set Businesses URL to: ' + businessesUrl)

      const authUrl = response.data['AUTH_URL']
      sessionStorage.setItem('AUTH_URL', authUrl)
      console.log('Set Auth URL to: ' + authUrl)

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
    })
}
