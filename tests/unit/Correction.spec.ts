// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import mockRouter from './mockRouter'
import flushPromises from 'flush-promises'

// Components
import Correction from '@/views/Correction.vue'
import { DetailComment, Certify } from '@/components/common'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const store = getVuexStore() as any // remove typings for unit tests

describe('Correction - UI', () => {
  let sinonAxiosGet: any

  beforeEach(() => {
    sinonAxiosGet = sinon.stub(axios, 'get')

    // mock "get orig filing" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP1234567/filings/123')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {
                identifier: 'CP1234567',
                legalName: 'My Test Entity'
              },
              header: {
                name: 'annualReport',
                status: 'COMPLETED',
                date: '2018-12-24T00:00:00+00:00'
              },
              annualReport: {
                annualReportDate: '2018-06-26'
              }
            }
          }
        })
      ))

    // init store
    store.state.currentDate = '2020-03-04'
    store.state.entityType = 'CP'
    store.state.entityName = 'My Test Entity'
    store.state.identifier = 'CP1234567'
    store.state.entityFoundingDate = new Date('1971-05-12T00:00:00-00:00')
    store.state.filingData = []
    store.state.keycloakRoles = ['staff'] // corrections currently apply to staff only
  })

  afterEach(() => {
    sinon.restore()
  })

  it('mounts the sub-components properly', () => {
    // mock $route
    const $route = { params: { filingId: '0', correctedFilingId: '123' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(Correction, { store, mocks: { $route, $router } })

    // verify sub-components
    expect(wrapper.findComponent(DetailComment).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)
    expect(wrapper.findComponent(SbcFeeSummary).exists()).toBe(true)

    // verify rendered page
    expect(wrapper.find('#correction-header').text()).toBe('Correction —')
    expect(wrapper.find('#correction-step-1-header').text()).toBe('1. Detail')
    expect(wrapper.find('#correction-step-2-header').text()).toBe('2. Certify')

    wrapper.destroy()
  })

  it('sets filing data properly', async () => {
    // mock $route
    const $route = { params: { filingId: '0', correctedFilingId: '123' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(Correction, { store, mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // wait for fetch to complete
    await flushPromises()

    // verify initial Filing Data
    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('CRCTN')
    expect(vm.filingData[0].entityType).toBe('CP')
    expect(vm.filingData[0].priority).toBeUndefined()
    expect(vm.filingData[0].waiveFees).toBe(false)

    // verify Is Priority = true
    vm.staffPaymentData = { isPriority: true }
    await flushPromises()
    expect(vm.filingData[0].priority).toBe(true)

    // verify Is Priority = false
    vm.staffPaymentData = { isPriority: false }
    await flushPromises()
    expect(vm.filingData[0].priority).toBe(false)

    // verify Is Waive Fees = true
    vm.staffPaymentData = { option: 0 } // NO_FEE
    await flushPromises()
    expect(vm.filingData[0].waiveFees).toBe(true)

    // verify Is Waive Fees = false
    vm.staffPaymentData = { option: 1 } // FAS
    await flushPromises()
    expect(vm.filingData[0].waiveFees).toBe(false)

    // verify Is Waive Fees = false
    vm.staffPaymentData = { option: 2 } // BCOL
    await flushPromises()
    expect(vm.filingData[0].waiveFees).toBe(false)

    wrapper.destroy()
  })

  it('sets computed states properly', () => {
    // mock $route
    const $route = { params: { filingId: '0', correctedFilingId: '123' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(Correction, { store, mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify "isPayRequired" with no fee
    vm.totalFee = 0
    expect(vm.isPayRequired).toBe(false)

    // verify "isPayRequired" with a fee
    vm.totalFee = 350
    expect(vm.isPayRequired).toBe(true)

    // verify "validated" - all true
    vm.detailCommentValid = true
    vm.certifyFormValid = true
    expect(vm.isPageValid).toBe(true)

    // verify "validated" - invalid Detail Comment form
    vm.detailCommentValid = false
    vm.certifyFormValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Certify form
    vm.detailCommentValid = true
    vm.certifyFormValid = false
    expect(vm.isPageValid).toBe(false)

    wrapper.destroy()
  })

  it('initializes and fetches original filing properly', async () => {
    // mock $route
    const $route = { params: { filingId: '0', correctedFilingId: '123' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'correction', params: { filingId: '0', correctedFilingId: '123' } })

    const wrapper = mount(Correction, {
      store,
      router,
      stubs: {
        DetailComment: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetch to complete
    await flushPromises()

    // verify component state and getters
    expect(vm.filingId).toBe(0)
    expect(vm.correctedFilingId).toBe(123)
    expect(vm.dataLoaded).toBe(true)
    expect(vm.showLoadingContainer).toBe(false)
    expect(vm.title).toBe('Annual Report (2018)')
    expect(vm.agmYear).toBe('2018')
    expect(vm.originalFilingDate).toBe('Dec 23, 2018')
    expect(vm.defaultComment).toBe('Correction for Annual Report (2018), filed on Dec 23, 2018.')

    wrapper.destroy()
  })

  it('saves draft correction properly', async () => {
    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinonAxiosGet
      .withArgs('businesses/CP1234567/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint (garbage response data - we aren't testing that)
    sinon.stub(axios, 'post')
      .withArgs('businesses/CP1234567/filings?draft=true')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {},
              header: { filingId: 456 },
              correction: {},
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '0', correctedFilingId: '123', correctionType: 'CLIENT' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'correction',
      params: { filingId: '0', correctedFilingId: '123', correctionType: 'CLIENT' } })

    const wrapper = mount(Correction, {
      store,
      router,
      stubs: {
        DetailComment: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetch to complete
    await flushPromises()

    // verify initial Filing ID
    expect(vm.filingId).toBe(0)

    const button = wrapper.find('#correction-save-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the Save button
    await button.trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify new Filing ID
    expect(vm.filingId).toBe(456)

    wrapper.destroy()
  })

  it('resumes draft correction properly with FAS staff payment', async () => {
    // mock "get draft correction" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP1234567/filings/456')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {
                identifier: 'CP1234567',
                legalName: 'My Test Entity'
              },
              header: {
                name: 'correction',
                status: 'DRAFT',
                certifiedBy: 'Johnny Certifier',
                routingSlipNumber: '123456789',
                priority: true
              },
              correction: {
                comment: 'Line 1\nLine 2\nLine 3'
              },
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '456', correctedFilingId: '123' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'correction', params: { filingId: '0', correctedFilingId: '123' } })

    const wrapper = mount(Correction, {
      store,
      router,
      stubs: {
        DetailComment: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetches to complete
    await flushPromises()

    expect(vm.certifiedBy).toBe('Johnny Certifier')
    expect(vm.staffPaymentData.option).toBe(1) // FAS
    expect(vm.staffPaymentData.routingSlipNumber).toBe('123456789')
    expect(vm.staffPaymentData.isPriority).toBe(true)
    // NB: line 1 (default comment) should be removed
    expect(vm.detailComment).toBe('Line 2\nLine 3')

    wrapper.destroy()
  })

  it('resumes draft correction properly with FAS staff payment', async () => {
    // mock "get draft correction" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP1234567/filings/456')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {
                identifier: 'CP1234567',
                legalName: 'My Test Entity'
              },
              header: {
                name: 'correction',
                status: 'DRAFT',
                certifiedBy: 'Johnny Certifier',
                bcolAccountNumber: '123456',
                datNumber: 'C1234567',
                folioNumber: '123ABCabc',
                priority: true
              },
              correction: {
                comment: 'Line 1\nLine 2\nLine 3'
              },
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '456', correctedFilingId: '123' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'correction', params: { filingId: '0', correctedFilingId: '123' } })

    const wrapper = mount(Correction, {
      store,
      router,
      stubs: {
        DetailComment: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetches to complete
    await flushPromises()

    expect(vm.certifiedBy).toBe('Johnny Certifier')
    expect(vm.staffPaymentData.option).toBe(2) // BCOL
    expect(vm.staffPaymentData.bcolAccountNumber).toBe('123456')
    expect(vm.staffPaymentData.datNumber).toBe('C1234567')
    expect(vm.staffPaymentData.folioNumber).toBe('123ABCabc')
    expect(vm.staffPaymentData.isPriority).toBe(true)
    // NB: line 1 (default comment) should be removed
    expect(vm.detailComment).toBe('Line 2\nLine 3')

    wrapper.destroy()
  })

  it('resumes draft correction properly with No Fee staff payment', async () => {
    // mock "get draft correction" endpoint
    sinonAxiosGet
      .withArgs('businesses/CP1234567/filings/456')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {
                identifier: 'CP1234567',
                legalName: 'My Test Entity'
              },
              header: {
                name: 'correction',
                status: 'DRAFT',
                certifiedBy: 'Johnny Certifier',
                waiveFees: true
              },
              correction: {
                comment: 'Line 1\nLine 2\nLine 3'
              },
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '456', correctedFilingId: '123' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'correction', params: { filingId: '0', correctedFilingId: '123' } })

    const wrapper = mount(Correction, {
      store,
      router,
      stubs: {
        DetailComment: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetches to complete
    await flushPromises()

    expect(vm.certifiedBy).toBe('Johnny Certifier')
    expect(vm.staffPaymentData.option).toBe(0) // NO_FEE
    expect(vm.staffPaymentData.isPriority).toBeFalsy()
    // NB: line 1 (default comment) should be removed
    expect(vm.detailComment).toBe('Line 2\nLine 3')

    wrapper.destroy()
  })
})
