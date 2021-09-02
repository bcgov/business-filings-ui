/* eslint promise/param-names: 0, prefer-promise-reject-errors: 0 */
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import sinon from 'sinon'
import { createLocalVue, shallowMount, mount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import StandaloneOfficeAddressFiling from '@/views/StandaloneOfficeAddressFiling.vue'
import { Certify, OfficeAddresses, StaffPayment } from '@/components/common'
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
store.state.currentDate = '2019-07-15'

const sampleDeliveryAddress = {
  streetAddress: 'delivery street address',
  streetAddressAdditional: null,
  addressCity: 'deliv address city',
  addressCountry: 'deliv country',
  postalCode: 'H0H0H0',
  addressRegion: 'BC',
  deliveryInstructions: null
}

const sampleMailingAddress = {
  streetAddress: 'mailing street address',
  streetAddressAdditional: 'Kirkintiloch',
  addressCity: 'Glasgow',
  addressCountry: 'UK',
  postalCode: 'H0H 0H0',
  addressRegion: 'Scotland',
  deliveryInstructions: 'go to the back'
}

describe('Standalone Office Address Filing - Part 1 - UI', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityType = 'CP'
  })

  it('renders the filing sub-components properly', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route } })

    expect(wrapper.find(OfficeAddresses).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)
    expect(wrapper.find(StaffPayment).exists()).toBe(false) // normally not rendered

    wrapper.destroy()
  })

  it('renders the Staff Payment sub-component properly', () => {
    // init store
    store.state.keycloakRoles = ['staff']

    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route } })

    // all components should be rendered
    expect(wrapper.find(OfficeAddresses).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)
    expect(wrapper.find(StaffPayment).exists()).toBe(true)

    // reset store
    // NB: this is important for subsequent tests
    store.state.keycloakRoles = []

    wrapper.destroy()
  })

  it('enables Validated flag when properties are valid', async () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.addressesFormValid = true
    store.state.filingData = [{}] // dummy data
    await flushPromises()

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when Office Address form is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.addressesFormValid = false
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Certify form is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = false
    vm.addressesFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Staff Payment data is required but not provided', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.certifyFormValid = true
    vm.addressesFormValid = true
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

  it('disables Validated flag when filing data is invalid', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.addressesFormValid = true
    store.state.filingData = [] // no data

    // confirm that flag is set correctly
    expect(vm.validated).toEqual(false)
  })

  it('enables File & Pay button when Validated is true', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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

    // set all properties truthy
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.addressesFormValid = true
    store.state.filingData = [{}] // dummy data

    // confirm that button is enabled
    expect(wrapper.find('#coa-file-pay-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when Validated is false', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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

    // set all properties falsy
    vm.staffPaymentFormValid = false
    vm.certifyFormValid = false
    vm.addressesFormValid = false
    store.state.filingData = [] // no data

    // confirm that button is disabled
    expect(wrapper.find('#coa-file-pay-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('Verify COA Certify contains correct section codes', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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

    store.state.entityType = 'BEN'
    store.state.configObject = configJson.find(x => x.entityType === store.state.entityType)

    expect(wrapper.find(Certify).exists()).toBe(true)
    const certify: any = wrapper.find(Certify)

    expect(certify.vm.message).toContain('See Sections 35 and 36 of the Business Corporations Act.')
    expect(certify.vm.entityDisplay).toEqual('Benefit Company')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 2A - Resuming with FAS staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.entityType = 'CP'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            changeOfAddress: {
              offices: {
                registeredOffice: {
                  deliveryAddress: sampleDeliveryAddress,
                  mailingAddress: sampleMailingAddress
                }
              }
            },
            business: {
              foundingDate: '2007-04-08',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
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

  it('fetches a draft Standalone Office Address filing with FAS staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that FAS data was restored
    expect(vm.staffPaymentData.option).toBe(1) // FAS
    expect(vm.staffPaymentData.routingSlipNumber).toBe('123456789')
    expect(vm.staffPaymentData.isPriority).toBe(true)

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    // verify that changed addresses were restored
    expect(vm.updatedAddresses.registeredOffice.deliveryAddress.streetAddress).toBe('delivery street address')
    expect(vm.updatedAddresses.registeredOffice.mailingAddress.streetAddress).toBe('mailing street address')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 2B - Resuming with BCOL staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.entityType = 'CP'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            changeOfAddress: {
              offices: {
                registeredOffice: {
                  deliveryAddress: sampleDeliveryAddress,
                  mailingAddress: sampleMailingAddress
                }
              }
            },
            business: {
              foundingDate: '2007-04-08',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
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

  it('fetches a draft Standalone Office Address filing with BCOL staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises()

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

    // verify that changed addresses were restored
    expect(vm.updatedAddresses.registeredOffice.deliveryAddress.streetAddress).toBe('delivery street address')
    expect(vm.updatedAddresses.registeredOffice.mailingAddress.streetAddress).toBe('mailing street address')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 2C - Resuming with No Fee staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.entityType = 'CP'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            changeOfAddress: {
              offices: {
                registeredOffice: {
                  deliveryAddress: sampleDeliveryAddress,
                  mailingAddress: sampleMailingAddress
                }
              }
            },
            business: {
              foundingDate: '2007-04-08',
              identifier: 'CP0001191',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
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

  it('fetches a draft Standalone Office Address filing with No Fee staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that No Fee data was restored
    expect(vm.staffPaymentData.option).toBe(0) // NO_FEE
    expect(vm.staffPaymentData.isPriority).toBeFalsy()

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    // verify that changed addresses were restored
    expect(vm.updatedAddresses.registeredOffice.deliveryAddress.streetAddress).toBe('delivery street address')
    expect(vm.updatedAddresses.registeredOffice.mailingAddress.streetAddress).toBe('mailing street address')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 2D - Resuming (BCOMP)', () => {
  beforeEach(() => {
    // init store
    store.state.businessId = 'BC0007291'
    store.state.entityIncNo = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0001191'
    store.state.entityType = 'BEN'

    // mock "fetch a draft filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/BC0007291/filings/123')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            changeOfAddress: {
              offices: {
                registeredOffice: {
                  deliveryAddress: sampleDeliveryAddress,
                  mailingAddress: sampleMailingAddress
                },
                recordsOffice: {
                  deliveryAddress: sampleDeliveryAddress,
                  mailingAddress: sampleMailingAddress
                }
              }
            },
            business: {
              foundingDate: '2007-04-08',
              identifier: 'BC0007291',
              lastLedgerTimestamp: '2019-04-15T20:05:49.068272+00:00',
              legalName: 'Legal Name - BC0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
              submitter: 'BC0007291',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123
            }
          }
        }
      })))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft Standalone Office Address filing', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises()

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    // verify that changed addresses were restored
    expect(vm.updatedAddresses.registeredOffice.deliveryAddress.streetAddress).toBe('delivery street address')
    expect(vm.updatedAddresses.registeredOffice.mailingAddress.streetAddress).toBe('mailing street address')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 3 - Submitting', () => {
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
    store.state.entityType = 'CP'

    let sinonAxiosGet = sinon.stub(axios, 'get')

    // mock "fetch a draft filing" endpoint
    sinonAxiosGet.withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123,
              'routingSlipNumber': '456'
            }
          }
        }
      })))

    sinonAxiosGet.withArgs('businesses/CP0001191/tasks')
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

    // mock "save and file" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
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
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
              submitter: 'cp0001191',
              status: 'PENDING',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
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
    'is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_WEB_URL', 'auth/')

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data
    expect(vm.validated).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that new filing was created

    const button = wrapper.find('#coa-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

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
    router.push({ name: 'standalone-addresses', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data
    expect(vm.validated).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that draft filing was fetched

    const button = wrapper.find('#coa-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    // verify v-tooltip text - Todo: How to get the tool tip rendered outside the wrapper
    // const tooltipText = wrapper.find('#coa-file-pay-btn + span').text()
    // expect(tooltipText).toContain('Ensure all of your information is entered correctly before you File & Pay.')
    // expect(tooltipText).toContain('There is no opportunity to change information beyond this point.')

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 3B - Submitting (BCOMP)', () => {
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
    store.state.businessId = 'BC0007291'
    store.state.entityIncNo = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0001191'
    store.state.entityType = 'BEN'

    let sinonAxiosGet = sinon.stub(axios, 'get')

    // mock "fetch a draft filing" endpoint
    sinonAxiosGet.withArgs('businesses/BC0007291/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                },
                'recordsOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'BC0007291',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - BC0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'BC0007291',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123,
              'routingSlipNumber': '456'
            }
          }
        }
      })))

    sinonAxiosGet.withArgs('businesses/BC0007291/tasks')
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

    // mock "save and file" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC0007291/filings')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                },
                'recordsOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'BC0007291',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - BC0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
              submitter: 'BC0007291',
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
    sinon.stub(axios, 'put').withArgs('businesses/BC0007291/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                },
                'recordsOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'BC0007291',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - BC0001191'
            },
            header: {
              name: 'changeOfAddress',
              date: '2017-06-06',
              submitter: 'BC0007291',
              status: 'PENDING',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123,
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
    'is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_WEB_URL', 'auth/')

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data
    expect(vm.validated).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that new filing was created

    const button = wrapper.find('#coa-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

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
    router.push({ name: 'standalone-addresses', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    store.state.filingData = [{}] // dummy data
    expect(vm.validated).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that draft filing was fetched

    const button = wrapper.find('#coa-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    // verify v-tooltip text - Todo: How to get the tool tip rendered outside the wrapper
    // const tooltipText = wrapper.find('#coa-file-pay-btn + span').text()
    // expect(tooltipText).toContain('Ensure all of your information is entered correctly before you File & Pay.')
    // expect(tooltipText).toContain('There is no opportunity to change information beyond this point.')

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 4 - Saving', () => {
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
    store.state.entityType = 'CP'

    // mock "save draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'deliveryAddress': sampleDeliveryAddress,
              'mailingAddress': sampleMailingAddress
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      })))

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

  it('saves a new filing when this is a new filing and the Save button is clicked',
    async () => {
      const $route = { params: { filingId: 0 } } // new filing id
      const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
      const vm = wrapper.vm as any

      // make sure form is validated
      vm.addressesFormValid = true
      vm.staffPaymentFormValid = true
      vm.certifyFormValid = true

      // sanity check
      expect(jest.isMockFunction(window.location.assign)).toBe(true)

      // TODO: verify that new filing was created

      // click the Save button
      // wrapper.find('#coa-save-btn').trigger('click')
      // await flushPromises()
      // work-around because click trigger isn't working
      await vm.onClickSave()

      // verify no redirection
      expect(window.location.assign).not.toHaveBeenCalled()

      wrapper.destroy()
    }
  )

  it('saves a new filing and routes to Dashboard URL when the Save & Resume button is clicked', async () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, localVue, router, vuetify })
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true

    // click the Save & Resume Later button
    // wrapper.find('#coa-save-resume-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSaveResume()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 4B - Saving (BCOMP)', () => {
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
    store.state.businessId = 'BC0007291'
    store.state.entityIncNo = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0001191'
    store.state.entityType = 'BEN'

    // mock "save draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC0007291/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                },
                'recordsOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'BC0007291',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - BC0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'BC0007291',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      })))

    sinon.stub(axios, 'get').withArgs('businesses/BC0007291/tasks')
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

  it('saves a new filing when this is a new filing and the Save button is clicked',
    async () => {
      const $route = { params: { filingId: 0 } } // new filing id
      const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, mocks: { $route }, vuetify })
      const vm = wrapper.vm as any

      // make sure form is validated
      vm.addressesFormValid = true
      vm.staffPaymentFormValid = true
      vm.certifyFormValid = true

      // sanity check
      expect(jest.isMockFunction(window.location.assign)).toBe(true)

      // TODO: verify that new filing was created

      // click the Save button
      // wrapper.find('#coa-save-btn').trigger('click')
      // await flushPromises()
      // work-around because click trigger isn't working
      await vm.onClickSave()

      // verify no redirection
      expect(window.location.assign).not.toHaveBeenCalled()

      wrapper.destroy()
    }
  )

  it('saves a new filing and routes to Dashboard URL when the Save & Resume button is clicked', async () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, localVue, router, vuetify })
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true

    // click the Save & Resume Later button
    // wrapper.find('#coa-save-resume-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSaveResume()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Standalone Office Address Filing - Part 5 - Data', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
  let spy

  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.entityType = 'CP'

    // mock "get tasks" endpoint - needed for hasTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint
    spy = sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': {},
                  'mailingAddress': {}
                }
              }
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
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, localVue, router, vuetify })
    vm = wrapper.vm

    // stub address data
    vm.updatedAddresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // make sure form is validated
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.officeModifiedEventHandler(true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes certification data in the header', async () => {
    // click the Save button
    // wrapper.find('#coa-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.changeOfAddress).toBeDefined()
    expect(payload.filing.header).toBeDefined()

    expect(payload.filing.header.certifiedBy).toBeDefined()
    expect(payload.filing.header.email).toBeDefined()

    expect(payload.filing.header.routingSlipNumber).toBeUndefined() // normally not saved
  })
})

