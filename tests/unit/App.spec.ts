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
    }
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
    }
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

// we need a token that can get parsed properly (will be expired but doesn't matter for tests)
// must include keycloakRoles=["staff"]
const KEYCLOAK_TOKEN_STAFF = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3' +
  'FQbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiIzZDQ3YjgwYy01MTAzLTRjMTYtOGNhZC0yMjU4NDMwZGYwZTciLCJle' +
  'HAiOjE1Njg0ODk1NTksIm5iZiI6MCwiaWF0IjoxNTY4NDAzMTYwLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2' +
  'EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwicmVhbG0tbWFuYWdlbWVudCIsImJyb2tlciIsImFjY291bnQ' +
  'iXSwic3ViIjoiZDRjNTBiZTAtYWM2OC00MDIyLTkxMGQtMzE2NzQ4NGFkOWU0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2JjLWF1dGgtd2Vi' +
  'Iiwibm9uY2UiOiJkMjljZTZlNS0xNzZhLTRkMTUtODUzZS05NWUzZmUwZmYwZjgiLCJhdXRoX3RpbWUiOjE1Njg0MDMxNTksInNlc3Npb25fc' +
  '3RhdGUiOiJiOTEwMzQxZi0xNzVjLTRkMTktYWI1Yy1iM2QxNTBiYjk0NjYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly' +
  '8xOTIuMTY4LjAuMTM6ODA4MC8iLCIxOTIuMTY4LjAuMTMiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI' +
  '6eyJyb2xlcyI6WyJ2aWV3IiwiZWRpdCIsIm9mZmxpbmVfYWNjZXNzIiwic3RhZmYiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl19LCJy' +
  'ZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhb' +
  'G0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsInJlYWxtLWFkbWluIiwiY3JlYXRlLWNsaWVudCIsIm1hbm' +
  'FnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmF' +
  'nZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9y' +
  'aXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJicm9rZXIiOnsicm9sZXMiOlsicmVhZC10b2tlbiJdfSwiYWNjb' +
  '3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOi' +
  'JvcGVuaWQiLCJmaXJzdG5hbWUiOiJTdW1lc2giLCJyb2xlcyI6WyJ2aWV3IiwiZWRpdCIsIm9mZmxpbmVfYWNjZXNzIiwic3RhZmYiLCJ1bWF' +
  'fYXV0aG9yaXphdGlvbiIsImJhc2ljIl0sIm5hbWUiOiJTdW1lc2ggS2FyaXlpbCIsInByZWZlcnJlZF91c2VybmFtZSI6InNrYXJpeWlsQGlk' +
  'aXIiLCJlbWFpbCI6InN1bWVzaC5wLmthcml5aWxAZ292LmJjLmNhIiwibGFzdG5hbWUiOiJLYXJpeWlsIiwidXNlcm5hbWUiOiJza2FyaXlpb' +
  'EBpZGlyIn0.MSPSakOnCUia4qd-fUpvP2PB3k977Eyhjxn-ykjadsUTEK4f2R3c8vozxaIIMH0-qUwduyQmdZCl3tQnXYQ9Ttf1PE9eMLS4sX' +
  'JiIUlDmKZ2ow7GmmDabic8igHnEDYD6sI7OFYnCJhRdgVEHN-_4KUk2YsAVl5XUr6blJKMuYDPeMyNreGTXU7foE4AT-93FwlyTyFzQGddrDv' +
  'c6kkQr7mgJNTtgg87DdYbVGbEtIetyVfvwEF0rU8JH2N-j36XIebo33FU3-gJ5Y5S69EHPqQ37R9H4d8WUrHO-4QzJQih3Yaea820XBplJeo0' +
  'DO3hQoVtPD42j0p3aIy10cnW2g'

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

