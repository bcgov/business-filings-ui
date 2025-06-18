/**
 * stores BUSINESS_ID, TEMP_REG_NUMBER, BASE_URL, VUE_ROUTER_BASE from initial route.
 * FUTURE - consider refactoring this and passing ids to routes.js and getting rid
 * of session storage
 */

export function setBaseRouteAndBusinessId (pathname: string, processEnvBaseUrl: string, rootUrl: string): void {
  if (!processEnvBaseUrl || !pathname || !rootUrl) {
    throw new Error('Missing environment variables')
  }

  // get Business ID and validate that it looks OK
  // it should be first token after Base URL in Pathname
  const id = pathname.replace(processEnvBaseUrl, '').split('/', 1)[0]
  const businessIdRegex = /^(BC|C|CP|FM)\d{7}$/
  if (businessIdRegex.test(id)) {
    sessionStorage.setItem('BUSINESS_ID', id)
  } else {
    // Make sure we don't have any previously set values
    // Handle no business id issue in main.ts
    sessionStorage.removeItem('BUSINESS_ID')
    throw new Error('Missing or invalid Business Id.')
  }

  // set Base for Vue Router
  // eg, "/business/CPxxx/"
  const vueRouterBase = processEnvBaseUrl + id + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/business/CPxxx/
  const baseUrl = rootUrl + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
}
