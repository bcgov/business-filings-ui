/* eslint promise/param-names: 0, prefer-promise-reject-errors: 0 */
// Libraries
import Vue from 'vue'
import sinon from 'sinon'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import Vuelidate from 'vuelidate'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import mockRouter from './mockRouter'
import flushPromises from 'flush-promises'
import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'

// Components
import AnnualReport from '@/views/AnnualReport.vue'
import AgmDate from '@/components/AnnualReport/AGMDate.vue'
import Directors from '@/components/common/Directors.vue'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import { Certify, OfficeAddresses, SummaryDirectors, SummaryOfficeAddresses } from '@/components/common'
import { ConfigJson } from '@/resources/business-config'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Annual Report - Part 1 - UI', () => {
  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.ARFilingYear = 2017
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'
    store.state.currentFilingStatus = 'NEW'
    store.state.entityType = 'CP'
  })

  it('renders the Annual Report sub-components properly when entity is a Coop', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route } })

    expect(wrapper.find(AgmDate).exists()).toBe(true)
    expect(wrapper.find(OfficeAddresses).exists()).toBe(true)
    expect(wrapper.find(Directors).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Verify AR Certify contains correct section codes', () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route } })
    store.state.entityType = 'CP'
    store.state.configObject = ConfigJson.find(x => x.entityType === store.state.entityType)
    expect(wrapper.find(Certify).exists()).toBe(true)
    const certify: any = wrapper.find(Certify)

    expect(certify.vm.message).toContain('See Section 126 of the Cooperative Association Act.')
    expect(certify.vm.entityDisplay).toEqual('Cooperative')

    wrapper.destroy()
  })

  it('initializes the store variables properly', () => {
    // set current date in store
    store.state.currentJsDate = new Date('2019-03T12:00:00')
    store.state.currentDate = '2019-03-03'

    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    expect(vm.$store.getters.getIdentifier).toEqual('CP0001191')
    expect(vm.$store.getters.getEntityType).toEqual('CP')
    expect(vm.$store.state.ARFilingYear).toEqual(2017)
    expect(vm.$store.state.currentFilingStatus).toEqual('NEW')

    // check titles and sub-titles
    expect(vm.$el.querySelector('#annual-report-header').textContent).toContain('2017')
    expect(vm.$el.querySelector('#addresses-header span').textContent).toContain('2017-12-31')
    expect(vm.$el.querySelector('#directors-header + p').textContent).toContain('2017-12-31')

    wrapper.destroy()
  })

  it('enables Validated flag when sub-component flags are valid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when AGM Date is invalid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = false
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Addresses form is invalid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = false
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables address component when AGM Date < Last COA Date', () => {
    store.state.lastAddressChangeDate = '2019-05-06'
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    wrapper.setData({ agmDate: '2019-05-05' })

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = false
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that change state is disabled
    expect(vm.allowChange('coa')).toBe(false)

    wrapper.destroy()
  })

  it('has no effect on address component when Last COA Date is null', () => {
    store.state.lastAddressChangeDate = null
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    wrapper.setData({ agmDate: '2019-02-09' })

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = false
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that change state is enabled
    expect(vm.allowChange('coa')).toBe(true)

    wrapper.destroy()
  })

  it('disables directors component when AGM Date < Last COD Date', () => {
    store.state.lastDirectorChangeDate = '2019-05-06'
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    wrapper.setData({ agmDate: '2019-05-05' })

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = false
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that change state is disabled
    expect(vm.allowChange('cod')).toBe(false)

    wrapper.destroy()
  })

  it('disables directors component when Last COD Date is null', () => {
    store.state.lastDirectorChangeDate = null
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    wrapper.setData({ agmDate: '2019-02-09' })

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = false
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that change state is enabled
    expect(vm.allowChange('cod')).toBe(true)

    wrapper.destroy()
  })

  it('disables Validated flag when Director form is invalid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = false
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Certify form is invalid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = false

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('enables File & Pay button when form is validated', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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

    const vm: any = wrapper.vm

    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    vm.directorEditInProgress = false

    // confirm that button is enabled
    expect(wrapper.find('#ar-file-pay-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when form is not validated', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    const vm: any = wrapper.vm

    // set properties
    vm.agmDateValid = false
    vm.addressesFormValid = false
    vm.directorFormValid = false
    vm.certifyFormValid = false

    // confirm that button is disabled
    expect(wrapper.find('#ar-file-pay-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })
})

describe('Annual Report - Part 1B - UI (BCOMP)', () => {
  beforeEach(() => {
    // init store
    store.state.identifier = 'BC0007291'
    store.state.ARFilingYear = 2018
    store.state.nextARDate = '2018-09-26'
    store.state.currentFilingStatus = 'NEW'
    store.state.entityType = 'BEN'
  })

  it('renders the Annual Report sub-components properly when entity is a BCOMP', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route } })

    expect(wrapper.find(ArDate).exists()).toBe(true)
    expect(wrapper.find(SummaryOfficeAddresses).exists()).toBe(true)
    expect(wrapper.find(SummaryDirectors).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)

    wrapper.destroy()
  })

  it('initializes the store variables properly', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    expect(vm.$store.getters.getIdentifier).toEqual('BC0007291')
    expect(vm.$store.getters.getEntityType).toEqual('BEN')
    expect(vm.$store.state.ARFilingYear).toEqual(2018)
    expect(vm.$store.state.nextARDate).toEqual('2018-09-26')
    expect(vm.$store.state.currentFilingStatus).toEqual('NEW')

    // check titles and sub-titles
    expect(vm.$el.querySelector('#annual-report-header-BC').textContent).toContain('2018')

    wrapper.destroy()
  })

  it('enables Validated flag when sub-component flags are valid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when Certify form is invalid', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set properties
    vm.certifyFormValid = false

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('enables File & Pay button when form is validated', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        SummaryDirectors: true,
        SummaryOfficeAddresses: true,
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

    const vm: any = wrapper.vm

    // make sure form is validated
    vm.certifyFormValid = true
    vm.directorEditInProgress = false

    // confirm that button is enabled
    expect(wrapper.find('#ar-file-pay-bc-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when form is not validated', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        SummaryDirectors: true,
        SummaryOfficeAddresses: true,
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
    const vm: any = wrapper.vm

    // set properties
    vm.certifyFormValid = false

    // confirm that button is disabled
    expect(wrapper.find('#ar-file-pay-bc-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })
})

describe('Annual Report - Part 2A - Resuming with FAS staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'DRAFT'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "fetch a draft filing" endpoint
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/filings/123')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
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
                  routingSlipNumber: '123456789',
                  priority: true
                }
              }
            }
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft AR filing with FAS staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    // wait for draft to be fetched
    await flushPromises()

    // FUTURE: verify that Draft Date (for directors) was restored
    // (should be '2018-07-15')

    // FUTURE: verify that AGM Date was restored
    // (should be '2018/07/15')

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that FAS data was restored
    expect(vm.staffPaymentData.option).toBe(1) // FAS
    expect(vm.staffPaymentData.routingSlipNumber).toBe('123456789')
    expect(vm.staffPaymentData.isPriority).toBe(true)

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    // FUTURE: verify that changed addresses and directors were restored
    // (need to include in data above)

    wrapper.destroy()
  })
})