describe('App as a COOP', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', KEYCLOAK_TOKEN_STAFF)
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    // GET authorizations (role) from Auth API
    get.withArgs('entities/CP0001191/authorizations')
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

    // GET entity info from Auth API
    get.withArgs('entities/CP0001191')
      .returns(new Promise((resolve) => resolve({
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
    get.withArgs('businesses/CP0001191')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          // Legal API Business data
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
    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise((resolve) => resolve({
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
    get.withArgs('businesses/CP0001191/filings')
      .returns(new Promise((resolve) => resolve({
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
    get.withArgs('businesses/CP0001191/addresses')
      .returns(new Promise((resolve) => resolve({
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

    // GET directors
    get.withArgs('businesses/CP0001191/directors')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          directors: [
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
              }
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
              }
            }
          ]
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
      vuetify
    })
    vm = wrapper.vm

    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('gets Keycloak Roles and Auth Roles properly', () => {
    expect(vm.$store.getters.isRoleStaff).toBe(true)
    expect(vm.$store.getters.isRoleEdit).toBe(true)
    expect(vm.$store.getters.isRoleView).toBe(true)
  })

  it('fetches Business Info properly', () => {
    expect(vm.$store.state.businessEmail).toEqual('name@mail.com')
    expect(vm.$store.state.businessPhone).toEqual('(111)-222-3333')
    expect(vm.$store.state.businessPhoneExtension).toEqual('999')
  })

  it('initializes Current Date properly', () => {
    const dateString = vm.dateToYyyyMmDd(new Date())
    expect(vm.$store.getters.getCurrentDate).toEqual(dateString)
  })

  it('fetches Entity Info properly', () => {
    expect(vm.$store.getters.getEntityName).toBe('TEST NAME')
    expect(vm.$store.getters.getEntityStatus).toBe('GOODSTANDING')
    expect(vm.$store.state.entityBusinessNo).toBe('123456789')
    expect(vm.$store.getters.getEntityIncNo).toBe('CP0001191')
    const entityFoundingDate = vm.apiToDate('2000-07-13T00:00:00+00:00')
    expect(vm.$store.state.entityFoundingDate).toEqual(entityFoundingDate)
  })

  it('fetches Tasks properly', () => {
    expect(vm.$store.state.tasks.length).toBe(3)
    expect(vm.$store.state.tasks[0].task.todo.header.ARFilingYear).toBe(2017)
    expect(vm.$store.state.tasks[1].task.todo.header.ARFilingYear).toBe(2018)
    expect(vm.$store.state.tasks[2].task.todo.header.ARFilingYear).toBe(2019)
  })

  it('fetches Filings properly', () => {
    expect(vm.$store.state.filings.length).toBe(3)
    expect(vm.$store.state.filings[0].name).toBe('annualReport')
    expect(vm.$store.state.filings[1].name).toBe('changeOfDirectors')
    expect(vm.$store.state.filings[2].name).toBe('changeOfAddress')
  })

  it('fetches Addresses properly', () => {
    expect(vm.$store.state.registeredAddress.mailingAddress.addressCity).toBe('Victoria')
    expect(vm.$store.state.registeredAddress.deliveryAddress.addressCity).toBe('Glasgow')

    // These values have been assigned in the mockResponse but are expected to be filtered out by front-end logic.
    expect(vm.$store.state.registeredAddress.addressType).toBeUndefined()
  })

  it('fetches Directors properly', () => {
    expect(vm.$store.state.directors.length).toBe(2)
    expect(vm.$store.state.directors[0].officer.lastName).toBe('Griffin')
    expect(vm.$store.state.directors[1].officer.lastName).toBe('Swanson')
  })
})

describe('App as a BCOMP', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('KEYCLOAK_TOKEN', KEYCLOAK_TOKEN_USER)
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
  })

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')

    // GET authorizations (role) from Auth API
    get.withArgs('entities/BC0007291/authorizations')
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

    // GET entity info from Auth API
    get.withArgs('entities/BC0007291')
      .returns(new Promise((resolve) => resolve({
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
    get.withArgs('businesses/BC0007291')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          // Legal API Business data
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
    get.withArgs('businesses/BC0007291/tasks')
      .returns(new Promise((resolve) => resolve({
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
    get.withArgs('businesses/BC0007291/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filings: [
            {
              availableOnPaperOnly: false,
              businessIdentifier: 'BC0007291',
              commentsCount: 0,
              displayName: 'Annual Report (2019)',
              effectiveDate: 'Wed, 2 Jan 2019 12:00:00 GMT',
              filindId: 111,
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
              filindId: 222,
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
              filindId: 333,
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
    get.withArgs('businesses/BC0007291/addresses')
      .returns(new Promise((resolve) => resolve({
        data: BCOMP_ADDRESSES
      })))

    // GET directors
    get.withArgs('businesses/BC0007291/directors')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          directors: BCOMP_DIRECTORS
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

    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('gets Keycloak Roles and Auth Roles properly', () => {
    expect(vm.$store.getters.isRoleStaff).toBe(false)
    expect(vm.$store.getters.isRoleEdit).toBe(true)
    expect(vm.$store.getters.isRoleView).toBe(true)
  })

  it('fetches Business Info properly', () => {
    expect(vm.$store.state.businessEmail).toEqual('name@mail.com')
    expect(vm.$store.state.businessPhone).toEqual('(111)-222-3333')
    expect(vm.$store.state.businessPhoneExtension).toEqual('999')
  })

  it('initializes Current Date properly', () => {
    const dateString = vm.dateToYyyyMmDd(new Date())
    expect(vm.$store.getters.getCurrentDate).toEqual(dateString)
  })

  it('fetches Entity Info properly', () => {
    expect(vm.$store.getters.getEntityName).toBe('TEST NAME')
    expect(vm.$store.getters.getEntityStatus).toBe('GOODSTANDING')
    expect(vm.$store.state.entityBusinessNo).toBe('123456789')
    expect(vm.$store.getters.getEntityIncNo).toBe('BC0007291')
    const entityFoundingDate = vm.apiToDate('2000-07-13T00:00:00+00:00')
    expect(vm.$store.state.entityFoundingDate).toEqual(entityFoundingDate)
  })

  it('fetches Tasks properly', () => {
    expect(vm.$store.state.tasks.length).toBe(3)
    expect(vm.$store.state.tasks[0].task.todo.header.ARFilingYear).toBe(2017)
    expect(vm.$store.state.tasks[1].task.todo.header.ARFilingYear).toBe(2018)
    expect(vm.$store.state.tasks[2].task.todo.header.ARFilingYear).toBe(2019)
  })

  it('fetches Filings properly', () => {
    expect(vm.$store.state.filings.length).toBe(3)
    expect(vm.$store.state.filings[0].name).toBe('annualReport')
    expect(vm.$store.state.filings[1].name).toBe('changeOfDirectors')
    expect(vm.$store.state.filings[2].name).toBe('changeOfAddress')
  })

  it('fetches Addresses properly', () => {
    expect(vm.$store.state.registeredAddress.mailingAddress.addressCity).toBe('Victoria')
    expect(vm.$store.state.registeredAddress.deliveryAddress.addressCity).toBe('Glasgow')

    expect(vm.$store.state.recordsAddress.mailingAddress.addressCity).toBe('Glasgow')
    expect(vm.$store.state.recordsAddress.deliveryAddress.addressCity).toBe('Victoria')

    // These values have been assigned in the mockResponse but are expected to be filtered out by front-end logic.
    expect(vm.$store.state.registeredAddress.addressType).toBeUndefined()
    expect(vm.$store.state.recordsAddress.addressType).toBeUndefined()
  })

  it('fetches Directors properly', () => {
    expect(vm.$store.state.directors.length).toBe(2)
    expect(vm.$store.state.directors[0].officer.lastName).toBe('Griffin')
    expect(vm.$store.state.directors[1].officer.lastName).toBe('Swanson')
  })
})

describe('App as a Draft IA with approved NR', () => {
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
          legalType: 'BEN',
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
              legalType: 'BEN'
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'BEN'
              }
            }
          }
        }
      })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

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

  it('fetches IA filing properly', () => {
    expect(vm.$store.getters.getEntityIncNo).toBe('T123456789')
    expect(vm.$store.getters.getEntityType).toBe('BEN')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
    expect(vm.$store.getters.getEntityStatus).toBe('DRAFT_INCORP_APP')

    // verify loaded task
    expect(vm.$store.state.tasks.length).toBe(1)
    expect(vm.$store.state.tasks[0].enabled).toBe(true)
    expect(vm.$store.state.tasks[0].order).toBe(1)
    expect(vm.$store.state.tasks[0].task.filing.business.identifier).toBe('T123456789')
    expect(vm.$store.state.tasks[0].task.filing.business.legalType).toBe('BEN')
    expect(vm.$store.state.tasks[0].task.filing.header.date).toBe('2020-05-21T00:11:55.887740+00:00')
    expect(vm.$store.state.tasks[0].task.filing.header.name).toBe('incorporationApplication')
    expect(vm.$store.state.tasks[0].task.filing.header.status).toBe('DRAFT')
    expect(vm.$store.state.tasks[0].task.filing.header.filingId).toBe(789)
    expect(vm.$store.state.tasks[0].task.filing.incorporationApplication.nameRequest.nrNumber).toBe('NR 1234567')
    expect(vm.$store.state.tasks[0].task.filing.incorporationApplication.nameRequest.legalType).toBe('BEN')
  })
})

describe('App as a Draft IA with conditional-not required NR', () => {
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
          consentFlag: null, // not required
          expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
          names: [
            {
              name: 'My Conditional NR With Consent Not Required',
              state: 'CONDITION',
              consumptionDate: null
            }
          ],
          nrNumber: 'NR 1234567',
          legalType: 'BEN',
          state: 'CONDITIONAL'
        }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'BEN'
              }
            }
          }
        }
      })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches conditional-not required NR data properly', () => {
    expect(vm.$store.getters.getNrNumber).toBe('NR 1234567')
    expect(vm.$store.getters.getEntityName).toBe('My Conditional NR With Consent Not Required')
  })
})

describe('App as a Draft IA with conditional-received NR', () => {
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
          consentFlag: 'R', // received
          expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
          names: [
            {
              name: 'My Conditional NR With Consent Received',
              state: 'CONDITION',
              consumptionDate: null
            }
          ],
          nrNumber: 'NR 1234567',
          legalType: 'BEN',
          state: 'CONDITIONAL'
        }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'BEN'
              }
            }
          }
        }
      })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches conditional-received NR data properly', () => {
    expect(vm.$store.getters.getNrNumber).toBe('NR 1234567')
    expect(vm.$store.getters.getEntityName).toBe('My Conditional NR With Consent Received')
  })
})

