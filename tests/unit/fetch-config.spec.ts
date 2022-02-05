import sinon from 'sinon'
import axios from '@/axios-auth'
import { fetchConfig } from '@/utils'

// FUTURE: get this working
xdescribe('Fetch Config', () => {
  // init environment variable
  process.env.BASE_URL = '/business/'

  // mock window.location getters
  delete window.location
  window.location = {
    origin: 'http://localhost',
    pathname: '/business/CP1234567',
    search: '?accountid=2288'
  } as any

  it('fetches and loads the configuration correctly', async () => {
    // stub config endpoint
    const get = sinon.stub(axios, 'get')
      .withArgs('business/config/configuration.json')
      .returns(Promise.resolve({
        AUTH_WEB_URL: 'auth web url',
        BUSINESSES_URL: 'businesses url',
        BUSINESS_CREATE_URL: 'business create url',
        BUSINESS_EDIT_URL: 'business edit url',
        LEGAL_API_URL: 'legal api url',
        LEGAL_API_VERSION_2: 'legal api version 2',
        AUTH_API_URL: 'auth api url',
        AUTH_API_VERSION: 'auth api version',
        PAY_API_URL: 'pay api url',
        PAY_API_VERSION: 'pay api version',
        STATUS_API_URL: 'status api url',
        STATUS_API_VERSION: 'status api version',
        KEYCLOAK_CONFIG_PATH: 'keycloak config path',
        ADDRESS_COMPLETE_KEY: 'address complete key',
        BUSINESS_FILING_LD_CLIENT_ID: 'business filing ld client id',
        SENTRY_ENABLE: 'sentry enable',
        SENTRY_DSN: 'sentry dsn'
      }))

    // call method
    await fetchConfig()

    // verify data
    expect(sessionStorage.getItem('ACCOUNT_ID')).toBe('2288')
    expect(sessionStorage.getItem('AUTH_WEB_URL')).toBe('auth web url')
    expect(sessionStorage.getItem('BUSINESSES_URL')).toBe('businesses url')
    expect(sessionStorage.getItem('BUSINESS_CREATE_URL')).toBe('business create url')
    expect(sessionStorage.getItem('BUSINESS_EDIT_URL')).toBe('business edit url')
    expect(axios.defaults.baseURL).toBe('legal api url/legal api version 2/')
    expect(sessionStorage.getItem('AUTH_API_URL')).toBe('auth api url/auth api version/')
    expect(sessionStorage.getItem('PAY_API_URL')).toBe('pay api url/pay api version/')
    expect(sessionStorage.getItem('STATUS_API_URL')).toBe('status api url/status api version/')
    expect(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH')).toBe('keycloak config path')
    expect(sessionStorage.getItem('ADDRESS_COMPLETE_KEY')).toBe('address complete key')
    expect(sessionStorage.getItem('BUSINESS_FILING_LD_CLIENT_ID')).toBe('business filing ld client id')
    expect(sessionStorage.getItem('SENTRY_ENABLE')).toBe('sentry enable')
    expect(sessionStorage.getItem('SENTRY_DSN')).toBe('sentry dsn')

    expect(sessionStorage.getItem('BUSINESS_ID')).toBe('CP1234567')
    expect(sessionStorage.getItem('VUE_ROUTER_BASE')).toBe('/business/CP1234567/')
    expect(sessionStorage.getItem('BASE_URL')).toBe('http://localhost:8080/business/CP1234567/')
  })
})
