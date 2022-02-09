import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import App from '@/App.vue'

// mock fetch() as it is not defined in Jest
// NB: it should be `global.fetch` but that doesn't work and this does
window.fetch = jest.fn().mockImplementation(() => {
  return {
    headers: { get: () => new Date() },
    ok: true,
    statusTxt: ''
  }
})

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

const FIRM_ADDRESSES = {
  businessAddress: {
    deliveryAddress: {
      streetAddress: 'delivery_address - address line one',
      addressCity: 'delivery_address city',
      addressCountry: 'Canada',
      postalCode: 'H0H0H0',
      addressRegion: 'BC'
    },
    mailingAddress: {
      streetAddress: 'mailing_address - address line one',
      addressCity: 'mailing_address city',
      addressCountry: 'Canada',
      postalCode: 'H0H0H0',
      addressRegion: 'BC'
    }
  }
}

const FIRM_PARTIES = [
  {
    officer: {
      id: 1,
      firstName: 'Joe',
      lastName: 'Swanson',
      middleName: 'P',
      email: 'joe@email.com',
      organizationName: '',
      partyType: 'person'
    },
    mailingAddress: {
      streetAddress: 'mailing_address - address line one',
      addressCity: 'mailing_address city',
      addressCountry: 'Canada',
      postalCode: 'H0H0H0',
      addressRegion: 'BC'
    },
    deliveryAddress: {
      streetAddress: 'delivery_address - address line one',
      addressCity: 'delivery_address city',
      addressCountry: 'Canada',
      postalCode: 'H0H0H0',
      addressRegion: 'BC'
    },
    roles: [
      {
        roleTyp: 'Completing Party',
        appointmentDate: '2022-01-01'

      },
      {
        roleType: 'Partner',
        appointmentDate: '2022-01-01'

      }
    ]
  },
  {
    officer: {
      id: 2,
      firstName: 'Peter',
      lastName: 'Griffin',
      middleName: '',
      partyType: 'person'
    },
    mailingAddress: {
      streetAddress: 'mailing_address - address line one',
      streetAddressAdditional: '',
      addressCity: 'mailing_address city',
      addressCountry: 'CA',
      postalCode: 'H0H0H0',
      addressRegion: 'BC'
    },
    roles: [
      {
        roleType: 'Partner',
        appointmentDate: '2022-01-01'
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

// we need a token that can get parsed properly (will be expired but doesn't matter for tests)
// must NOT include staff role
const KEYCLOAK_TOKEN_USER = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3F' +
  'QbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiI0MmMzOWQzYi1iMTZkLTRiYWMtOWU1Ny1hNDYyZjQ3NWY0M2UiLCJleHAiO' +
  'jE1NzUwNzI4MTEsIm5iZiI6MCwiaWF0IjoxNTc1MDQ0MDExLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV' +
  '0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwiYWNjb3VudCJdLCJzdWIiOiI4ZTVkZDYzNS01OGRkLTQ5YzUtYmViM' +
  'S00NmE1ZDVhMTYzNWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzYmMtYXV0aC13ZWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI' +
  '5OGQ3Y2Y2Zi0xYTQ1LTQzMzUtYWU0OC02YzBiNTdlMGYwNTAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly8xOTIuMTY4L' +
  'jAuMTM6ODA4MC8iLCIxOTIuMTY4LjAuMTMiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI' +
  '6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3Vud' +
  'CI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJ' +
  'yb2xlcyI6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl0sInByZWZlcnJlZF91c2VybmFtZSI6I' +
  'mJjMDAwNzI5MSIsImxvZ2luU291cmNlIjoiUEFTU0NPREUiLCJ1c2VybmFtZSI6ImJjMDAwNzI5MSJ9.GYKmp5SQxZYTEkltSgaM3LMNcmuo_n' +
  'b88wrYb6LbRk1BtCC0wU6Uu5zij_6mwXKyJ3dQ0L2EWR0eEqDuKzjWKVkIvQujXKzc8H9PPYPhgRqwdDr2qOglJrT2lJTkGZvPPqI217J2iiVW' +
  'OutPePeAmozIQhmf5jlZBW_J8qSzx9GmkQvT41hxpNLkaMPjPYVM2Iy6vL4Pnu0Xma-wCN1GCPwvJGQXCuh3IsR_iTMoig8qcFS0a0lUTx_cCj' +
  'G-zf_goG4vDTeKn6Mk50FToRtYGXkzWdfQn1T_yeS_2zrL8Ifg1QhJe74U_w40v4ikAFl-BofYnIRjopP57H-5g9_SGg'

describe('App as a Draft Registration with approved NR', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    // clear store
    store.state.tasks = []
    store.state.filings = []

    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', KEYCLOAK_TOKEN_USER)
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    // GET authorizations (role) from Auth API
    get.withArgs('entities/T123456789/authorizations')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            roles: ['edit', 'view']
          }
      })))

    // GET user info from Auth API
    get.withArgs('users/@me')
      .returns(new Promise((resolve) => resolve({
        data: USER_INFO
      })))

    // GET NR data
    get.withArgs('nameRequests/NR 1234567')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
            names: [
              {
                name: 'My Name Request',
                state: 'APPROVED',
                consumptionDate: null
              }
            ],
            nrNumber: 'NR 1234567',
            legalType: 'SP',
            state: 'APPROVED'
          }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'SP'
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'registration',
              status: 'DRAFT',
              filingId: 789
            },
            registration: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'SP'
              }
            }
          }
        }
      })))

    // create a Local Vue and install router (and store) on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      localVue,
      router,
      store,
      vuetify,
      destroyed () {
        get()
      }
    })
    vm = wrapper.vm

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches approved NR data properly', () => {
    expect(vm.$store.getters.getNrNumber).toBe('NR 1234567')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
  })

  it('fetches Registration filing properly', () => {
    expect(vm.$store.getters.getIdentifier).toBe('T123456789')
    expect(vm.$store.getters.getEntityType).toBe('SP')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
    expect(vm.$store.getters.isAppTask).toBe(true)

    // verify loaded task
    expect(vm.$store.state.tasks.length).toBe(1)
    expect(vm.$store.state.tasks[0].enabled).toBe(true)
    expect(vm.$store.state.tasks[0].order).toBe(1)
    expect(vm.$store.state.tasks[0].task.filing.business.identifier).toBe('T123456789')
    expect(vm.$store.state.tasks[0].task.filing.business.legalType).toBe('SP')
    expect(vm.$store.state.tasks[0].task.filing.header.date).toBe('2020-05-21T00:11:55.887740+00:00')
    expect(vm.$store.state.tasks[0].task.filing.header.name).toBe('registration')
    expect(vm.$store.state.tasks[0].task.filing.header.status).toBe('DRAFT')
    expect(vm.$store.state.tasks[0].task.filing.header.filingId).toBe(789)
    expect(vm.$store.state.tasks[0].task.filing.registration.nameRequest.nrNumber).toBe('NR 1234567')
    expect(vm.$store.state.tasks[0].task.filing.registration.nameRequest.legalType).toBe('SP')
  })
})

