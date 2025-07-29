import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import axios from '@/axios-auth'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import App from '@/App.vue'
import { AuthorizationRoles, AuthorizedActions } from '@/enums'
import { AmalgamationTypes } from '@bcrs-shared-components/enums'

import * as utils from '@/utils'
import { BusinessRegistryStaffActions, PublicUserActions,
  SbcFieldOfficeStaffActions } from './test-data/authorizedActions'

// mock fetch() as it is not defined in Vitest
// NB: it should be `global.fetch` but that doesn't work and this does
window.fetch = vi.fn().mockImplementation(() => {
  return {
    headers: { get: () => new Date() },
    ok: true,
    statusTxt: ''
  }
})

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const filingHistoryListStore = useFilingHistoryListStore()
const rootStore = useRootStore()

const BCOMP_ADDRESSES = {
  registeredOffice: {
    mailingAddress: {
      streetAddress: '1012 Douglas St',
      addressCity: 'Victoria',
      addressRegion: 'BC',
      addressType: 'mailing',
      postalCode: 'V8W 2C3',
      addressCountry: 'CA'
    },
    deliveryAddress: {
      streetAddress: '220 Buchanan St',
      addressCity: 'Glasgow',
      addressRegion: 'Scotland',
      addressType: 'delivery',
      postalCode: 'G1 2FFF',
      addressCountry: 'UK'
    }
  },
  recordsOffice: {
    mailingAddress: {
      streetAddress: '220 Buchanan St',
      addressCity: 'Glasgow',
      addressRegion: 'Scotland',
      addressType: 'mailing',
      postalCode: 'G1 2FFF',
      addressCountry: 'UK'
    },
    deliveryAddress: {
      streetAddress: '1012 Douglas St',
      addressCity: 'Victoria',
      addressRegion: 'BC',
      addressType: 'delivery',
      postalCode: 'V8W 2C3',
      addressCountry: 'CA'
    }
  }
}

const BCOMP_DIRECTORS = [
  {
    officer: {
      firstName: 'Peter',
      lastName: 'Griffin'
    },
    deliveryAddress: {
      streetAddress: '1012 Douglas St',
      addressCity: 'Victoria',
      addressRegion: 'BC',
      postalCode: 'V8W 2C3',
      addressCountry: 'CA'
    },
    mailingAddress: {
      streetAddress: '1012 Douglas St',
      addressCity: 'Victoria',
      addressRegion: 'BC',
      postalCode: 'V8W 2C3',
      addressCountry: 'CA'
    },
    roles: [{ roleType: 'Director' }]
  },
  {
    officer: {
      firstName: 'Joe',
      lastName: 'Swanson'
    },
    deliveryAddress: {
      streetAddress: '220 Buchanan St',
      addressCity: 'Glasgow',
      addressRegion: 'Scotland',
      postalCode: 'G1 2FFF',
      addressCountry: 'UK'
    },
    mailingAddress: {
      streetAddress: '220 Buchanan St',
      addressCity: 'Glasgow',
      addressRegion: 'Scotland',
      postalCode: 'G1 2FFF',
      addressCountry: 'UK'
    },
    roles: [{ roleType: 'Director' }]
  }
]

const BCOMP_PARTIES = [
  {
    deliveryAddress: {
      addressCity: 'Victoria',
      addressCountry: 'CA',
      addressRegion: 'BC',
      postalCode: 'V8Z 123',
      streetAddress: '1234 Fake St',
      streetAddressAdditional: ''
    },
    mailingAddress: {
      addressCity: 'Victoria',
      addressCountry: 'CA',
      addressRegion: 'BC',
      postalCode: 'V8Z 123',
      streetAddress: '1012 Douglas St',
      streetAddressAdditional: ''
    },
    officer: {
      email: 'abc@bcregtest.gov.bc.ca',
      firstName: 'Griffin',
      id: 0,
      lastName: 'Swanson',
      middleName: '',
      organizationName: '',
      partyType: 'person'
    },
    roles: [
      {
        appointmentDate: '2020-07-06',
        roleType: 'Completing Party'
      },
      {
        appointmentDate: '2020-07-06',
        roleType: 'Director'
      }
    ]
  },
  {
    mailingAddress: {
      addressCity: 'Victoria',
      addressCountry: 'CA',
      addressRegion: 'BC',
      postalCode: 'V8Z 6S1',
      streetAddress: '1012 Douglas St',
      streetAddressAdditional: ''
    },
    officer: {
      email: null,
      firstName: '',
      id: 1,
      lastName: '',
      middleName: '',
      organizationName: 'Test Inc',
      partyType: 'organization'
    },
    roles: [
      {
        appointmentDate: '2020-07-06',
        roleType: 'Incorporator'
      }
    ]
  }
]

