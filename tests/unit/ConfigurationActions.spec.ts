import { setBaseRouteAndBusinessId } from '@/utils'
import { getVuexStore } from '@/store'
import { nextTick } from 'vue'

// mock the console.info function to hide the output
console.info = jest.fn()

describe('Configuration Actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  // init environment variable
  process.env.BASE_URL = '/business/'
  process.env.VUE_APP_PATH = '/business'
  process.env.VUE_APP_ADDRESS_COMPLETE_KEY = 'address complete key'
  process.env.VUE_APP_AUTH_API_URL = 'auth api url'
  process.env.VUE_APP_AUTH_API_VERSION = '/auth api version'
  process.env.VUE_APP_AUTH_WEB_URL = 'auth web url'
  process.env.VUE_APP_BUSINESSES_URL = 'businesses url'
  process.env.VUE_APP_BUSINESS_CREATE_URL = 'business create url'
  process.env.VUE_APP_BUSINESS_EDIT_URL = 'business edit url'
  process.env.VUE_APP_BUSINESS_FILING_LD_CLIENT_ID = 'business filing ld client id'
  process.env.VUE_APP_DASHBOARD_URL = 'dashboard url'
  process.env.VUE_APP_LEGAL_API_URL = 'legal api url'
  process.env.VUE_APP_LEGAL_API_VERSION_2 = '/legal api version 2'
  process.env.VUE_APP_PAY_API_URL = 'pay api url'
  process.env.VUE_APP_PAY_API_VERSION = '/pay api version'
  process.env.VUE_APP_REGISTRY_HOME_URL = 'registry home url'
  process.env.VUE_APP_SENTRY_DSN = 'sentry dsn'
  process.env.VUE_APP_SITEMINDER_LOGOUT_URL = 'siteminder logout url'
  process.env.VUE_APP_STATUS_API_URL = 'status api url'
  process.env.VUE_APP_STATUS_API_VERSION = '/status api version'
  process.env.VUE_APP_KEYCLOAK_AUTH_URL = 'keycloak url'
  process.env.VUE_APP_KEYCLOAK_REALM = 'keycloak realm'
  process.env.VUE_APP_KEYCLOAK_CLIENTID = 'keycloak clientid'

  it('fetches and loads the configuration to the store', async () => {
    // mock window.location getters
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/CP1234567',
      search: '?accountid=2288'
    } as any

    // call method
    setBaseRouteAndBusinessId('CP1234567', '/business/', window.location.origin)
    await store.dispatch('loadConfiguration')
      .then(() => {
        nextTick()
        // verify data
        expect(store.getters.getAddressCompleteKey).toBe('address complete key')
        expect(store.getters.getAuthApiUrl).toBe('auth api url/auth api version/')
        expect(store.getters.getAuthWebUrl).toBe('auth web url')
        expect(store.getters.getCreateUrl).toBe('business create url')
        expect(store.getters.getEditUrl).toBe('business edit url')
        expect(store.getters.getBusinessFilingLdClientId).toBe('business filing ld client id')
        expect(store.getters.getBusinessUrl).toBe('businesses url')
        expect(store.getters.getLegalApiUrl).toBe('legal api url/legal api version 2/')
        expect(store.getters.getPayApiUrl).toBe('pay api url/pay api version/')
        expect(store.getters.getRegHomeUrl).toBe('registry home url')
        expect(store.getters.getSentryDsn).toBe('sentry dsn')
        expect(store.getters.getSiteminderLogoutUrl).toBe('siteminder logout url')
        expect(store.getters.getStatusApiUrl).toBe('status api url/status api version')
      })
  })

  it('fetches and loads the configuration to session variables', async () => {
    // mock window.location getters
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/CP1234567',
      search: '?accountid=2288'
    } as any

    // call method
    setBaseRouteAndBusinessId('CP1234567', '/business/', window.location.origin)
    await store.dispatch('loadConfiguration')
    expect(sessionStorage.getItem('VUE_ROUTER_BASE')).toBe('/business/CP1234567/')
    expect(sessionStorage.getItem('BASE_URL')).toBe('http://localhost/business/CP1234567/')
  })

  const tests = [
    { pathname: '/business/BC1234567', expected: 'BC1234567' },
    { pathname: '/business/C1234567', expected: 'C1234567' },
    { pathname: '/business/CP1234567', expected: 'CP1234567' },
    { pathname: '/business/FM1234567', expected: 'FM1234567' }
  ]

  for (const test of tests) {
    it(`sets business id correctly for ${test.pathname}`, async () => {
      // mock window.location getters
      delete window.location
      window.location = {
        origin: 'http://localhost',
        pathname: test.pathname
      } as any

      // call method
      const pathnameComponents = window.location.pathname.split('/')
      setBaseRouteAndBusinessId(pathnameComponents[2], '/business/', window.location.origin)

      // verify data
      expect(sessionStorage.getItem('BUSINESS_ID')).toBe(test.expected)
    })
  }

  it('sets temp reg number correctly', async () => {
    // mock window.location getters
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/T1234567'
    } as any

    // call method
    setBaseRouteAndBusinessId('T1234567', '/business/', window.location.origin)

    // verify data
    expect(sessionStorage.getItem('TEMP_REG_NUMBER')).toBe('T1234567')
  })

  it('throws error on invalid id', async () => {
    // mock window.location getters
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/ZZ1234567'
    } as any

    // call method
    expect(() => {
      setBaseRouteAndBusinessId('ZZ1234567', '/business/', window.location.origin)
    }).toThrow('Missing or invalid Business ID or Temp Reg Number.')
  })

  it('sessions variables correctly set for the SBC header', async () => {
    await store.dispatch('loadConfiguration')
      .then(() => {
        expect(sessionStorage.getItem('REGISTRY_HOME_URL')).toBe('registry home url')
        expect(sessionStorage.getItem('AUTH_WEB_URL')).toBe('auth web url')
        expect(sessionStorage.getItem('AUTH_API_URL')).toBe('auth api url/auth api version/')
        expect(sessionStorage.getItem('STATUS_API_URL')).toBe('status api url/status api version')
      })
  })
})