describe('App as a Draft IA with conditional-waived NR', () => {
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
          consentFlag: 'N', // waived
          expirationDate: 'Thu, 31 Dec 2099 23:59:59 GMT',
          names: [
            {
              name: 'My Conditional NR With Consent Waived',
              state: 'CONDITION',
              consumptionDate: null
            }
          ],
          nrNumber: 'NR 1234567',
          legalType: 'BEN',
          state: 'CONDITIONAL'
        }
      })))

    // GET IA filing
    get.withArgs('businesses/T123456789/filings')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567',
                legalType: 'BEN'
              }
            }
          }
        }
      })))

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    wrapper = shallowMount(App, {
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

    await flushPromises()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches conditional-waived NR data properly', () => {
    expect(vm.$store.getters.getNrNumber).toBe('NR 1234567')
    expect(vm.$store.getters.getEntityName).toBe('My Conditional NR With Consent Waived')
  })
})

describe('App as a PAID (pending) Incorporation Application', () => {
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
          legalType: 'BEN',
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
              legalType: 'BEN'
            },
            header: {
              availableOnPaperOnly: false,
              date: '2020-05-10T11:22:33.444444+00:00',
              effectiveDate: '2020-05-22T00:00:00.000000+00:00',
              filingId: 789,
              isFutureEffective: true,
              name: 'incorporationApplication',
              paymentToken: 987,
              status: 'PAID',
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
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

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

  it('fetches IA filing properly', () => {
    expect(vm.$store.getters.getEntityIncNo).toBe('T123456789')
    expect(vm.$store.getters.getEntityType).toBe('BEN')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
    expect(vm.$store.getters.getEntityStatus).toBe('FILED_INCORP_APP')

    // spot check addresses and directors
    expect(vm.$store.state.registeredAddress.mailingAddress.streetAddress).toBe('1012 Douglas St')
    expect(vm.$store.state.recordsAddress.mailingAddress.streetAddress).toBe('220 Buchanan St')
    expect(vm.$store.state.directors[0].officer.firstName).toBe('Griffin')
    expect(vm.$store.state.directors[0].officer.lastName).toBe('Swanson')
    expect(vm.$store.state.directors.length).toEqual(1)

    // verify loaded filing
    expect(vm.$store.state.filings.length).toBe(1)
    expect(vm.$store.state.filings[0].availableOnPaperOnly).toBe(false)
    expect(vm.$store.state.filings[0].businessIdentifier).toBe('T123456789')
    expect(vm.$store.state.filings[0].commentsCount).toBe(0)
    expect(vm.$store.state.filings[0].commentsLink).toBe('http://comments')
    expect(vm.$store.state.filings[0].displayName).toBe('Incorporation Application')
    expect(vm.$store.state.filings[0].documentsLink).toBe('http://documents')
    expect(vm.$store.state.filings[0].effectiveDate).toBe('Fri, 22 May 2020 00:00:00 GMT')
    expect(vm.$store.state.filings[0].filingId).toBe(789)
    expect(vm.$store.state.filings[0].filingLink).toBe('http://filing')
    expect(vm.$store.state.filings[0].isFutureEffective).toBe(true)
    expect(vm.$store.state.filings[0].name).toBe('incorporationApplication')
    expect(vm.$store.state.filings[0].status).toBe('PAID')
    expect(vm.$store.state.filings[0].submittedDate).toBe('Sun, 10 May 2020 11:22:33 GMT')
    expect(vm.$store.state.filings[0].submitter).toBe('Submitter')
    expect(vm.$store.state.filings[0].data.applicationDate).toBe('2020-05-10')
    expect(vm.$store.state.filings[0].data.legalFilings).toEqual(['incorporationApplication'])
  })
})