describe('Annual Report - Part 2B - Resuming with BCOL staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'DRAFT'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "fetch a draft filing" endpoint
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/filings/123')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
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
                  bcolAccountNumber: '123456',
                  datNumber: 'C1234567',
                  folioNumber: '123ABCabc',
                  priority: true
                }
              }
            }
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft AR filing with BCOL staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    // wait for draft to be fetched
    await flushPromises()

    // FUTURE: verify that Draft Date (for directors) was restored
    // (should be '2018-07-15')

    // FUTURE: verify that AGM Date was restored
    // (should be '2018/07/15')

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

    // FUTURE: verify that changed addresses and directors were restored
    // (need to include in data above)

    wrapper.destroy()
  })
})

describe('Annual Report - Part 2C - Resuming with No Fee staff payment', () => {
  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'DRAFT'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "fetch a draft filing" endpoint
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/filings/123')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
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
                  waiveFees: true
                }
              }
            }
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches a draft AR filing with No Fee staff payment', async () => {
    const $route = { params: { filingId: '123' } } // draft filing id
    const wrapper = shallowMount(AnnualReport, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    // wait for draft to be fetched
    await flushPromises()

    // FUTURE: verify that Draft Date (for directors) was restored
    // (should be '2018-07-15')

    // FUTURE: verify that AGM Date was restored
    // (should be '2018/07/15')

    // verify that Certified By was restored
    expect(vm.certifiedBy).toBe('Full Name')
    expect(vm.isCertified).toBe(false)

    // verify that No Fee data was restored
    expect(vm.staffPaymentData.option).toBe(0) // NO_FEE
    expect(vm.staffPaymentData.isPriority).toBeFalsy()

    // verify that we stored the Filing ID
    expect(+vm.filingId).toBe(123)

    // FUTURE: verify that changed addresses and directors were restored
    // (need to include in data above)

    wrapper.destroy()
  })
})