const USER_INFO = {
  username: 'test/username',
  contacts: [
    { email: 'first.last@email.com' }
  ],
  firstname: 'First',
  lastname: 'Last',
  roles: '{one,two,three}'
}
describe('App as a COOP', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    sessionStorage.setItem('KEYCLOAK_TOKEN', 'dummy-token')
    const configuration = {
      'VUE_APP_LEGAL_API_URL': 'https://legal-api.url/',
      'VUE_APP_LEGAL_API_VERSION_2': 'v2',
      'VUE_APP_AUTH_API_GW_URL': 'https://auth-api-gw.url/',
      'VUE_APP_AUTH_API_VERSION': 'v1'
    }
    configurationStore.setConfiguration(configuration)
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    vi.spyOn(utils, 'GetKeycloakRoles').mockImplementation(() => [AuthorizationRoles.PUBLIC_USER])

    // GET user info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/users/@me')
      .returns(new Promise(resolve => resolve({
        data: USER_INFO
      })))

    // Permission stub - as public user.
    get.withArgs('https://legal-api.url/v2/permissions')
      .returns(Promise.resolve({
        data: {
          authorizedPermissions: [
            ...PublicUserActions
          ]
        }
      }))

    // GET entity info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/entities/CP0001191')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // Auth API Entity data
          contacts: [
            {
              email: 'name@mail.com',
              phone: '(111)-222-3333',
              phoneExtension: '999'
            }
          ]
        }
      })))

    // GET business info from Legal API
    get.withArgs('https://legal-api.url/v2/businesses/CP0001191')
      .returns(new Promise(resolve => resolve({
        data: {
          business: {
            legalName: 'TEST NAME',
            goodStanding: true,
            taxId: '123456789',
            identifier: 'CP0001191',
            foundingDate: '2000-07-13T00:00:00+00:00',
            legalType: 'CP'
          }
        }
      })))

    // GET tasks
    get.withArgs('https://legal-api.url/v2/businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({
        data:
        {
          'tasks': [
            {
              'task': {
                'todo': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2017,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': true,
              'order': 1
            },
            {
              'task': {
                'todo': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2018,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': false,
              'order': 2
            },
            {
              'task': {
                'todo': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2019,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': false,
              'order': 3
            }
          ]
        }
      })))

    // GET filings
    get.withArgs('https://legal-api.url/v2/businesses/CP0001191/filings')
      .returns(new Promise(resolve => resolve({
        data: {
          filings: [
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'CP0001191',
              commentsCount: 0,
              displayName: 'Annual Report (2019)',
              effectiveDate: 'Wed, 2 Jan 2019 12:00:00 GMT',
              filingId: 111,
              isFutureEffective: false,
              name: 'annualReport',
              status: 'COMPLETED',
              submittedDate: 'Wed, 2 Jan 2019 12:00:00 GMT',
              submitter: 'Sub  Mitter'
            },
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'CP0001191',
              commentsCount: 0,
              displayName: 'Director Change',
              effectiveDate: 'Mon, 4 Mar 2019 12:00:00 GMT',
              filingId: 222,
              isFutureEffective: false,
              name: 'changeOfDirectors',
              status: 'COMPLETED',
              submittedDate: 'Mon, 4 Mar 2019 12:00:00 GMT',
              submitter: 'Sub  Mitter'
            },
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'CP0001191',
              commentsCount: 0,
              displayName: 'Address Change',
              effectiveDate: 'Mon, 6 May 2019 12:00:00 GMT',
              filingId: 333,
              isFutureEffective: false,
              name: 'changeOfAddress',
              status: 'COMPLETED',
              submittedDate: 'Mon, 6 May 2019 12:00:00 GMT',
              submitter: 'Sub  Mitter'
            }
          ]
        }
      })))

    // GET addresses
    get.withArgs('https://legal-api.url/v2/businesses/CP0001191/addresses')
      .returns(new Promise(resolve => resolve({
        data:
        {
          registeredOffice:
          {
            mailingAddress: {
              streetAddress: '1012 Douglas St',
              addressCity: 'Victoria',
              addressRegion: 'BC',
              addressType: 'mailing',
              postalCode: 'V8W 2C3',
              addressCountry: 'CA'
            },
            deliveryAddress: {
              streetAddress: '220 Buchanan St',
              addressCity: 'Glasgow',
              addressRegion: 'Scotland',
              addressType: 'delivery',
              postalCode: 'G1 2FFF',
              addressCountry: 'UK'
            }
          }
        }
      })))

    // GET parties
    get.withArgs('https://legal-api.url/v2/businesses/CP0001191/parties')
      .returns(new Promise(resolve => resolve({
        data:
        {
          parties: [
            {
              'officer': {
                'firstName': 'Peter',
                'lastName': 'Griffin'
              },
              'deliveryAddress': {
                'streetAddress': '1012 Douglas St',
                'addressCity': 'Victoria',
                'addressRegion': 'BC',
                'postalCode': 'V8W 2C3',
                'addressCountry': 'CA'
              },
              'roles': [{ 'roleType': 'Director' }]
            },
            {
              'officer': {
                'firstName': 'Joe',
                'lastName': 'Swanson'
              },
              'deliveryAddress': {
                'streetAddress': '220 Buchanan St',
                'addressCity': 'Glasgow',
                'addressRegion': 'Scotland',
                'postalCode': 'G1 2FFF',
                'addressCountry': 'UK'
              },
              'roles': [{ 'roleType': 'Director' }]
            },
            {
              'officer': {
                'firstName': 'Jackie',
                'lastName': 'Smith'
              },
              'deliveryAddress': {
                'streetAddress': '220 Electra St',
                'addressCity': 'Vancouver',
                'addressRegion': 'BC',
                'postalCode': '123 FFF',
                'addressCountry': 'CA'
              },
              'roles': [{ 'roleType': 'Custodian' }]
            }
          ]
        }
      })))

    // create a Local Vue and install router (and store) on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    wrapper = shallowMount(App, {
      localVue,
      router,
      vuetify
    })
    vm = wrapper.vm

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('gets staff permissions properly', () => {
    rootStore.setAuthorizedActions(BusinessRegistryStaffActions)

    expect(utils.IsAuthorized(AuthorizedActions.STAFF_FILINGS)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.STAFF_BREADCRUMBS)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.SBC_BREADCRUMBS)).toBe(false)
  })

  it('gets SBC staff permissions properly', () => {
    rootStore.setAuthorizedActions(SbcFieldOfficeStaffActions)
    expect(utils.IsAuthorized(AuthorizedActions.EDITABLE_CERTIFY_NAME)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.SBC_BREADCRUMBS)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.STAFF_FILINGS)).toBe(false)
  })

  it('gets public user permissions properly', () => {
    rootStore.setAuthorizedActions(PublicUserActions)
    expect(utils.IsAuthorized(AuthorizedActions.INCORPORATION_APPLICATION_FILING)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.FILE_AND_PAY)).toBe(true)
    expect(utils.IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)).toBe(false)
  })

  it('fetches Entity Info properly', () => {
    expect(rootStore.businessEmail).toEqual('name@mail.com')
    expect(rootStore.businessPhone).toEqual('(111)-222-3333')
    expect(rootStore.businessPhoneExtension).toEqual('999')
  })

  it('initializes Current Date properly', () => {
    const dateString = vm.dateToYyyyMmDd(new Date())
    expect(rootStore.getCurrentDate).toEqual(dateString)
  })

  it('fetches Business Info properly', () => {
    expect(businessStore.getLegalName).toBe('TEST NAME')
    expect(businessStore.isGoodStanding).toBe(true)
    expect(businessStore.getBusinessNumber).toBe('123456789')
    expect(businessStore.getIdentifier).toBe('CP0001191')
    const entityFoundingDate = vm.apiToDate('2000-07-13T00:00:00+00:00')
    expect(businessStore.getFoundingDate).toEqual(entityFoundingDate)
  })

  it('fetches Tasks properly', () => {
    expect(rootStore.tasks.length).toBe(3)
    expect(rootStore.tasks[0].task.todo.header.ARFilingYear).toBe(2017)
    expect(rootStore.tasks[1].task.todo.header.ARFilingYear).toBe(2018)
    expect(rootStore.tasks[2].task.todo.header.ARFilingYear).toBe(2019)
  })

  it.skip('fetches Filings properly', () => {
    expect(filingHistoryListStore.filings.length).toBe(3)
    expect(filingHistoryListStore.filings[0].name).toBe('annualReport')
    expect(filingHistoryListStore.filings[1].name).toBe('changeOfDirectors')
    expect(filingHistoryListStore.filings[2].name).toBe('changeOfAddress')
  })

  it('fetches Addresses properly', () => {
    expect(rootStore.registeredAddress.mailingAddress.addressCity).toBe('Victoria')
    expect(rootStore.registeredAddress.deliveryAddress.addressCity).toBe('Glasgow')

    // These values have been assigned in the mockResponse but are expected to be filtered out by front-end logic.
    expect(rootStore.registeredAddress.mailingAddress.addressType).toBeUndefined()
  })

  it('fetches Parties properly', () => {
    expect(rootStore.parties.length).toBe(3)
    expect(rootStore.parties[0].officer.lastName).toBe('Griffin') // director
    expect(rootStore.parties[1].officer.lastName).toBe('Swanson') // director
    expect(rootStore.parties[2].officer.lastName).toBe('Smith') // custodian
  })
})

