/* eslint prefer-promise-reject-errors: "off" */

import Vue from 'vue'
import sinon from 'sinon'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import Vuelidate from 'vuelidate'
import axios from '@/axios-auth'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import mockRouter from './mockRouter'
import flushPromises from 'flush-promises'
import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
import AnnualReport from '@/views/AnnualReport.vue'
import AgmDate from '@/components/AnnualReport/AGMDate.vue'
import Directors from '@/components/common/Directors.vue'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import { Certify, OfficeAddresses, SummaryDirectors, SummaryOfficeAddresses } from '@/components/common'
import { ConfigJson } from '@/resources/business-config'
import { CorpTypeCd, FilingStatus } from '@/enums'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

describe('Annual Report - Part 1 - UI', () => {
  beforeEach(() => {
    // init store
    businessStore.setIdentifier('CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'
    rootStore.currentFilingStatus = FilingStatus.NEW
    businessStore.setLegalType(CorpTypeCd.COOP)
    configurationStore.setTestConfiguration({ configuration: null },
      { key: 'VUE_APP_PAY_API_URL', value: 'https://auth.web.url/' })
  })

  it('renders the Annual Report sub-components properly when entity is a Coop', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route } })

    expect(wrapper.findComponent(AgmDate).exists()).toBe(true)
    expect(wrapper.findComponent(OfficeAddresses).exists()).toBe(true)
    expect(wrapper.findComponent(Directors).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Verify AR Certify contains correct section codes', async () => {
    const $route = { params: { filingId: 0 } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route } })
    businessStore.setLegalType(CorpTypeCd.COOP)
    rootStore.configObject = ConfigJson.find(x => x.entityType === businessStore.getLegalType)
    await Vue.nextTick() // wait for DOM to update

    const certify: any = wrapper.findComponent(Certify)
    expect(certify.exists()).toBe(true)
    expect(certify.vm.message).toContain('See Section 126 of the Cooperative Association Act.')
    expect(certify.vm.entityDisplay).toEqual('Cooperative')

    wrapper.destroy()
  })

  it('initializes the store variables properly', () => {
    // set current date in store
    rootStore.currentJsDate = new Date('2019-03T12:00:00')
    rootStore.currentDate = '2019-03-03'

    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    expect(businessStore.getIdentifier).toEqual('CP0001191')
    expect(businessStore.getLegalType).toEqual('CP')
    expect(rootStore.ARFilingYear).toEqual(2017)
    expect(rootStore.currentFilingStatus).toEqual('NEW')

    // check titles and sub-titles
    expect(vm.$el.querySelector('#annual-report-header').textContent).toContain('2017')
    expect(vm.$el.querySelector('#addresses-header span').textContent).toContain('2017-12-31')
    expect(vm.$el.querySelector('#directors-header + p').textContent).toContain('2017-12-31')

    wrapper.destroy()
  })

  it('enables Validated flag when sub-component flags are valid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when AGM Date is invalid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDateValid: false,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Addresses form is invalid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: false,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables address component when AGM Date < Last COA Date', async () => {
    businessStore.setLastAddressChangeDate('2019-05-06')
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDate: '2019-05-05',
      agmDateValid: true,
      addressesFormValid: false,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that change state is disabled
    expect(vm.allowChange('coa')).toBe(false)

    wrapper.destroy()
  })

  it('has no effect on address component when Last COA Date is null', async () => {
    businessStore.setLastAddressChangeDate(null)
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDate: '2019-02-09',
      agmDateValid: true,
      addressesFormValid: false,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that change state is enabled
    expect(vm.allowChange('coa')).toBe(true)

    wrapper.destroy()
  })

  it('disables directors component when AGM Date < Last COD Date', async () => {
    businessStore.setLastDirectorChangeDate('2019-05-06')
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDate: '2019-05-05',
      agmDateValid: true,
      addressesFormValid: false,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that change state is disabled
    expect(vm.allowChange('cod')).toBe(false)

    wrapper.destroy()
  })

  it('disables directors component when Last COD Date is null', async () => {
    businessStore.setLastDirectorChangeDate(null)
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDate: '2019-02-09',
      agmDateValid: true,
      addressesFormValid: false,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that change state is enabled
    expect(vm.allowChange('cod')).toBe(true)

    wrapper.destroy()
  })

  it('disables Validated flag when Director form is invalid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: false,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('disables Validated flag when Certify form is invalid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: false
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('enables File & Pay button when form is validated', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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

    // make sure form is validated
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true,
      directorEditInProgress: false
    })

    // confirm that button is enabled
    expect(wrapper.find('#ar-file-pay-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when form is not validated', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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

    // set local properties
    await wrapper.setData({
      agmDateValid: false,
      addressesFormValid: false,
      directorFormValid: false,
      certifyFormValid: false
    })

    // confirm that button is disabled
    expect(wrapper.find('#ar-file-pay-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })
})

describe('Annual Report - Part 1B - UI (BCOMP)', () => {
  beforeEach(() => {
    // init store
    businessStore.setIdentifier('BC0007291')
    rootStore.ARFilingYear = 2018
    rootStore.nextARDate = '2018-09-26'
    rootStore.currentFilingStatus = FilingStatus.NEW
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  })

  it('renders the Annual Report sub-components properly when entity is a BCOMP', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route } })

    expect(wrapper.findComponent(ArDate).exists()).toBe(true)
    expect(wrapper.findComponent(SummaryOfficeAddresses).exists()).toBe(true)
    expect(wrapper.findComponent(SummaryDirectors).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)

    wrapper.destroy()
  })

  it('initializes the store variables properly', () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    expect(businessStore.getIdentifier).toEqual('BC0007291')
    expect(businessStore.getLegalType).toEqual('BEN')
    expect(rootStore.ARFilingYear).toEqual(2018)
    expect(rootStore.nextARDate).toEqual('2018-09-26')
    expect(rootStore.currentFilingStatus).toEqual('NEW')

    // check titles and sub-titles
    expect(vm.$el.querySelector('#annual-report-header-BC').textContent).toContain('2018')

    wrapper.destroy()
  })

  it('enables Validated flag when sub-component flags are valid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({ certifyFormValid: true })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    wrapper.destroy()
  })

  it('disables Validated flag when Certify form is invalid', async () => {
    const $route = { params: { filingId: '0' } } // new filing id
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // set local properties
    await wrapper.setData({ certifyFormValid: false })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(false)

    wrapper.destroy()
  })

  it('enables File & Pay button when form is validated', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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

    // make sure form is validated
    await wrapper.setData({
      certifyFormValid: true,
      directorEditInProgress: false
    })

    // confirm that button is enabled
    expect(wrapper.find('#ar-file-pay-bc-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('disables File & Pay button when form is not validated', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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

    // set properties
    await wrapper.setData({ certifyFormValid: false })

    // confirm that button is disabled
    expect(wrapper.find('#ar-file-pay-bc-btn').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })
})