describe('Annual Report - Part 3 - Submitting', () => {
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
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'NEW'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    const sinonAxiosGet = sinon.stub(axios, 'get')

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinonAxiosGet
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "fetch a draft filing" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP0001191/filings/123')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
                  legalName: 'Legal Name - CP0001191'
                },
                header: {
                  name: 'annualReport',
                  date: '2017-06-06',
                  submitter: 'cp0001191',
                  status: 'DRAFT',
                  filingId: 123,
                  certifiedBy: 'Full Name',
                  email: 'no_one@never.get'
                }
              }
            }
          })
        )
      )

    // mock "save and file" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/CP0001191/filings')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
                  legalName: 'Legal Name - CP0001191'
                },
                header: {
                  name: 'annualReport',
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
          })
        )
      )

    // mock "update and file" endpoint
    sinon
      .stub(axios, 'put')
      .withArgs('businesses/CP0001191/filings/123')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
                  legalName: 'Legal Name - CP0001191'
                },
                header: {
                  name: 'annualReport',
                  date: '2017-06-06',
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
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('saves a new filing and redirects to Pay URL when this is a new AR and the File & Pay button ' +
    'is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('AUTH_WEB_URL', 'https://auth.web.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "" }')

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    vm.directorEditInProgress = false
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
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await vm.$el.querySelector('#ar-file-pay-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify redirection
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('updates an existing filing and routes to the dashboard when this is a draft AR and the File & Pay button ' +
    'is clicked and payment action is not required', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    vm.directorEditInProgress = false
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
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await vm.$el.querySelector('#ar-file-pay-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')

    wrapper.destroy()
  })
})

describe('Annual Report - Part 3B - Submitting (BCOMP)', () => {
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
    store.state.identifier = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0007291'
    store.state.entityType = 'BEN'
    store.state.ARFilingYear = 2018
    store.state.nextARDate = '2018-09-26'
    store.state.currentFilingStatus = 'NEW'
    store.state.registeredAddress = {}
    store.state.recordsAddress = {}

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/BC0007291/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save and file" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/BC0007291/filings')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualReportDate: '2019-09-21',
                  nextARDate: '2018-09-20'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'BC0007291',
                  legalName: 'Legal Name - BC0007291'
                },
                header: {
                  name: 'annualReport',
                  date: '2017-06-06',
                  submitter: 'bc0007291',
                  status: 'PENDING',
                  filingId: 123,
                  certifiedBy: 'Full Name',
                  email: 'no_one@never.get',
                  paymentToken: '321',
                  isPaymentActionRequired: true
                }
              }
            }
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('saves a new filing and redirects to Pay URL when this is a new AR and the File & Pay button ' +
    'is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('AUTH_WEB_URL', 'https://auth.web.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "" }')

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
      sync: false,
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        SummaryDirectors: true,
        SummaryOfficeAddresses: true,
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
    const vm = wrapper.vm as any

    // make sure form is validated
    vm.certifyFormValid = true
    store.state.filingData = [{ filingTypeCode: 'ANNBC', entityType: 'BEN' }] // dummy data

    // make sure a fee is required
    vm.totalFee = 100

    // wait for things to stabilize
    await flushPromises()

    // sanity checks
    expect(jest.isMockFunction(window.location.assign)).toBe(true)
    expect(vm.isPageValid).toEqual(true)
    expect(vm.busySaving).toEqual(false)

    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    // verify redirection
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })
})