describe('App as a BCOMP', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    sessionStorage.setItem('KEYCLOAK_TOKEN', 'dummy-token')
    const configuration = {
      'VUE_APP_LEGAL_API_URL': 'https://legal-api.url/',
      'VUE_APP_LEGAL_API_VERSION_2': 'v2',
      'VUE_APP_AUTH_API_GW_URL': 'https://auth-api-gw.url/',
      'VUE_APP_AUTH_API_VERSION': 'v1'
    }
    configurationStore.setConfiguration(configuration)
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    vi.spyOn(utils, 'GetKeycloakRoles').mockImplementation(() => [AuthorizationRoles.PUBLIC_USER])

    // GET user info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/users/@me')
      .returns(new Promise(resolve => resolve({
        data: USER_INFO
      })))

    // Get permissions from Legal API
    get.withArgs('https://legal-api.url/v2/permissions')
      .returns(Promise.resolve({
        data: {
          authorizedPermissions: [
            ...PublicUserActions
          ]
        }
      }))

    // GET entity info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/entities/BC0007291')
      .returns(new Promise(resolve => resolve({
        data:
        {
          contacts: [
            {
              email: 'name@mail.com',
              phone: '(111)-222-3333',
              phoneExtension: '999'
            }
          ]
        }
      })))

    // GET business info from Legal API
    get.withArgs('https://legal-api.url/v2/businesses/BC0007291')
      .returns(new Promise(resolve => resolve({
        data: {
          business: {
            legalName: 'TEST NAME',
            goodStanding: true,
            taxId: '123456789',
            identifier: 'BC0007291',
            foundingDate: '2000-07-13T00:00:00+00:00',
            legalType: 'BEN'
          }
        }
      })))

    // GET tasks
    get.withArgs('https://legal-api.url/v2/businesses/BC0007291/tasks')
      .returns(new Promise(resolve => resolve({
        data:
        {
          tasks: [
            {
              task: {
                todo: {
                  header: {
                    name: 'annualReport',
                    ARFilingYear: 2017,
                    status: 'NEW'
                  }
                }
              },
              enabled: true,
              order: 1
            },
            {
              task: {
                todo: {
                  header: {
                    name: 'annualReport',
                    ARFilingYear: 2018,
                    status: 'NEW'
                  }
                }
              },
              enabled: false,
              order: 2
            },
            {
              task: {
                todo: {
                  header: {
                    name: 'annualReport',
                    ARFilingYear: 2019,
                    status: 'NEW'
                  }
                }
              },
              enabled: false,
              order: 3
            }
          ]
        }
      })))

    // GET filings
    get.withArgs('https://legal-api.url/v2/businesses/BC0007291/filings')
      .returns(new Promise(resolve => resolve({
        data: {
          filings: [
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'BC0007291',
              commentsCount: 0,
              displayName: 'Annual Report (2019)',
              effectiveDate: 'Wed, 2 Jan 2019 12:00:00 GMT',
              filingId: 111,
              isFutureEffective: false,
              name: 'annualReport',
              status: 'COMPLETED',
              submittedDate: 'Wed, 2 Jan 2019 12:00:00 GMT',
              submitter: 'Sub Mitter'
            },
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'BC0007291',
              commentsCount: 0,
              displayName: 'Director Change',
              effectiveDate: 'Mon, 4 Mar 2019 12:00:00 GMT',
              filingId: 222,
              isFutureEffective: false,
              name: 'changeOfDirectors',
              status: 'COMPLETED',
              submittedDate: 'Mon, 4 Mar 2019 12:00:00 GMT',
              submitter: 'Sub Mitter'
            },
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'BC0007291',
              commentsCount: 0,
              displayName: 'Address Change',
              effectiveDate: 'Mon, 6 May 2019 12:00:00 GMT',
              filingId: 333,
              isFutureEffective: false,
              name: 'changeOfAddress',
              status: 'COMPLETED',
              submittedDate: 'Mon, 6 May 2019 12:00:00 GMT',
              submitter: 'Sub Mitter'
            }
          ]
        }
      })))

    // GET addresses
    get.withArgs('https://legal-api.url/v2/businesses/BC0007291/addresses')
      .returns(new Promise(resolve => resolve({
        data: BCOMP_ADDRESSES
      })))

    // GET parties
    get.withArgs('https://legal-api.url/v2/businesses/BC0007291/parties')
      .returns(new Promise(resolve => resolve({
        data:
        {
          parties: BCOMP_DIRECTORS
        }
      })))

    // create a Local Vue and install router (and store) on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    wrapper = shallowMount(App, {
      localVue,
      router,
      vuetify
    })
    vm = wrapper.vm

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches Entity Info properly', () => {
    expect(rootStore.businessEmail).toEqual('name@mail.com')
    expect(rootStore.businessPhone).toEqual('(111)-222-3333')
    expect(rootStore.businessPhoneExtension).toEqual('999')
  })

  it('initializes Current Date properly', () => {
    const dateString = vm.dateToYyyyMmDd(new Date())
    expect(rootStore.getCurrentDate).toEqual(dateString)
  })

  it('fetches Business Info properly', () => {
    expect(businessStore.getLegalName).toBe('TEST NAME')
    expect(businessStore.isGoodStanding).toBe(true)
    expect(businessStore.getBusinessNumber).toBe('123456789')
    expect(businessStore.getIdentifier).toBe('BC0007291')
    const entityFoundingDate = vm.apiToDate('2000-07-13T00:00:00+00:00')
    expect(businessStore.getFoundingDate).toEqual(entityFoundingDate)
  })

  it('fetches Tasks properly', () => {
    expect(rootStore.tasks.length).toBe(3)
    expect(rootStore.tasks[0].task.todo.header.ARFilingYear).toBe(2017)
    expect(rootStore.tasks[1].task.todo.header.ARFilingYear).toBe(2018)
    expect(rootStore.tasks[2].task.todo.header.ARFilingYear).toBe(2019)
  })

  it.skip('fetches Filings properly', () => {
    expect(filingHistoryListStore.filings.length).toBe(3)
    expect(filingHistoryListStore.filings[0].name).toBe('annualReport')
    expect(filingHistoryListStore.filings[1].name).toBe('changeOfDirectors')
    expect(filingHistoryListStore.filings[2].name).toBe('changeOfAddress')
  })

  it('fetches Addresses properly', () => {
    expect(rootStore.registeredAddress.mailingAddress.addressCity).toBe('Victoria')
    expect(rootStore.registeredAddress.deliveryAddress.addressCity).toBe('Glasgow')

    expect(rootStore.recordsAddress.mailingAddress.addressCity).toBe('Glasgow')
    expect(rootStore.recordsAddress.deliveryAddress.addressCity).toBe('Victoria')

    // These values have been assigned in the mockResponse but are expected to be filtered out by front-end logic.
    expect(rootStore.registeredAddress.mailingAddress.addressType).toBeUndefined()
    expect(rootStore.recordsAddress.mailingAddress.addressType).toBeUndefined()
  })

  it('fetches Parties properly', () => {
    expect(rootStore.parties.length).toBe(2)
    expect(rootStore.parties[0].officer.lastName).toBe('Griffin')
    expect(rootStore.parties[1].officer.lastName).toBe('Swanson')
  })
})
describe('App as a COMPLETED Incorporation Application', () => {
  // Intermediate scenario - still using Temp Reg Number
  let wrapper: Wrapper<Vue>

  beforeAll(() => {
    // clear store
    rootStore.setNameRequest(null)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([])

    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', 'dummy-token')
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    vi.spyOn(utils, 'GetKeycloakRoles').mockImplementation(() => [AuthorizationRoles.PUBLIC_USER])

    // GET user info from Auth API
    get.withArgs('users/@me')
      .returns(new Promise(resolve => resolve({
        data: USER_INFO
      })))

    // GET NR data
    get.withArgs('nameRequests/NR 1234567/validate?phone=&email=')
      .returns(new Promise(resolve => resolve({
        data: {
          applicants: {},
          expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
          legalType: 'BEN',
          names: [
            {
              name: 'My Name Request',
              state: 'APPROVED'
            }
          ],
          nrNum: 'NR 1234567',
          request_action_cd: 'NEW',
          state: 'CONSUMED'
        }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise(resolve => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              availableOnPaperOnly: false,
              date: '2020-05-10T11:22:33.444444+00:00',
              effectiveDate: '2020-05-22T00:00:00.000000+00:00',
              filingId: 789,
              isFutureEffective: false,
              name: 'incorporationApplication',
              paymentToken: 987,
              status: 'COMPLETED',
              submitter: 'Submitter'
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'BEN'
              },
              offices: BCOMP_ADDRESSES,
              parties: BCOMP_PARTIES
            }
          },
          commentsCount: 0,
          commentsLink: 'http://comments',
          documentsLink: 'http://documents',
          filingLink: 'http://filing'
        }
      })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      localVue,
      router,
      vuetify
    })

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it.skip('fetches IA filing properly', () => {
    expect(businessStore.getIdentifier).toBe('T123456789')
    expect(businessStore.getLegalType).toBe('BEN')
    expect(businessStore.getLegalName).toBe('My Name Request')

    // spot check addresses and directors
    expect(rootStore.registeredAddress.mailingAddress.streetAddress).toBe('1012 Douglas St')
    expect(rootStore.recordsAddress.mailingAddress.streetAddress).toBe('220 Buchanan St')
    expect(rootStore.parties.length).toEqual(2)
    expect(rootStore.parties[0].officer.firstName).toBe('Griffin')
    expect(rootStore.parties[1].officer.organizationName).toBe('Test Inc')

    // verify loaded filing
    expect(filingHistoryListStore.filings.length).toBe(1)
    expect(filingHistoryListStore.filings[0].availableOnPaperOnly).toBe(false)
    expect(filingHistoryListStore.filings[0].businessIdentifier).toBe('T123456789')
    expect(filingHistoryListStore.filings[0].commentsCount).toBe(0)
    expect(filingHistoryListStore.filings[0].commentsLink).toBe('http://comments')
    expect(filingHistoryListStore.filings[0].displayName).toBe('Incorporation Application')
    expect(filingHistoryListStore.filings[0].documentsLink).toBe('http://documents')
    expect(filingHistoryListStore.filings[0].effectiveDate).toBe('Fri, 22 May 2020 00:00:00 GMT')
    expect(filingHistoryListStore.filings[0].filingId).toBe(789)
    expect(filingHistoryListStore.filings[0].filingLink).toBe('http://filing')
    expect(filingHistoryListStore.filings[0].isFutureEffective).toBe(false)
    expect(filingHistoryListStore.filings[0].name).toBe('incorporationApplication')
    expect(filingHistoryListStore.filings[0].status).toBe('COMPLETED')
    expect(filingHistoryListStore.filings[0].submittedDate).toBe('Sun, 10 May 2020 11:22:33 GMT')
    expect(filingHistoryListStore.filings[0].submitter).toBe('Submitter')
    expect(filingHistoryListStore.filings[0].data.applicationDate).toBe('2020-05-10')
    expect(filingHistoryListStore.filings[0].data.legalFilings).toEqual(['incorporationApplication'])
  })
})

