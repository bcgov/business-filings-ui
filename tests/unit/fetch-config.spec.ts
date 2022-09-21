import sinon from 'sinon'
import axios from '@/axios-auth'
import { fetchConfig } from '@/utils'

// mock the console.info function to hide the output
console.info = jest.fn()

describe('Fetch Config', () => {
  let get: any

  // init environment variable
  process.env.BASE_URL = '/business/'

  beforeEach(() => {
    // stub config endpoint
    get = sinon.stub(axios, 'get')
      .withArgs('http://localhost/business/config/configuration.json')
      .returns(Promise.resolve({
        data: {
          ADDRESS_COMPLETE_KEY: 'address complete key',
          AUTH_API_URL: 'auth api url',
          AUTH_API_VERSION: '/auth api version',
          AUTH_WEB_URL: 'auth web url',
          BUSINESS_CREATE_URL: 'business create url',
          BUSINESS_EDIT_URL: 'business edit url',
          BUSINESS_FILING_LD_CLIENT_ID: 'business filing ld client id',
          BUSINESSES_URL: 'businesses url',
          DASHBOARD_URL: 'dashboard url',
          KEYCLOAK_CONFIG_PATH: 'keycloak config path',
          LEGAL_API_URL: 'legal api url',
          LEGAL_API_VERSION_2: '/legal api version 2',
          PAY_API_URL: 'pay api url',
          PAY_API_VERSION: '/pay api version',
          REGISTRY_HOME_URL: 'registry home url',
          SENTRY_DSN: 'sentry dsn',
          SENTRY_ENABLE: 'sentry enable',
          SITEMINDER_LOGOUT_URL: 'siteminder logout url',
          STATUS_API_URL: 'status api url',
          STATUS_API_VERSION: '/status api version'
        }
      }))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches and loads the configuration correctly', async () => {
    // mock window.location getters
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/CP1234567',
      search: '?accountid=2288'
    } as any

    // call method
    await fetchConfig()

    // verify data
    expect(window['addressCompleteKey']).toBe('address complete key')
    expect(sessionStorage.getItem('AUTH_API_URL')).toBe('auth api url/auth api version/')
    expect(sessionStorage.getItem('AUTH_WEB_URL')).toBe('auth web url')
    expect(sessionStorage.getItem('CREATE_URL')).toBe('business create url')
    expect(sessionStorage.getItem('EDIT_URL')).toBe('business edit url')
    expect(window['ldClientId']).toBe('business filing ld client id')
    expect(sessionStorage.getItem('BUSINESSES_URL')).toBe('businesses url')
    // expect(sessionStorage.getItem('DASHBOARD_URL')).toBe('dashboard url')
    expect(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH')).toBe('keycloak config path')
    expect(axios.defaults.baseURL).toBe('legal api url/legal api version 2/')
    expect(sessionStorage.getItem('PAY_API_URL')).toBe('pay api url/pay api version/')
    expect(sessionStorage.getItem('REGISTRY_HOME_URL')).toBe('registry home url')
    expect(window['sentryDsn']).toBe('sentry dsn')
    expect(window['sentryEnable']).toBe('sentry enable')
    expect(sessionStorage.getItem('SITEMINDER_LOGOUT_URL')).toBe('siteminder logout url')
    expect(sessionStorage.getItem('STATUS_API_URL')).toBe('status api url/status api version')

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
      await fetchConfig()

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
    await fetchConfig()

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
    const error = await fetchConfig().catch(error => error)

    // verify error
    expect(error.message).toBe('Missing or invalid Business ID or Temp Reg Number.')
  })
})
