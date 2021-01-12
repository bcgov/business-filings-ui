/* eslint promise/param-names: 0, prefer-promise-reject-errors: 0 */
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import sinon from 'sinon'
import { createLocalVue, shallowMount, mount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import CodDate from '@/components/StandaloneDirectorChange/CODDate.vue'
import Directors from '@/components/common/Directors.vue'
import { Certify, StaffPayment } from '@/components/common'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import StandaloneDirectorsFiling from '@/views/StandaloneDirectorsFiling.vue'
import VueRouter from 'vue-router'
import mockRouter from './mockRouter'
import { configJson } from '@/resources/business-config'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

const sampleDirectors = [
  {
    'actions': [],
    'officer': {
      'firstName': 'Peter',
      'middleInitial': null,
      'lastName': 'Griffin'
    },
    'deliveryAddress': {
      'streetAddress': 'Peter Griffin delivery street address',
      'streetAddressAdditional': null,
      'addressCity': 'deliv address city',
      'addressCountry': 'deliv country',
      'postalCode': 'H0H0H0',
      'addressRegion': 'BC',
      'deliveryInstructions': null
    },
    'title': null,
    'appointmentDate': '2015-10-11',
    'cessationDate': null
  },
  {
    'actions': ['ceased', 'nameChanged'],
    'officer': {
      'firstName': 'Joe',
      'middleInitial': 'P',
      'lastName': 'Swanson'
    },
    'deliveryAddress': {
      'streetAddress': 'Joe Swanson delivery street address',
      'streetAddressAdditional': 'Kirkintiloch',
      'addressCity': 'Glasgow',
      'addressCountry': 'UK',
      'postalCode': 'H0H 0H0',
      'addressRegion': 'Scotland',
      'deliveryInstructions': 'go to the back'
    },
    'title': 'Treasurer',
    'appointmentDate': '2015-10-11',
    'cessationDate': '2019-07-22'
  }
]

describe('Standalone Directors Filing - Part 1 - UI', () => {
  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.currentDate = '2019-07-15'
    // set Last Filing Date and verify new Min Date
    store.state.entityFoundingDate = '2018-03-01T00:00:00'
  })

  it('renders the filing sub-components properly', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })

    expect(wrapper.find(CodDate).exists()).toBe(true)
    expect(wrapper.find(Directors).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)
    expect(wrapper.find(StaffPayment).exists()).toBe(false) // normally not rendered

    wrapper.destroy()
  })

  it('renders the Staff Payment sub-component properly', () => {
    // init store
    store.state.keycloakRoles = ['staff']

    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })

    // component should be displayed
    expect(wrapper.find(StaffPayment).exists()).toBe(true)

    // reset store
    // NB: this is important for subsequent tests
    store.state.keycloakRoles = []

    wrapper.destroy()
  })

  it('enables Validated flag when sub-component flags are valid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when COD Date component is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = false
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Directors component is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = true
    vm.directorFormValid = false
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('Verify COD Certify contains correct section codes', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    store.state.entityType = 'CP'
    store.state.configObject = configJson.find(x => x.entityType === store.state.entityType)
    expect(wrapper.find(Certify).exists()).toBe(true)
    const certify: any = wrapper.find(Certify)

    expect(certify.vm.message).toContain('See Section 78 of the Cooperative Association Act.')
    expect(certify.vm.entityDisplay).toEqual('Cooperative')

    wrapper.destroy()
  })

  it('disables Validated flag when Certify component is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = false
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Staff Payment data is required but not provided', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // set properties to make only staff payment invalid
    store.state.keycloakRoles = ['staff']
    vm.totalFee = 1
    vm.staffPaymentFormValid = false

    // confirm that form is invalid
    expect(vm.validated).toEqual(false)

    // toggle keycloak role to make payment valid
    store.state.keycloakRoles = []
    expect(vm.validated).toEqual(true)
    store.state.keycloakRoles = ['staff']

    // toggle total fee to make payment valid
    vm.totalFee = 0
    expect(vm.validated).toEqual(true)
    vm.totalFee = 1

    // toggle staff payment form valid to make payment valid
    vm.staffPaymentFormValid = true
    expect(vm.validated).toEqual(true)
    vm.staffPaymentFormValid = false

    // we should be back where we started
    expect(vm.validated).toEqual(false)

    // reset store
    // NB: this is important for subsequent tests
    store.state.keycloakRoles = []

    wrapper.destroy()
  })

  it('disables Validated flag when no filing changes were made (ie: nothing to file)', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [] // no data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('enables File & Pay button when Validated is true', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = mount(StandaloneDirectorsFiling, {
      store,
      mocks: { $route },
      stubs: {
        CodDate: true,
        Directors: true,
        Certify: true,
        StaffPayment: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })
    const vm: any = wrapper.vm

    // set properties
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that button is enabled
    expect(wrapper.find('#cod-file-pay-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when Validated is false', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = mount(StandaloneDirectorsFiling, {
      store,
      mocks: { $route },
      stubs: {
        CodDate: true,
        Directors: true,
        Certify: true,
        StaffPayment: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })
    const vm: any = wrapper.vm

    // set properties
    vm.inFilingReview = true
    vm.codDateValid = false
    vm.directorFormValid = false
    vm.staffPaymentFormValid = false
    vm.certifyFormValid = false
    store.state.filingData = [] // no data

    // confirm that button is disabled
    expect(wrapper.find('#cod-file-pay-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 2A - Resuming with FAS staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          filing: {
            changeOfDirectors: {
              directors: sampleDirectors
            },
            business: {
              cacheId: 1,
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfDirectors',
              date: '2017-06-06T00:00:00+00:00',
              effectiveDate: 'Tue, 06 Jun 2017 18:49:44 GMT',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
              routingSlipNumber: '123456789',
              priority: true
            }
          }
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft Standalone Directors filing with FAS staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that FAS data was restored
    expect(vm.staffPaymentData.option).toBe(1) // FAS
    expect(vm.staffPaymentData.routingSlipNumber).toBe('123456789')
    expect(vm.staffPaymentData.isPriority).toBe(true)

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    wrapper.destroy()
  })

  it('updates filing data properly', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // add Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(true)
    vm.directorsFreeChange(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(true)

    // remove Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(false)
    vm.directorsFreeChange(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(false)

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 2B - Resuming with BCOL staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          filing: {
            changeOfDirectors: {
              directors: sampleDirectors
            },
            business: {
              cacheId: 1,
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfDirectors',
              date: '2017-06-06T00:00:00+00:00',
              effectiveDate: 'Tue, 06 Jun 2017 18:49:44 GMT',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
              bcolAccountNumber: '123456',
              datNumber: 'C1234567',
              folioNumber: '123ABCabc',
              priority: true
            }
          }
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft Standalone Directors filing with BCOL staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that BCOL data was restored
    expect(vm.staffPaymentData.option).toBe(2) // BCOL
    expect(vm.staffPaymentData.bcolAccountNumber).toBe('123456')
    expect(vm.staffPaymentData.datNumber).toBe('C1234567')
    expect(vm.staffPaymentData.folioNumber).toBe('123ABCabc')
    expect(vm.staffPaymentData.isPriority).toBe(true)

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    wrapper.destroy()
  })

  it('updates filing data properly', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // add Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(true)
    vm.directorsFreeChange(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(true)

    // remove Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(false)
    vm.directorsFreeChange(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(false)

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 2C - Resuming with No Fee staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          filing: {
            changeOfDirectors: {
              directors: sampleDirectors
            },
            business: {
              cacheId: 1,
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfDirectors',
              date: '2017-06-06T00:00:00+00:00',
              effectiveDate: 'Tue, 06 Jun 2017 18:49:44 GMT',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
              waiveFees: true
            }
          }
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft Standalone Directors filing with No Fee staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that No Fee data was restored
    expect(vm.staffPaymentData.option).toBe(0) // NO_FEE
    expect(vm.staffPaymentData.isPriority).toBeFalsy()

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    wrapper.destroy()
  })

  it('updates filing data properly', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // add Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(true)
    vm.directorsFreeChange(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(true)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(true)

    // remove Paid and Free changes
    // (Directors component normally emits events to call these)
    vm.directorsPaidChange(false)
    vm.directorsFreeChange(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTCDR')).toBe(false)
    expect(vm.filingData.some(el => el.filingTypeCode === 'OTFDR')).toBe(false)

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 3A - Submitting filing that needs to be paid', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'
    store.state.entityFoundingDate = '2000-01-01'

    const get = sinon.stub(axios, 'get')

    // mock "fetch a draft filing" endpoint
    get.withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      })))

    // mock "fetch tasks" endpoint
    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'tasks': [
            {
              'task': {
                'filing': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2017,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': true,
              'order': 1
            }
          ]
        }
      })))

    // mock "save and file" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfDirectors',
              date: '2017-06-06T00:00:00+00:00',
              effectiveDate: 'Tue, 06 Jun 2017 18:49:44 GMT',
              submitter: 'cp0001191',
              status: 'PENDING',
              filingId: 123,
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              paymentToken: '321',
              isPaymentActionRequired: true
            }
          }
        }
      })))

    // mock "update and file" endpoint
    sinon.stub(axios, 'put').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfDirectors',
              date: '2017-06-06T00:00:00+00:00',
              effectiveDate: 'Tue, 06 Jun 2017 18:49:44 GMT',
              submitter: 'cp0001191',
              status: 'PENDING',
              filingId: 123,
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              paymentToken: '321',
              isPaymentActionRequired: false
            }
          }
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('saves a new filing and redirects to Pay URL when this is a new filing and the File & Pay button ' +
    'is clicked - as a COOP', async () => {
    // init store
    store.state.entityType = 'CP'

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = mount(StandaloneDirectorsFiling, {
      sync: false,
      store,
      mocks: { $route },
      stubs: {
        CodDate: true,
        Directors: true,
        Certify: true,
        StaffPayment: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })
    const vm: any = wrapper.vm as any

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{ filingTypeCode: 'OTCDR', entityType: 'CP' }] // dummy data

    // make sure a fee is required
    vm.totalFee = 100

    // wait for things to stabilize
    await flushPromises()

    // sanity checks
    expect(jest.isMockFunction(window.location.assign)).toBe(true)
    expect(vm.validated).toEqual(true)
    expect(vm.busySaving).toEqual(false)

    // TODO: verify that new filing was created

    // verify that button is enabled
    const button = wrapper.find('#cod-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button and wait for async methods to finish
    button.trigger('click')
    await flushPromises()

    // verify v-tooltip text - Todo - Tool tip is outside the wrapper. Yet to find out how to get hold of that.
    // const tooltipText = wrapper.find('#cod-file-pay-btn + span').text()
    // expect(tooltipText).toContain('Ensure all of your information is entered correctly before you File & Pay.')
    // expect(tooltipText).toContain('There is no opportunity to change information beyond this point.')

    // verify redirection
    const payURL = 'auth/makepayment/321/' + encodeURIComponent('business/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('saves a new filing and redirects to Pay URL when this is a new filing and the File & Pay button ' +
    'is clicked - as a BCOMP', async () => {
    // init store
    store.state.entityType = 'BEN'

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = mount(StandaloneDirectorsFiling, {
      sync: false,
      store,
      mocks: { $route },
      stubs: {
        Directors: true,
        Certify: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })
    const vm: any = wrapper.vm as any

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{ filingTypeCode: 'OTCDR', entityType: 'BEN' }] // dummy data

    // make sure a fee is required
    vm.totalFee = 100

    // wait for things to stabilize
    await flushPromises()

    // sanity checks
    expect(jest.isMockFunction(window.location.assign)).toBe(true)
    expect(vm.validated).toEqual(true)
    expect(vm.busySaving).toEqual(false)

    // TODO: verify that new filing was created

    // verify that button is enabled
    const button = wrapper.find('#cod-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button and wait for async methods to finish
    button.trigger('click')
    await flushPromises()

    // verify v-tooltip text - Todo - Tool tip is outside the wrapper. Yet to find out how to get hold of that.
    // const tooltipText = wrapper.find('#cod-file-pay-btn + span').text()
    // expect(tooltipText).toContain('Ensure all of your information is entered correctly before you File & Pay.')
    // expect(tooltipText).toContain('There is no opportunity to change information beyond this point.')

    // verify redirection
    const payURL = 'auth/makepayment/321/' + encodeURIComponent('business/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('updates an existing filing and routes to the dashboard when this is a draft filing and the File & Pay button ' +
    'is clicked and payment action is not required', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-directors', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(StandaloneDirectorsFiling, {
      store,
      localVue,
      router,
      stubs: {
        CodDate: true,
        Directors: true,
        Certify: true,
        StaffPayment: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })
    const vm: any = wrapper.vm as any

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // make sure a fee is required
    vm.totalFee = 100

    // wait for things to stabilize
    await flushPromises()

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)
    expect(vm.validated).toEqual(true)
    expect(vm.busySaving).toEqual(false)

    // TODO: verify that draft filing was fetched

    // verify that button is enabled
    const button = wrapper.find('#cod-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button and wait for async methods to finish
    button.trigger('click')
    await flushPromises()

    // verify v-tooltip text - To find out how to get the tool tip text outside the wrapper
    // const tooltipText = wrapper.find('#cod-file-pay-btn + span').text()
    // expect(tooltipText).toContain('Ensure all of your information is entered correctly before you File & Pay.')
    // expect(tooltipText).toContain('There is no opportunity to change information beyond this point.')

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 3B - Submitting filing that doesn\'t need to be paid', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "save and file" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'PAID', // API may return this or PENDING but we don't care
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123,
              'paymentToken': '321'
            }
          }
        }
      })))

    // mock "fetch tasks" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/tasks')
      .returns(new Promise((resolve) => resolve({
        data: {
          'tasks': [
            {
              'task': {
                'filing': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2017,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': true,
              'order': 1
            }
          ]
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('saves a new filing and routes to Dashboard URL when this is a new filing and the File & Pay button ' +
    'is clicked', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-directors', params: { filingId: '0' } }) // new filing id

    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, localVue, router })
    const vm: any = wrapper.vm as any

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // NB: can't find button because Vuetify hasn't rendered it
    // const button = wrapper.find('#cod-file-pay-btn')

    // work-around in lieu of clicking Pay & File button
    await vm.onClickFilePay()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    // verify route param
    expect(vm.$route.query).toEqual({ filing_id: 123 })

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 4 - Saving', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "save draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      })))

    // mock "fetch tasks" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/tasks')
      .returns(new Promise((resolve) => resolve({
        data: {
          'tasks': [
            {
              'task': {
                'filing': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2017,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': true,
              'order': 1
            }
          ]
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('saves a new filing and stays on current page when the Save button is clicked',
    async () => {
      const $route = { params: { filingId: 0 } } // new filing id
      const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
      const vm = wrapper.vm as any

      // make sure form is validated
      vm.codDateValid = true
      vm.directorFormValid = true
      vm.staffPaymentFormValid = true
      vm.certifyFormValid = true
      store.state.filingData = [{}] // dummy data

      // sanity check
      expect(jest.isMockFunction(window.location.assign)).toBe(true)

      // TODO: verify that new filing was created

      // verify that button is enabled
      const button = wrapper.find('#cod-save-btn')
      expect(button.attributes('disabled')).toBeUndefined()

      // click the Save button and wait for async methods to finish
      // button.trigger('click')
      // await flushPromises()
      // work-around because click trigger isn't working
      await vm.onClickSave()

      // verify no redirection
      expect(window.location.assign).not.toHaveBeenCalled()

      // verify no routing
      expect(vm.$route.name).toBeUndefined()

      wrapper.destroy()
    }
  )

  it('saves a new filing and routes to Dashboard URL when the Save & Resume button is clicked', async () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-directors', params: { filingId: '0' } }) // new filing id

    const wrapper = shallowMount(StandaloneDirectorsFiling, { store, localVue, router })
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that new filing was created

    // verify that button is enabled
    const button = wrapper.find('#cod-save-resume-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the Save & Resume Later button and wait for async methods to finish
    // button.trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSaveResume()

    // verify no redirection
    expect(window.location.assign).not.toHaveBeenCalled()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Directors Filing - Part 5 - Data', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
  let spy: any

  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    // mock "get tasks" endpoint - needed for hasTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint - garbage response data, we aren't testing that
    spy = sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': []
            },
            'business': {
            },
            'header': {
              'filingId': 123
            }
          }
        }
      })))

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-directors', params: { filingId: '0' } }) // new filing id

    wrapper = shallowMount(StandaloneDirectorsFiling, { store, localVue, router })
    vm = wrapper.vm

    // set up director data
    vm.updatedDirectors = [
      // unchanged director
      {
        officer: {
          firstName: 'Unchanged',
          lastName: 'lastname'
        },
        deliveryAddress: {
          streetAddress: 'a1',
          addressCity: 'city',
          addressCountry: 'country',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        appointmentDate: '2019-01-01',
        cessationDate: null,
        actions: []
      },
      // appointed director
      {
        officer: {
          firstName: 'Appointed',
          lastName: 'lastname'
        },
        deliveryAddress: {
          streetAddress: 'a1',
          addressCity: 'city',
          addressCountry: 'country',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        appointmentDate: '2019-01-01',
        cessationDate: null,
        actions: ['appointed']
      },
      // ceased director
      {
        officer: {
          firstName: 'Ceased',
          lastName: 'lastname'
        },
        deliveryAddress: {
          streetAddress: 'a1',
          addressCity: 'city',
          addressCountry: 'country',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        appointmentDate: '2019-01-01',
        cessationDate: '2019-03-25',
        actions: ['ceased']
      }
    ]

    // make sure form is validated
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true

    vm.directorsPaidChange(true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('Includes complete list of directors in the filing data', async () => {
    // click the Save button
    // wrapper.find('#cod-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.changeOfDirectors).toBeDefined()

    const firstNames = payload.filing.changeOfDirectors.directors.map(el => el.officer.firstName)
    expect(firstNames).toContain('Unchanged')
    expect(firstNames).toContain('Appointed')
    expect(firstNames).toContain('Ceased')
  })

  it('Includes certification data in the header', async () => {
    // click the Save button
    // wrapper.find('#cod-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.changeOfDirectors).toBeDefined()
    expect(payload.filing.header).toBeDefined()

    expect(payload.filing.header.certifiedBy).toBeDefined()
    expect(payload.filing.header.email).toBeDefined()
  })
})

describe('Standalone Directors Filing - Part 6 - Error/Warning Dialogs', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.currentDate = '2019-07-15'

    const get = sinon.stub(axios, 'get')

    // mock "fetch a draft filing" endpoint
    get.withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      })))

    // mock "fetch tasks" endpoint
    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise((resolve) => resolve({
        data: {
          'tasks': [
            {
              'task': {
                'filing': {
                  'header': {
                    'name': 'annualReport',
                    'ARFilingYear': 2017,
                    'status': 'NEW'
                  }
                }
              },
              'enabled': true,
              'order': 1
            }
          ]
        }
      })))

    // mock "file post" endpoint
    const p1 = Promise.reject({
      response: {
        status: 400,
        data: {
          'errors': [
            { 'error': 'err msg post' }
          ],
          'warnings': [
            { 'warning': 'warn msg post' }
          ],
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'PENDING',
              'filingId': 123,
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'paymentToken': '321'
            }
          }
        }
      }
    })
    p1.catch(() => { }) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings').returns(p1)

    // mock "file put" endpoint
    const p2 = Promise.reject({
      response: {
        status: 400,
        data: {
          'errors': [
            { 'error': 'err msg put' }
          ],
          'warnings': [
            { 'warning': 'warn msg put' }
          ],
          'filing': {
            'changeOfDirectors': {
              'directors': sampleDirectors
            },
            'business': {
              'cacheId': 1,
              'foundingDate': '2007-04-08T00:00:00+00:00',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfDirectors',
              'date': '2017-06-06T00:00:00+00:00',
              'effectiveDate': 'Tue, 06 Jun 2017 18:49:44 GMT',
              'submitter': 'cp0001191',
              'status': 'PENDING',
              'filingId': 123,
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'paymentToken': '321'
            }
          }
        }
      }
    })
    p2.catch(() => { }) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'put').withArgs('businesses/CP0001191/filings/123').returns(p2)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('sets the required fields to display errors from the api after a POST call',
    async () => {
      const $route = { params: { filingId: 0 } } // new filing id
      const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
      const vm = wrapper.vm as any

      // make sure form is validated
      vm.inFilingReview = true
      vm.codDateValid = true
      vm.directorFormValid = true
      vm.staffPaymentFormValid = true
      vm.certifyFormValid = true
      store.state.filingData = [{}] // dummy data

      // sanity check
      expect(jest.isMockFunction(window.location.assign)).toBe(true)

      // TODO: verify that draft filing was fetched

      // NB: can't find button because Vuetify hasn't rendered it
      // const button = wrapper.find('#cod-file-pay-btn')

      // work-around in lieu of clicking Pay & File button
      await vm.onClickFilePay()

      // verify error dialog values set to what was returned
      expect(vm.saveErrorDialog).toBe(true)
      expect(vm.saveErrors.length).toBe(1)
      expect(vm.saveErrors[0].error).toBe('err msg post')
      expect(vm.saveWarnings.length).toBe(1)
      expect(vm.saveWarnings[0].warning).toBe('warn msg post')

      wrapper.destroy()
    }
  )

  it('sets the required fields to display errors from the api after a PUT call',
    async () => {
      const $route = { params: { filingId: 123 } } // existing filing id
      const wrapper = shallowMount(StandaloneDirectorsFiling, { store, mocks: { $route } })
      const vm = wrapper.vm as any

      // make sure form is validated
      vm.inFilingReview = true
      vm.codDateValid = true
      vm.directorFormValid = true
      vm.staffPaymentFormValid = true
      vm.certifyFormValid = true
      store.state.filingData = [{}] // dummy data

      // sanity check
      expect(jest.isMockFunction(window.location.assign)).toBe(true)

      // TODO: verify that draft filing was fetched

      // NB: can't find button because Vuetify hasn't rendered it
      // const button = wrapper.find('#cod-file-pay-btn')

      // work-around in lieu of clicking Pay & File button
      await vm.onClickFilePay()

      // verify error dialog values set to what was returned
      expect(vm.saveErrorDialog).toBe(true)
      expect(vm.saveErrors.length).toBe(1)
      expect(vm.saveErrors[0].error).toBe('err msg put')
      expect(vm.saveWarnings.length).toBe(1)
      expect(vm.saveWarnings[0].warning).toBe('warn msg put')

      wrapper.destroy()
    }
  )
})

