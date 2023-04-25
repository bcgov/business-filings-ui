import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import ConsentContinuationOut from '@/views/ConsentContinuationOut.vue'
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog, StaffPaymentDialog }
  from '@/components/dialogs'
import { Certify, DetailComment } from '@/components/common'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import axios from '@/axios-auth'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import sinon from 'sinon'
import VueRouter from 'vue-router'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const store = getVuexStore() as any // remove typings for unit tests
const localVue = createLocalVue()
localVue.use(VueRouter)

describe('Consent to Continuation Out view', () => {
  beforeEach(() => {
    store.commit('setTestConfiguration', { key: 'VUE_APP_PAY_API_URL', value: 'https://pay.web.url/' })

    // init store
    store.state.currentDate = '2020-03-04'
    store.commit('setLegalType', 'CP')
    store.commit('setLegalName', 'My Test Entity')
    store.commit('setIdentifier', 'CP1234567')
    store.commit('setFoundingDate', '1971-05-12T00:00:00-00:00')
    store.state.filingData = []
    store.state.keycloakRoles = ['staff'] // consent to continuation outs currently apply to staff only
  })

  afterEach(() => {
    sinon.restore()
  })

  it('mounts the sub-components properly', async () => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentContinuationOut, { store, mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    // verify sub-components
    expect(wrapper.findComponent(Certify).exists()).toBe(true)
    expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true)
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.findComponent(DetailComment).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentDelivery).exists()).toBe(true)
    expect(wrapper.findComponent(PaymentErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(ResumeErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(SaveErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(StaffPaymentDialog).exists()).toBe(true)
    wrapper.destroy()
  })

  it('sets filing data properly', async () => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentContinuationOut, { store, mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    const vm: any = wrapper.vm

    // verify initial Filing Data
    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('CONTO')
    expect(vm.filingData[0].entityType).toBe('CP')
    wrapper.destroy()
  })

  it('sets computed states properly', () => {
    // mock $route
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentContinuationOut, { store, mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify "isPayRequired" with no fee
    vm.totalFee = 0
    expect(!!vm.isPayRequired).toBe(false)

    // verify "isPayRequired" with a fee
    vm.totalFee = 350
    expect(!!vm.isPayRequired).toBe(true)

    // verify "validated" - all true
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    expect(!!vm.isPageValid).toBe(true)

    // verify "validated" - invalid Detail Comment form
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = false
    vm.documentDeliveryValid = true
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid Certify form
    vm.certifyFormValid = false
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid Court Order form
    vm.certifyFormValid = true
    vm.courtOrderValid = false
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid Document Delivery form
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = false
    expect(!!vm.isPageValid).toBe(false)

    wrapper.destroy()
  })

  it('saves draft consent to continuation out properly', async () => {
    // mock "save draft" endpoint (garbage response data - we aren't testing that)
    sinon.stub(axios, 'post')
      .withArgs('businesses/CP1234567/filings?draft=true')
      .returns(new Promise(resolve =>
        resolve({
          data: {
            filing: {
              business: {},
              header: { filingId: 456 },
              consentContinuationOut: { details: 'test' },
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '456' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-continuation-out', params: { filingId: '0' } })

    const wrapper = shallowMount(ConsentContinuationOut, {
      store,
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    // wait for fetch to complete
    await flushPromises()

    const button = wrapper.find('#consent-save-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the Save button
    await button.trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify new Filing ID
    expect(vm.filingId).toBe(456)

    wrapper.destroy()
  })

  it('resumes draft consent to continuation out properly with FAS staff payment', async () => {
    // mock "get draft consent to continue out" endpoint
    sinon.stub(axios, 'get')
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
                name: 'consentContinuationOut',
                status: 'DRAFT',
                certifiedBy: 'Johnny Certifier',
                routingSlipNumber: '123456789',
                priority: true
              },
              consentContinuationOut: {
                details: 'Line 1\nLine 2\nLine 3'
              },
              annualReport: {}
            }
          }
        })
      ))

    // mock $route
    const $route = { params: { filingId: '456' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-continuation-out', params: { filingId: '0' } })

    const wrapper = shallowMount(ConsentContinuationOut, {
      store,
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
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
})