describe('App as a COMPLETED Incorporation Application', () => {
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
          legalType: 'BEN',
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
      sync: false,
      localVue,
      router,
      store,
      vuetify
    })
    vm = wrapper.vm

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

  it('fetches IA filing properly', () => {
    expect(vm.$store.getters.getEntityIncNo).toBe('T123456789')
    expect(vm.$store.getters.getEntityType).toBe('BEN')
    expect(vm.$store.getters.getEntityName).toBe('My Name Request')
    expect(vm.$store.getters.getEntityStatus).toBe('FILED_INCORP_APP')

    // spot check addresses and directors
    expect(vm.$store.state.registeredAddress.mailingAddress.streetAddress).toBe('1012 Douglas St')
    expect(vm.$store.state.recordsAddress.mailingAddress.streetAddress).toBe('220 Buchanan St')
    expect(vm.$store.state.directors[0].officer.firstName).toBe('Griffin')
    expect(vm.$store.state.directors[0].officer.lastName).toBe('Swanson')
    expect(vm.$store.state.directors.length).toEqual(1)

    // verify loaded filing
    expect(vm.$store.state.filings.length).toBe(1)
    expect(vm.$store.state.filings[0].availableOnPaperOnly).toBe(false)
    expect(vm.$store.state.filings[0].businessIdentifier).toBe('T123456789')
    expect(vm.$store.state.filings[0].commentsCount).toBe(0)
    expect(vm.$store.state.filings[0].commentsLink).toBe('http://comments')
    expect(vm.$store.state.filings[0].displayName).toBe('Incorporation Application')
    expect(vm.$store.state.filings[0].documentsLink).toBe('http://documents')
    expect(vm.$store.state.filings[0].effectiveDate).toBe('Fri, 22 May 2020 00:00:00 GMT')
    expect(vm.$store.state.filings[0].filingId).toBe(789)
    expect(vm.$store.state.filings[0].filingLink).toBe('http://filing')
    expect(vm.$store.state.filings[0].isFutureEffective).toBe(false)
    expect(vm.$store.state.filings[0].name).toBe('incorporationApplication')
    expect(vm.$store.state.filings[0].status).toBe('COMPLETED')
    expect(vm.$store.state.filings[0].submittedDate).toBe('Sun, 10 May 2020 11:22:33 GMT')
    expect(vm.$store.state.filings[0].submitter).toBe('Submitter')
    expect(vm.$store.state.filings[0].data.applicationDate).toBe('2020-05-10')
    expect(vm.$store.state.filings[0].data.legalFilings).toEqual(['incorporationApplication'])
  })
})