describe('App as a COMPLETED Registration Application', () => {
  // Intermediate scenario - While returning from payment completion page
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    // clear store
    store.state.tasks = []
    store.state.filings = []

    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', KEYCLOAK_TOKEN_USER)
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    // GET authorizations (role) from Auth API
    get.withArgs('entities/T123456789/authorizations')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            roles: ['edit', 'view']
          }
      })))

    // GET user info from Auth API
    get.withArgs('users/@me')
      .returns(new Promise((resolve) => resolve({
        data: USER_INFO
      })))

    // GET NR data
    get.withArgs('nameRequests/NR 1234567')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
            names: [
              {
                name: 'My Name Request',
                state: 'APPROVED',
                consumptionDate: '2099-10-30T00:11:55.887740+00:00'
              }
            ],
            nrNumber: 'NR 1234567',
            legalType: 'SP',
            state: 'CONSUMED'
          }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'SP'
            },
            header: {
              availableOnPaperOnly: false,
              date: '2020-05-10T11:22:33.444444+00:00',
              effectiveDate: '2020-05-22T00:00:00.000000+00:00',
              filingId: 789,
              isFutureEffective: false,
              name: 'registration',
              paymentToken: 987,
              status: 'COMPLETED',
              submitter: 'Submitter'
            },
            registration: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'SP'
              },
              offices: FIRM_ADDRESSES,
              parties: FIRM_PARTIES
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
      store,
      vuetify,
      destroyed () {
        get()
      }
    })
    vm = wrapper.vm

    // wait for everything to settle
    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches NR data properly', () => {
    expect(vm.$store.getters.getNrNumber).toBe('NR 1234567')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
  })

  it('fetches Registration filing properly', () => {
    expect(vm.$store.getters.getIdentifier).toBe('T123456789')
    expect(vm.$store.getters.getEntityType).toBe('SP')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
    expect(vm.$store.getters.isAppFiling).toBe(true)

    // verify loaded filing
    expect(vm.$store.state.filings.length).toBe(1)
    expect(vm.$store.state.filings[0].availableOnPaperOnly).toBe(false)
    expect(vm.$store.state.filings[0].businessIdentifier).toBe('T123456789')
    expect(vm.$store.state.filings[0].commentsCount).toBe(0)
    expect(vm.$store.state.filings[0].commentsLink).toBe('http://comments')
    expect(vm.$store.state.filings[0].displayName).toBe('Registration')
    expect(vm.$store.state.filings[0].documentsLink).toBe('http://documents')
    expect(vm.$store.state.filings[0].effectiveDate).toBe('Fri, 22 May 2020 00:00:00 GMT')
    expect(vm.$store.state.filings[0].filingId).toBe(789)
    expect(vm.$store.state.filings[0].filingLink).toBe('http://filing')
    expect(vm.$store.state.filings[0].isFutureEffective).toBe(false)
    expect(vm.$store.state.filings[0].name).toBe('registration')
    expect(vm.$store.state.filings[0].status).toBe('COMPLETED')
    expect(vm.$store.state.filings[0].submittedDate).toBe('Sun, 10 May 2020 11:22:33 GMT')
    expect(vm.$store.state.filings[0].submitter).toBe('Submitter')
    expect(vm.$store.state.filings[0].data.applicationDate).toBe('2020-05-10')
    expect(vm.$store.state.filings[0].data.legalFilings).toEqual(['registration'])
  })
})