describe('Annual Report - Part 4 - Saving', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'NEW'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/CP0001191/filings?draft=true')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {
                  annualGeneralMeetingDate: '2018-07-15'
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'CP0001191',
                  legalName: 'Legal Name - CP0001191'
                },
                header: {
                  name: 'annualReport',
                  date: '2017-06-06',
                  submitter: 'cp0001191',
                  status: 'DRAFT',
                  certifiedBy: 'Full Name',
                  email: 'no_one@never.get',
                  filingId: 123
                }
              }
            }
          })
        )
      )

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = shallowMount(AnnualReport, { store, localVue, router, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('saves a new filing when the Save button is clicked', async () => {
    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      },
      recordsOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // click the Save button
    await vm.$el.querySelector('#ar-save-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify no routing
    expect(vm.$route.name).toBe('annual-report')
  })

  it('saves a filing and routes to Dashboard URL when the Save & Resume button is clicked', async () => {
    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      },
      recordsOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // click the Save & Resume Later button
    // wrapper.find('#ar-save-resume-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSaveResume()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')
  })

  it('routes to Dashboard URL when the Cancel button is clicked', async () => {
    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // click the Cancel button
    // wrapper.find('#ar-cancel-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.$router.push({ name: 'dashboard' })

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')
  })
})

describe('Annual Report - Part 5 - Data', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
  let spy: any

  const currentFilingYear = 2017

  beforeEach(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = currentFilingYear
    store.state.currentFilingStatus = 'NEW'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint - garbage response data, we aren't testing that
    spy = sinon
      .stub(axios, 'post')
      .withArgs('businesses/CP0001191/filings?draft=true')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {},
                business: {},
                header: {
                  filingId: 123
                }
              }
            }
          })
        )
      )

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = shallowMount(AnnualReport, { store, localVue, router, vuetify })
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
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes Directors, Office Mailing Address, and Office Delivery Address in AR filing data', async () => {
    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    // get the payload of the ajax call
    // - the first index (0) is to get the first call, where there could be many calls to the stubbed function
    // - the second index (1) is to get the second param - data - where the call is axios.post(url, data)
    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()

    expect(payload.filing.annualReport.directors).toBeDefined()
    expect(payload.filing.annualReport.offices.registeredOffice.mailingAddress).toBeDefined()
    expect(payload.filing.annualReport.offices.registeredOffice.deliveryAddress).toBeDefined()
  })

  it('includes unchanged directors in AR filing data', async () => {
    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    let names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).toContain('Unchanged')
  })

  it('includes appointed directors in AR filing data', async () => {
    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    let names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).toContain('Appointed')
  })

  it('does NOT include ceased directors in AR filing data', async () => {
    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    let names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).not.toContain('Ceased')
  })

  it('includes certification data in the header', async () => {
    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.header).toBeDefined()

    expect(payload.filing.header.certifiedBy).toBeDefined()
    expect(payload.filing.header.email).toBeDefined()

    expect(payload.filing.header.routingSlipNumber).toBeUndefined() // normally not saved
  })

  it('includes the AR Date for the current filing year', async () => {
    // set current date in store, since it's normally set in a different component
    store.state.currentJsDate = new Date('2019-03T12:00:00')
    store.state.currentDate = '2019-03-03'

    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.annualReportDate).toBeDefined()

    expect(payload.filing.annualReport.annualReportDate.substr(0, 4)).toBe(currentFilingYear.toString())
  })

  it('sets the AGM Date and AR Date correctly for "No AGM" filing', async () => {
    // set current date in store, since it's normally set in a different component
    store.state.currentJsDate = new Date('2019-03T12:00:00')
    store.state.currentDate = '2019-03-03'

    // set No AGM
    vm.didNotHoldAgm = true

    // click the Save button
    // wrapper.find('#ar-save-btn').trigger('click')
    // await flushPromises()
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.annualReportDate).toBeDefined()

    // AGM Date should be null
    expect(payload.filing.annualReport.annualGeneralMeetingDate).toBeNull()

    // AR Date (year) should be filing year (ie: AR owed)
    expect(payload.filing.annualReport.annualReportDate.substr(0, 4)).toBe(currentFilingYear.toString())
  })
})