describe('App as an historical business - Amalgamation', () => {
  let wrapper: Wrapper<Vue>

  beforeAll(() => {
    // clear store
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([])

    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', 'dummy-token')
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    const configuration = {
      'VUE_APP_LEGAL_API_URL': 'https://legal-api.url/',
      'VUE_APP_LEGAL_API_VERSION_2': 'v2',
      'VUE_APP_AUTH_API_GW_URL': 'https://auth-api-gw.url/',
      'VUE_APP_AUTH_API_VERSION': 'v1'
    }
    configurationStore.setConfiguration(configuration)
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    vi.spyOn(utils, 'GetKeycloakRoles').mockImplementation(() => [AuthorizationRoles.PUBLIC_USER])

    // GET user info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/users/@me')
      .returns(new Promise(resolve => resolve({
        data: USER_INFO
      })))

    // Get permissions from Legal API
    get.withArgs('https://legal-api.url/v2/permissions')
      .returns(Promise.resolve({
        data: {
          authorizedPermissions: [
            ...BusinessRegistryStaffActions
          ]
        }
      }))

    // GET entity info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/entities/BC1234567')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // Auth API Entity data
          contacts: [
            {
              email: 'first.last@email.com',
              phone: '(111)-222-3333',
              phoneExtension: '444'
            }
          ]
        }
      })))

    // GET business info from Legal API
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567')
      .returns(new Promise(resolve => resolve({
        data: {
          business: {
            amalgamatedInto: {
              amalgamationDate: '2023-12-01T08:00:00+00:00',
              amalgamationType: AmalgamationTypes.REGULAR,
              identifier: 'BC7654321',
              legalName: 'Amalgamated Business Name Ltd.'
            },
            foundingDate: '2021-12-02T20:15:00+00:00',
            goodStanding: true,
            hasRestrictions: false,
            identifier: 'BC1234567',
            lastAddressChangeDate: '2021-12-02',
            lastAnnualReportDate: '',
            lastDirectorChangeDate: '2021-12-02',
            legalName: 'HISTORICAL CORP.',
            legalType: 'BEN',
            nextAnnualReport: '2022-12-02T08:00:00+00:00',
            state: 'HISTORICAL',
            stateFiling: null,
            submitter: 'bcsc/pmd3qdz4hzr3hpwbm7jwufel6flpqtyj'
          }
        }
      })))

    // GET tasks
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // GET filings
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/filings')
      .returns(new Promise(resolve => resolve({ data: { filings: [] } })))

    // GET addresses
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/addresses')
      .returns(new Promise(resolve => resolve({ data: {} })))

    // GET directors
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/parties')
      .returns(new Promise(resolve => resolve({ data: { parties: [] } })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    wrapper = shallowMount(App, {
      localVue,
      router,
      vuetify
    })

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches and parses state filing properly', () => {
    expect(businessStore.isActive).toBe(false)
    expect(businessStore.isHistorical).toBe(true)
    expect(businessStore.isLiquidation).toBe(false)
    expect(rootStore.getReasonText).toBe('Amalgamation – December 1, 2023 – BC7654321')
  })
})

