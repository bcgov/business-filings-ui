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
import { DetailComment, Certify, StaffPayment } from '@/components/common'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

// suppress "avoid mutating a prop directly" warnings
// https://vue-test-utils.vuejs.org/api/config.html#silent
Vue.config.silent = true

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()

describe('Correction - UI', () => {
  let sinonAxiosGet

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
    store.state.entityIncNo = 'CP1234567'
    store.state.entityFoundingDate = '1971-05-12T00:00:00-00:00'
    store.state.filingData = []
    store.state.keycloakRoles = ['staff'] // corrections currently apply to staff only
  })

  afterEach(() => {
    sinon.restore()
  })

  it('mounts the sub-components properly', () => {
    // mock $route
    const $route = { params: {} }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(Correction, { store, mocks: { $route, $router } })

    // verify sub-components
    expect(wrapper.find(DetailComment).exists()).toBe(true)
    expect(wrapper.find(Certify).exists()).toBe(true)
    expect(wrapper.find(StaffPayment).exists()).toBe(true)
    expect(wrapper.find(SbcFeeSummary).exists()).toBe(true)

    // verify rendered page
    expect(wrapper.find('#correction-header').text()).toBe('Correction —')
    expect(wrapper.find('#correction-step-1-header').text()).toBe('1. Detail')
    expect(wrapper.find('#correction-step-2-header').text()).toBe('2. Certify')
    expect(wrapper.find('#correction-step-3-header').text()).toBe('3. Staff Payment')

    wrapper.destroy()
  })

  it('sets filing data properly', () => {
    // mock $route
    const $route = { params: {} }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(Correction, { store, mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify initial Filing Data
    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('CRCTN')
    expect(vm.filingData[0].entityType).toBe('CP')
    expect(vm.filingData[0].priority).toBe(false)
    expect(vm.filingData[0].waiveFees).toBe(false)

    // verify Is Priority true
    vm.isPriority = true
    expect(vm.filingData[0].priority).toBe(true)

    // verify Is Priority false
    vm.isPriority = false
    expect(vm.filingData[0].priority).toBe(false)

    // verify Is Waive Fees true
    vm.isWaiveFees = true
    expect(vm.filingData[0].waiveFees).toBe(true)

    // verify Is Waive Fees false
    vm.isWaiveFees = false
    expect(vm.filingData[0].waiveFees).toBe(false)

    wrapper.destroy()
  })

  it('sets computed states properly', () => {
    // mock $route
    const $route = { params: {} }

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
    vm.staffPaymentFormValid = true
    vm.detailCommentValid = true
    vm.certifyFormValid = true
    expect(vm.validated).toBe(true)

    // verify "validated" - invalid Staff Payment form
    vm.staffPaymentFormValid = false
    vm.detailCommentValid = true
    vm.certifyFormValid = true
    expect(vm.validated).toBe(false)

    // verify "validated" - invalid Detail Comment form
    vm.staffPaymentFormValid = true
    vm.detailCommentValid = false
    vm.certifyFormValid = true
    expect(vm.validated).toBe(false)

    // verify "validated" - invalid Certify form
    vm.staffPaymentFormValid = true
    vm.detailCommentValid = true
    vm.certifyFormValid = false
    expect(vm.validated).toBe(false)

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
        StaffPayment: true,
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
    expect(vm.agmYear).toBe(2018)
    expect(vm.originalFilingDate).toBe('2018-12-23')
    expect(vm.defaultComment).toBe('Correction for Annual Report (2018). Filed on 2018-12-23.')

    wrapper.destroy()
  })

  it('saves draft correction properly', async () => {
    // mock "get tasks" endpoint - needed for hasTasks()
    sinonAxiosGet
      .withArgs('businesses/CP1234567/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save draft" endpoint (garbage response data - we aren't testing that)
    const spy = sinon
      .stub(axios, 'post')
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
        StaffPayment: true,
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
    button.trigger('click')
    await flushPromises()

    // verify new Filing ID
    expect(vm.filingId).toBe(456)

    wrapper.destroy()
  })

  it('resumes draft correction properly', async () => {
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
                // NB: it's not valid to have both "priority" and "waiveFees" true
                // but we're just testing that these values are restored properly
                priority: true,
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
        StaffPayment: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetches to complete
    await flushPromises()

    expect(vm.certifiedBy).toBe('Johnny Certifier')
    expect(vm.routingSlipNumber).toBe('123456789')
    expect(vm.isPriority).toBe(true)
    expect(vm.isWaiveFees).toBe(true)
    // NB: line 1 (default comment) should be removed
    expect(vm.detailComment).toBe('Line 2\nLine 3')

    wrapper.destroy()
  })
})