describe('Standalone Office Address Filing - Part 5B - Data (BCOMP)', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
  let spy

  beforeEach(() => {
    // init store
    store.state.businessId = 'BC0007291'
    store.state.entityIncNo = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0001191'
    store.state.entityType = 'BEN'

    // mock "get tasks" endpoint - needed for hasTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/BC0007291/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint
    spy = sinon.stub(axios, 'post').withArgs('businesses/BC0007291/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': {},
                  'mailingAddress': {}
                },
                'recordsOffice': {
                  'deliveryAddress': {},
                  'mailingAddress': {}
                }
              }
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
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    wrapper = shallowMount(StandaloneOfficeAddressFiling, { store, localVue, router, vuetify })
    vm = wrapper.vm

    // stub address data
    vm.updatedAddresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      },
      recordsOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // make sure form is validated
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.officeModifiedEventHandler(true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes certification data in the header', async () => {
    // click the Save button
    // wrapper.find('#coa-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.changeOfAddress).toBeDefined()
    expect(payload.filing.header).toBeDefined()

    expect(payload.filing.header.certifiedBy).toBeDefined()
    expect(payload.filing.header.email).toBeDefined()

    expect(payload.filing.header.routingSlipNumber).toBeUndefined() // normally not saved
  })
})

describe('Standalone Office Address Filing - Part 6 - Error/Warning Dialogs', () => {
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
    store.state.entityType = 'CP'

    const sinonAxiosGet = sinon.stub(axios, 'get')

    // mock "get tasks" endpoint - needed for hasTasks()
    sinonAxiosGet
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "fetch a draft filing" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          'filing': {
            'changeOfAddress': {
              'offices': {
                'registeredOffice': {
                  'deliveryAddress': sampleDeliveryAddress,
                  'mailingAddress': sampleMailingAddress
                }
              }
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123,
              'routingSlipNumber': '456'
            }
          }
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
            'changeOfAddress': {
              'deliveryAddress': sampleDeliveryAddress,
              'mailingAddress': sampleMailingAddress
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      }
    })
    p1.catch(() => { })
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
            'changeOfAddress': {
              'deliveryAddress': sampleDeliveryAddress,
              'mailingAddress': sampleMailingAddress
            },
            'business': {
              'foundingDate': '2007-04-08',
              'identifier': 'CP0001191',
              'lastLedgerTimestamp': '2019-04-15T20:05:49.068272+00:00',
              'legalName': 'Legal Name - CP0001191'
            },
            'header': {
              'name': 'changeOfAddress',
              'date': '2017-06-06',
              'submitter': 'cp0001191',
              'status': 'DRAFT',
              'certifiedBy': 'Full Name',
              'email': 'no_one@never.get',
              'filingId': 123
            }
          }
        }
      }
    })
    p2.catch(() => { })
    sinon.stub(axios, 'put').withArgs('businesses/CP0001191/filings/123').returns(p2)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('sets the required fields to display errors from the api after a POST call', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that new filing was created

    // click the File & Pay button
    // wrapper.find('#coa-file-pay-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
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

  it('sets the required fields to display errors from the api after a PUT call', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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
    vm.addressesFormValid = true
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // TODO: verify that new filing was created

    // click the File & Pay button
    // wrapper.find('#coa-file-pay-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
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

describe('Standalone Office Address Filing - payment required error', () => {
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
    sessionStorage.setItem('AUTH_WEB_URL', 'auth/')
    const get = sinon.stub(axios, 'get')

    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'standalone-addresses', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(StandaloneOfficeAddressFiling, {
      store,
      localVue,
      router,
      stubs: {
        OfficeAddresses: true,
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

    // set all properties truthy
    vm.staffPaymentFormValid = true
    vm.certifyFormValid = true
    vm.addressesFormValid = true
    store.state.filingData = [{}] // dummy data

    // stub address data
    vm.updatedAddresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(vm.saveErrors).toStrictEqual([])

    const button = wrapper.find('#coa-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    // button.trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickFilePay()

    // verify an error message was retrieved
    expect(vm.saveErrors).toStrictEqual([{ message: 'payment required' }])

    wrapper.destroy()
  })
})
