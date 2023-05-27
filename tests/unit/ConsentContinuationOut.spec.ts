import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import ConsentContinuationOut from '@/views/ConsentContinuationOut.vue'
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog, StaffPaymentDialog }
  from '@/components/dialogs'
import { Certify, DetailComment } from '@/components/common'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import { LegalServices } from '@/services'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const localVue = createLocalVue()
localVue.use(VueRouter)
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

describe('Consent to Continuation Out view', () => {
  beforeEach(() => {
    // init store
    rootStore.currentDate = '2020-03-04'
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('CP1234567')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []
    rootStore.keycloakRoles = ['staff'] // consent to continuation outs currently apply to staff only
  })

  it('mounts the sub-components properly', async () => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentContinuationOut, { mocks: { $route, $router } })
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

    const wrapper = shallowMount(ConsentContinuationOut, { mocks: { $route, $router } })
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

    const wrapper = shallowMount(ConsentContinuationOut, { mocks: { $route, $router } })
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
    // mock "has pending tasks" legal service
    jest.spyOn(LegalServices, 'hasPendingTasks').mockImplementation((): any => {
      return Promise.resolve(false)
    })

    // mock "create filing" legal service
    // (garbage response data - we aren't testing that)
    jest.spyOn(LegalServices, 'createFiling').mockImplementation((): any => {
      return Promise.resolve({
        business: {},
        header: { filingId: 456 },
        consentContinuationOut: { details: 'test' },
        annualReport: {}
      })
    })

    // mock $route
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-continuation-out' })

    const wrapper = shallowMount(ConsentContinuationOut, {
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

    // call the save action (since clicking button doesn't work)
    await vm.onClickSave()

    // verify new Filing ID
    expect(vm.filingId).toBe(456)

    wrapper.destroy()
  })

  it('resumes draft consent to continuation out properly with FAS staff payment', async () => {
    // mock "fetch filing" legal service
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve({
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
      })
    })

    // mock $route
    const $route = { params: { filingId: '456' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-continuation-out' })

    const wrapper = shallowMount(ConsentContinuationOut, {
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