describe('Annual Report - Part 2A - Resuming with FAS staff payment', () => {
  beforeEach(() => {
    // init store
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.DRAFT)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises() // wait for draft to be fetched

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
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.DRAFT)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises() // wait for draft to be fetched

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
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.DRAFT)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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
    const wrapper = shallowMount(AnnualReport, { mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await flushPromises() // wait for draft to be fetched

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
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true,
      directorEditInProgress: false
    })
    rootStore.filingData = [
      {
        filingTypeCode: 'OTCDR',
        entityType: CorpTypeCd.COOP
      } as any
    ] // dummy data

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('updates an existing filing and routes to the dashboard when this is a draft AR and the File & Pay button ' +
    'is clicked and payment action is not required', async () => {
    // set necessary session variables
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '123' } }) // existing filing id

    const wrapper = mount(AnnualReport, {
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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true,
      directorEditInProgress: false
    })
    rootStore.filingData = [
      {
        filingTypeCode: 'OTCDR',
        entityType: CorpTypeCd.COOP
      } as any
    ] // dummy data

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // make sure a fee is required
    vm.totalFee = 100

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

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
    businessStore.setIdentifier('BC0007291')
    businessStore.setLegalName('Legal Name - BC0007291')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.ARFilingYear = 2018
    rootStore.nextARDate = '2018-09-26'
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.setRegisteredAddress({} as any)
    rootStore.setRecordsAddress({} as any)

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
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(AnnualReport, {
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
    await wrapper.setData({ certifyFormValid: true })
    rootStore.filingData = [
      {
        filingTypeCode: 'ANNBC',
        entityType: CorpTypeCd.BENEFIT_COMPANY
      } as any
    ] // dummy data

    // make sure a fee is required
    await wrapper.setData({ totalFee: 100 })
    await Vue.nextTick()

    // sanity checks
    expect(jest.isMockFunction(window.location.assign)).toBe(true)
    expect(vm.isPageValid).toEqual(true)
    expect(vm.busySaving).toEqual(false)

    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await button.trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('Annual Report - Part 4 - Saving', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(() => {
    // init store
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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

    wrapper = shallowMount(AnnualReport, { localVue, router, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('saves a new filing when the Save button is clicked', async () => {
    // make sure form is validated
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        },
        recordsOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // click the Save button
    await wrapper.find('#ar-save-btn').trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify no routing
    expect(vm.$route.name).toBe('annual-report')
  })

  it('saves a filing and routes to Dashboard URL when the Save & Resume button is clicked', async () => {
    // make sure form is validated
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        },
        recordsOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // click the Save & Resume Later button
    // await wrapper.find('#ar-save-resume-btn').trigger('click')
    // work-around because click trigger isn't working
    await vm.onClickSaveResume()

    // verify routing back to Dashboard URL
    expect(vm.$route.name).toBe('dashboard')
  })

  it('routes to Dashboard URL when the Cancel button is clicked', async () => {
    // make sure form is validated
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // click the Cancel button
    // await wrapper.find('#ar-cancel-btn').trigger('click')
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

  beforeEach(async () => {
    // init store
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = currentFilingYear
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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

    wrapper = shallowMount(AnnualReport, { localVue, router, vuetify })
    vm = wrapper.vm

    // set up director data
    await wrapper.setData({
      updatedDirectors: [
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
    })

    // stub address data
    await wrapper.setData({
      updatedAddresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        },
        recordsOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // make sure form is validated
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes Directors, Office Mailing Address, and Office Delivery Address in AR filing data', async () => {
    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
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
    // await wrapper.find('#ar-save-btn').trigger('click')
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    const names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).toContain('Unchanged')
  })

  it('includes appointed directors in AR filing data', async () => {
    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    const names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).toContain('Appointed')
  })

  it('does NOT include ceased directors in AR filing data', async () => {
    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
    // work-around because click trigger isn't working
    await vm.onClickSave()

    const payload = spy.args[0][1]

    // basic tests to pass ensuring structure of payload is as expected
    expect(payload.filing).toBeDefined()
    expect(payload.filing.annualReport).toBeDefined()
    expect(payload.filing.annualReport.directors).toBeDefined()

    const names = payload.filing.annualReport.directors.map(el => el.officer.firstName)
    expect(names).not.toContain('Ceased')
  })

  it('includes certification data in the header', async () => {
    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
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
    rootStore.currentJsDate = new Date('2019-03T12:00:00')
    rootStore.currentDate = '2019-03-03'

    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
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
    rootStore.currentJsDate = new Date('2019-03T12:00:00')
    rootStore.currentDate = '2019-03-03'

    // set No AGM
    await wrapper.setData({ didNotHoldAgm: true })

    // click the Save button
    // await wrapper.find('#ar-save-btn').trigger('click')
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

  beforeEach(async () => {
    // init store
    businessStore.setIdentifier('BC0007291')
    businessStore.setLegalName('Legal Name - BC0007291')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.ARFilingYear = 2018
    rootStore.currentDate = '2018-09-26'
    rootStore.nextARDate = '2018-09-26'
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.setRegisteredAddress({} as any)
    rootStore.setRecordsAddress({} as any)

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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('includes Directors, Registered Address, and Records Address in AR filing data', async () => {
    const button = wrapper.find('#ar-file-pay-bc-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await button.trigger('click')

    // wait for save to complete and everything to update
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
    await button.trigger('click')

    // wait for save to complete and everything to update
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
    await button.trigger('click')

    // wait for save to complete and everything to update
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
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'

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
    p1.catch(() => {}) // pre-empt "unhandled promise rejection" warning
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
    p2.catch(() => {}) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'put').withArgs('businesses/CP0001191/filings/123').returns(p2)

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true
    })

    // confirm that flags are set correctly
    expect(vm.isPageValid).toEqual(true)

    // sanity check
    expect(jest.isMockFunction(window.location.assign)).toBe(true)

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // set the filingId
    await wrapper.setData({ filingId: 123 })

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

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

  beforeAll(() => {
    businessStore.setLegalName('Legal Name - CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)
    businessStore.setIdentifier('CP0001191')
    rootStore.arMinDate = '2017-01-01'
    rootStore.arMaxDate = '2018-04-30'
  })

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true,
      directorEditInProgress: false
    })

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

    // wait for save to complete and everything to update
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
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('Legal Name - CP0001191')
    rootStore.ARFilingYear = 2017
    rootStore.setCurrentFilingStatus(FilingStatus.NEW)

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
    p1.catch(() => {}) // pre-empt "unhandled promise rejection" warning
    sinon.stub(axios, 'post').withArgs('businesses/CP0001191/filings').returns(p1)

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'annual-report', params: { filingId: '0' } }) // new filing id

    wrapper = mount(AnnualReport, {
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
    await wrapper.setData({
      agmDateValid: true,
      addressesFormValid: true,
      directorFormValid: true,
      certifyFormValid: true,
      directorEditInProgress: false
    })
    rootStore.filingData = [
      {
        filingTypeCode: 'OTANN',
        entityType: CorpTypeCd.COOP
      } as any
    ] // dummy data

    // stub address data
    await wrapper.setData({
      addresses: {
        registeredOffice: {
          deliveryAddress: {},
          mailingAddress: {}
        }
      }
    })

    // make sure a fee is required
    await wrapper.setData({ totalFee: 100 })

    // sanity check
    expect(vm.saveErrors).toStrictEqual([])

    const button = wrapper.find('#ar-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await wrapper.find('#ar-file-pay-btn').trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify an error has been received
    expect(vm.saveErrors).toStrictEqual([{ message: 'payment required' }])

    wrapper.destroy()
  })
})
