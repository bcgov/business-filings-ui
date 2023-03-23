/**
 * stores BUSINESS_ID, TEMP_REG_NUMBER, BASE_URL, VUE_ROUTER_BASE from initial route.
 * FUTURE - consider refactoring this and passing ids to routes.js and getting rid
 * of session storage
 */

export function setBaseRouteAndBusinessId (pathname: string, processEnvBaseUrl: string, rootUrl: string): void {
  if (!processEnvBaseUrl || !pathname || !rootUrl) {
    throw new Error('Missing environment variables')
  }

  // get Business ID / Temp Reg Number and validate that it looks OK
  // it should be first token after Base URL in Pathname
  // FUTURE: improve Business ID / Temp Reg Number validation
  const id = pathname.replace(processEnvBaseUrl, '').split('/', 1)[0]
  const businessIdRegex = /^(BC|C|CP|FM)\d{7}$/
  if (businessIdRegex.test(id)) {
    sessionStorage.setItem('BUSINESS_ID', id)
    // ensure we don't already have a Temp Reg Number in scope
    sessionStorage.removeItem('TEMP_REG_NUMBER')
  } else if (id?.startsWith('T')) {
    sessionStorage.setItem('TEMP_REG_NUMBER', id)
    // ensure we don't already have a Business ID in scope
    sessionStorage.removeItem('BUSINESS_ID')
  } else {
    throw new Error('Missing or invalid Business ID or Temp Reg Number.')
  }

  // set Base for Vue Router
  // eg, "/business/CPxxx/" or "/business/Txxx/"
  const vueRouterBase = processEnvBaseUrl + id + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/business/CPxxx/
  const baseUrl = rootUrl + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
}