describe('Standalone Directors Filing - payment required error', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // init store
    store.state.currentDate = '2019-07-15'
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'NEW'

    // mock "file post" endpoint, with a pay error response
    const p1 = Promise.reject({
      response: {
        status: 402,
        data: {
          errors: [
            { message: 'payment required' }
          ],
          filing: {
            annualReport: {
              annualGeneralMeetingDate: '2018-07-15'
            },
            business: {
              cacheId: 1,
              foundingDate: '2007-04-08',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'annualReport',
              date: '2017-06-06',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
              isPaymentActionRequired: true
            }
          }
        }
      }
    })
    p1.catch(() => { }) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings').returns(p1)
  })

  it('handles error on File and Save', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('PAY_API_URL', '')
    sessionStorage.setItem('AUTH_URL', 'auth/')
    const get = sinon.stub(axios, 'get')

    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = mount(StandaloneDirectorsFiling, {
      store,
      mocks: { $route },
      stubs: {
        CodDate: true,
        Directors: true,
        Certify: true,
        StaffPayment: true,
        Affix: true,
        SbcFeeSummary: true,
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        ResumeErrorDialog: true,
        SaveErrorDialog: true
      },
      vuetify
    })

    const vm: any = wrapper.vm

    // make sure form is validated
    vm.inFilingReview = true
    vm.codDateValid = true
    vm.directorFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{ filingTypeCode: 'OTCDR', entityType: 'CP' }] // dummy data

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(vm.saveErrors).toStrictEqual([])

    const button = wrapper.find('#cod-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    // button.trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickFilePay()

    // verify an error has been received
    expect(vm.saveErrors).toStrictEqual([{ message: 'payment required' }])

    wrapper.destroy()
  })
})