describe('Annual Report - Part 5B - Data (BCOMP)', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
  let spy: any

  const currentFilingYear = 2018

  beforeEach(() => {
    // init store
    store.state.identifier = 'BC0007291'
    store.state.entityName = 'Legal Name - BC0007291'
    store.state.entityType = 'BEN'
    store.state.ARFilingYear = 2018
    store.state.currentDate = '2018-09-26'
    store.state.nextARDate = '2018-09-26'
    store.state.currentFilingStatus = 'NEW'
    store.state.registeredAddress = {}
    store.state.recordsAddress = {}

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/BC0007291/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save" endpoint - garbage response data, we aren't testing that
    spy = sinon
      .stub(axios, 'post')
      .withArgs('businesses/BC0007291/filings')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                annualReport: {},
                business: {},
                header: {
                  filingId: 123
                }
              }
            }
          })
        )
      )

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
      sync: false,
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        SummaryDirectors: true,
        SummaryOfficeAddresses: true,
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
    vm = wrapper.vm

    // no need to set up directors or office addresses - just use initial values

    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes Directors, Registered Address, and Records Address in AR filing data', async () => {
    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    // get the payload of the ajax call
    // - the first index (0) is to get the first call, where there could be many calls to the stubbed function
    // - the second index (1) is to get the second param - data - where the call is axios.post(url, data)
    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()

    expect(payload.filing.annualReport.directors).toBeDefined()
    expect(payload.filing.annualReport.offices.registeredOffice).toBeDefined()
    expect(payload.filing.annualReport.offices.recordsOffice).toBeDefined()
  })

  it('includes certification data in the header', async () => {
    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.header).toBeDefined()

    expect(payload.filing.header.certifiedBy).toBeDefined()
    expect(payload.filing.header.email).toBeDefined()

    expect(payload.filing.header.routingSlipNumber).toBeUndefined() // normally not saved
  })

  it('includes the AR Date for the current filing year', async () => {
    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    button.trigger('click')
    await flushPromises()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.annualReportDate).toBeDefined()

    expect(payload.filing.annualReport.annualReportDate.substr(0, 4)).toBe(currentFilingYear.toString())
  })
})

