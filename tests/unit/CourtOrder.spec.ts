import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import CourtOrder from '@/views/CourtOrder.vue'
import { FileUploadPdf } from '@/components/common'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import vuetify from 'sbc-common-components/src/plugins/vuetify'

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
const rootStore = useRootStore()
const configurationStore = useConfigurationStore()

describe('Court Order View', () => {
  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: vi.fn() } as any

    // set configurations
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }
    configurationStore.setConfiguration(configuration)

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
  })

  beforeEach(() => {
    // init store
    rootStore.currentDate = '2020-03-04'
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('CP1234567')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []
    rootStore.keycloakRoles = ['staff']
    const localVue = createLocalVue()
    localVue.use(VueRouter)
  })

  it('mounts the sub-components properly', async () => {
    const $route = { query: { filingId: '0' } }

    // create local Vue and mock router
    const $router = mockRouter.mock()

    const wrapper = shallowMount(CourtOrder, { mocks: { $route, $router } })

    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    // verify sub-components
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.findComponent(FileUploadPdf).exists()).toBe(true)
    expect(wrapper.findComponent(SbcFeeSummary).exists()).toBe(true)

    wrapper.destroy()
  })

  it('should validate fields when saving', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(CourtOrder, { mocks: { $route, $router } })

    await wrapper.setData({
      notation: '', // Empty notation
      courtOrderNumber: '12345'
    })

    // Trigger save action
    const saveButton = wrapper.find('#dialog-save-button')
    await saveButton.trigger('click')

    // Check for validation error
    expect(wrapper.vm.showErrors).toBe(true)
    expect(wrapper.vm.isPageValid).toBe(false)
  })

  it('sets computed states properly', async () => {
    // mock $route
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(CourtOrder, { mocks: { $route, $router },
      data () {
        return {
          filingData: ['0'], // Non-empty array
          courtOrderValid: true, // courtOrderValid is true
          staffPaymentValid: true // staffPaymentValid is true
        }
      } })
    const vm: any = wrapper.vm

    // Trigger a re-evaluation of the computed property (could be necessary for async changes)
    await wrapper.vm.$nextTick()

    // Check if the computed property isPageValid returns true
    expect(vm.isPageValid).toBe(true)

    // verify "validated" - invalid Staff Payment form
    vm.staffPaymentValid = false
    vm.courtOrderValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Court Order section
    vm.staffPaymentValid = true
    vm.courtOrderValid = false
    expect(vm.isPageValid).toBe(false)

    wrapper.destroy()
  })

  it('saves a new filing when the File & Pay button is clicked', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'court-order', query: { filingId: '0' } })

    const wrapper = mount(CourtOrder, {
      localVue,
      router,
      stubs: {
        CourtOrderPoa: true,
        SbcFeeSummary: true
      },
      vuetify
    })
    const vm: any = wrapper.vm

    // make sure form is validated
    await wrapper.setData({
      courtOrderValid: true
    })

    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    expect(vm.isPageValid).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 20

    const saveButton = wrapper.find('#dialog-save-button')
    expect(saveButton.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await saveButton.trigger('click')

    // Check for validation error
    expect(wrapper.vm.showErrors).toBe(false)
  })
})

describe('Court Order View User', () => {
  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: vi.fn() } as any

    // set configurations
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }
    configurationStore.setConfiguration(configuration)

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
  })

  beforeEach(() => {
    // init store
    rootStore.currentDate = '2020-03-04'
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('CP1234567')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []
    rootStore.keycloakRoles = ['user']
    const localVue = createLocalVue()
    localVue.use(VueRouter)
  })

  it('throws an error when user is not staff', async () => {
    const $route = { query: { filingId: '0' } }

    // create local Vue and mock router
    const $router = mockRouter.mock()

    let errorThrown = false

    try {
      // Mocking the condition where the user is not staff
      shallowMount(CourtOrder, {
        mocks: { $route, $router }
      })
    } catch (error) {
      errorThrown = true
      expect(error.message).toBe('This is a Staff only Filing.')
    }

    // Assert that the error was thrown
    expect(errorThrown).toBe(true)
  })
})
