import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import NoticeOfWithdrawal from '@/views/NoticeOfWithdrawal.vue'
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog }
  from '@/components/dialogs'
import { Certify } from '@/components/common'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import RecordToBeWithdrawn from '@/components/NoticeOfWithdrawal/RecordToBeWithdrawn.vue'
import ReferenceNumber from '@/components/NoticeOfWithdrawal/ReferenceNumber.vue'
import StaffPayment from '@/components/NoticeOfWithdrawal/StaffPayment.vue'

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
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Notice of Withdrawal view', () => {
  beforeEach(() => {
    // init store
    rootStore.keycloakRoles = ['staff']
  })

  it('mounts the sub-components properly', async () => {
    const $route = { query: { filingId: '0' }, params: { filingToBeWithdrawn: '12345' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)

    const wrapper = shallowMount(NoticeOfWithdrawal, { mocks: { $route } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    expect(wrapper.findComponent(Certify).exists()).toBe(true)
    expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentDelivery).exists()).toBe(true)
    expect(wrapper.findComponent(PaymentErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(ResumeErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(SaveErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(RecordToBeWithdrawn).exists()).toBe(true)
    expect(wrapper.findComponent(ReferenceNumber).exists()).toBe(true)
    expect(wrapper.findComponent(StaffPayment).exists()).toBe(true)

    // Verify $route params and query
    expect(wrapper.vm.filingToBeWithdrawn).toBe('12345')
    expect(wrapper.vm.filingId).toBe(0)

    wrapper.destroy()
  })

  it('sets filing data properly', async () => {
    const $route = { query: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(NoticeOfWithdrawal, { mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    const vm: any = wrapper.vm

    // verify initial Filing Data
    vm.certifyFormValid = true
    vm.documentDeliveryValid = true
    vm.referenceNumberValid = true
    vm.staffPaymentValid = true

    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('NOTICE_OF_WITHDRAWAL')
    expect(vm.filingData[0].entityType).toBe('BC_COMPANY')

    wrapper.destroy()
  })

  it('sets computed states properly', () => {
    // mock $route
    const $route = { query: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(NoticeOfWithdrawal, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify "validated" - all true
    vm.certifyFormValid = true
    vm.documentDeliveryValid = true
    vm.referenceNumberValid = true
    vm.staffPaymentValid = true
    expect(vm.isPageValid).toBe(true)

    // verify "validated" - invalid Certify form
    vm.certifyFormValid = false
    vm.documentDeliveryValid = true
    vm.referenceNumberValid = true
    vm.staffPaymentValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Document Delivery form
    vm.certifyFormValid = true
    vm.documentDeliveryValid = false
    vm.referenceNumberValid = true
    vm.staffPaymentValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Reference Number form
    vm.certifyFormValid = true
    vm.documentDeliveryValid = true
    vm.referenceNumberValid = false
    vm.staffPaymentValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Staff Payment form
    vm.certifyFormValid = true
    vm.documentDeliveryValid = true
    vm.referenceNumberValid = true
    vm.staffPaymentValid = false
    expect(vm.isPageValid).toBe(false)

    wrapper.destroy()
  })
})