describe('Annual Report - Part 6 - Error/Warning Dialogs', () => {
  let wrapper: Wrapper<Vue>
  let vm: any
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
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityName = 'Legal Name - CP0001191'
    store.state.ARFilingYear = 2017
    store.state.currentFilingStatus = 'NEW'
    store.state.arMinDate = '2017-01-01'
    store.state.arMaxDate = '2018-04-30'

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "file post" endpoint
    const p1 = Promise.reject({
      response: {
        status: 400,
        data: {
          errors: [
            { error: 'err msg post' }
          ],
          warnings: [
            { warning: 'warn msg post' }
          ],
          filing: {
            annualReport: {
              annualGeneralMeetingDate: '2018-07-15'
            },
            business: {
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'annualReport',
              date: '2017-06-06',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123
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
          errors: [
            { error: 'err msg put' }
          ],
          warnings: [
            { warning: 'warn msg put' }
          ],
          filing: {
            annualReport: {
              annualGeneralMeetingDate: '2018-07-15'
            },
            business: {
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
              legalName: 'Legal Name - CP0001191'
            },
            header: {
              name: 'annualReport',
              date: '2017-06-06',
              submitter: 'cp0001191',
              status: 'DRAFT',
              certifiedBy: 'Full Name',
              email: 'no_one@never.get',
              filingId: 123
            }
          }
        }
      }
    })
    p2.catch(() => { }) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'put').withArgs('businesses/CP0001191/filings/123').returns(p2)

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    vm = wrapper.vm
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('sets the required fields to display errors from the api after a POST call', async () => {
    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // click the File & Pay button
    await vm.$el.querySelector('#ar-file-pay-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify error dialog
    expect(vm.saveErrorReason).toBeTruthy()
    expect(vm.saveErrors.length).toBe(1)
    expect(vm.saveErrors[0].error).toBe('err msg post')
    expect(vm.saveWarnings.length).toBe(1)
    expect(vm.saveWarnings[0].warning).toBe('warn msg post')
  })

  it('sets the required fields to display errors from the api after a PUT call', async () => {
    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // set the filingId
    vm.filingId = 123

    // click the File & Pay button
    await vm.$el.querySelector('#ar-file-pay-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify error dialog
    expect(vm.saveErrorReason).toBeTruthy()
    expect(vm.saveErrors.length).toBe(1)
    expect(vm.saveErrors[0].error).toBe('err msg put')
    expect(vm.saveWarnings.length).toBe(1)
    expect(vm.saveWarnings[0].warning).toBe('warn msg put')
  })
})

describe('Annual Report - Part 7 - Concurrent Saves', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  store.state.entityName = 'Legal Name - CP0001191'
  store.state.entityType = 'CP'
  store.state.ARFilingYear = 2017
  store.state.currentFilingStatus = 'NEW'
  store.state.identifier = 'CP0001191'
  store.state.arMinDate = '2017-01-01'
  store.state.arMaxDate = '2018-04-30'

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    vm = wrapper.vm

    // mock "get tasks" endpoint
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/CP0001191/tasks')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              tasks: [
                {
                  task: {
                    filing: {
                      header: {
                        name: 'annualReport',
                        ARFilingYear: 2017,
                        status: 'DRAFT'
                      }
                    }
                  },
                  enabled: true,
                  order: 1
                }
              ]
            }
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('prevents saving if a pending task exists', async () => {
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    vm.directorEditInProgress = false

    // stub address data
    vm.addresses = {
      registeredOffice: {
        deliveryAddress: {},
        mailingAddress: {}
      }
    }

    // click the File & Pay button
    wrapper.find('#ar-file-pay-btn').trigger('click')
    await flushPromises()

    // verify error dialog
    expect(vm.saveErrorReason).toBeTruthy()
    expect(vm.saveErrors.length).toBe(1)
    expect(vm.saveErrors[0].error)
      .toBe('Another draft filing already exists. Please complete it before creating a new filing.')
  })
})

describe('Annual Report - payment required error', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

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
    store.state.identifier = 'CP0001191'
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
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'CP0001191',
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

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
      store,
      localVue,
      router,
      stubs: {
        ArDate: true,
        AgmDate: true,
        OfficeAddresses: true,
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
    vm = wrapper.vm
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('handles error on File and Save', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('AUTH_WEB_URL', 'https://auth.web.url/')
    const get = sinon.stub(axios, 'get')

    get.withArgs('businesses/CP0001191/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // make sure form is validated
    vm.agmDateValid = true
    vm.addressesFormValid = true
    vm.directorFormValid = true
    vm.certifyFormValid = true
    vm.directorEditInProgress = false
    store.state.filingData = [{ filingTypeCode: 'OTANN', entityType: 'CP' }] // dummy data

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

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await vm.$el.querySelector('#ar-file-pay-btn').click()
    // wait for save to complete and everything to update
    await flushPromises()

    // verify an error has been received
    expect(vm.saveErrors).toStrictEqual([{ message: 'payment required' }])

    wrapper.destroy()
  })
})