describe('App as an historical business - Voluntary Dissolution', () => {
  let wrapper: Wrapper<Vue>

  beforeAll(() => {
    // clear store
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([])

    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', 'dummy-token')
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    const configuration = {
      'VUE_APP_LEGAL_API_URL': 'https://legal-api.url/',
      'VUE_APP_LEGAL_API_VERSION_2': 'v2',
      'VUE_APP_AUTH_API_GW_URL': 'https://auth-api-gw.url/',
      'VUE_APP_AUTH_API_VERSION': 'v1'
    }
    configurationStore.setConfiguration(configuration)
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    vi.spyOn(utils, 'GetKeycloakRoles').mockImplementation(() => [AuthorizationRoles.STAFF])

    // GET user info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/users/@me')
      .returns(new Promise(resolve => resolve({
        data: USER_INFO
      })))

    // GET entity info from Auth API
    get.withArgs('https://auth-api-gw.url/v1/entities/BC1234567')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // Auth API Entity data
          contacts: [
            {
              email: 'first.last@email.com',
              phone: '(111)-222-3333',
              phoneExtension: '444'
            }
          ]
        }
      })))

    // Get permissions from Legal API
    get.withArgs('https://legal-api.url/v2/permissions')
      .returns(Promise.resolve({
        data: {
          authorizedPermissions: [
            ...BusinessRegistryStaffActions
          ]
        }
      }))

    // GET business info from Legal API
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567')
      .returns(new Promise(resolve => resolve({
        data: {
          business: {
            dissolutionDate: '2023-12-01',
            foundingDate: '2021-12-02T20:15:00+00:00',
            goodStanding: true,
            hasRestrictions: false,
            identifier: 'BC1234567',
            lastAddressChangeDate: '2021-12-02',
            lastAnnualReportDate: '',
            lastDirectorChangeDate: '2021-12-02',
            legalName: 'HISTORICAL CORP.',
            legalType: 'BEN',
            nextAnnualReport: '2022-12-02T08:00:00+00:00',
            state: 'HISTORICAL',
            stateFiling: 'businesses/BC1234567/filings/113526',
            submitter: 'bcsc/pmd3qdz4hzr3hpwbm7jwufel6flpqtyj'
          }
        }
      })))

    // GET tasks
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // GET filings
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/filings')
      .returns(new Promise(resolve => resolve({ data: { filings: [] } })))

    // GET state filing
    get.withArgs('businesses/BC1234567/filings/113526')
      .returns(new Promise(resolve => resolve({
        data: {
          filing: {
            business: {},
            dissolution: {
              dissolutionType: 'voluntary',
              dissolutionDate: '2023-12-01'
            },
            header: {
              effectiveDate: '2023-12-01T08:00:00+00:00',
              name: 'dissolution'
            }
          }
        }
      })))

    // GET addresses
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/addresses')
      .returns(new Promise(resolve => resolve({ data: {} })))

    // GET directors
    get.withArgs('https://legal-api.url/v2/businesses/BC1234567/parties')
      .returns(new Promise(resolve => resolve({ data: { parties: [] } })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    wrapper = shallowMount(App, {
      localVue,
      router,
      vuetify
    })

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches and parses state filing properly', () => {
    expect(businessStore.isActive).toBe(false)
    expect(businessStore.isHistorical).toBe(true)
    expect(businessStore.isLiquidation).toBe(false)
    expect(rootStore.getReasonText).toBe('Voluntary Dissolution – December 1, 2023')
  })
})
