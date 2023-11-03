import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import AgmExtension from '@/views/AgmExtension.vue'
import { ConfirmDialog, NotEligibleExtensionDialog, PaymentErrorDialog } from '@/components/dialogs'
import { Certify } from '@/components/common'
import { ExpandableHelp } from '@bcrs-shared-components/expandable-help'
import AgmExtensionHelp from '@/components/AgmExtension/AgmExtensionHelp.vue'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'
import ExtensionRequest from '@/components/AgmExtension/ExtensionRequest.vue'
import { LegalServices } from '@/services'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import { CorpTypeCd, FilingCodes } from '@/enums'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
const vuetify = new Vuetify({})

const localVue = createLocalVue()
localVue.use(VueRouter)
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('AGM Extension view', () => {
  let wrapper: any

  beforeAll(() => {
    // init store
    rootStore.currentDate = '2023-11-06'
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setLegalName('My Benefit Company')
    businessStore.setIdentifier('BC1234567')
    businessStore.setFoundingDate('2000-01-01T08:00:00-00:00')
    rootStore.filingData = []
  })

  beforeEach(() => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    wrapper = mount(AgmExtension, {
      mocks: { $route, $router },
      stubs: {
        ConfirmDialog: true,
        PaymentErrorDialog: true,
        NotEligibleExtensionDialog: true,
        AboutTheBusiness: true,
        ExtensionRequest: true,
        AgmExtensionEvaluation: true
      },
      vuetify
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('displays the view properly', async () => {
    // verify dialogs and sub-components
    expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true)
    expect(wrapper.findComponent(PaymentErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(NotEligibleExtensionDialog).exists()).toBe(true)
    expect(wrapper.findComponent(ExpandableHelp).exists()).toBe(true)
    expect(wrapper.findComponent(AgmExtensionHelp).exists()).toBe(true)
    expect(wrapper.findComponent(AboutTheBusiness).exists()).toBe(true)
    expect(wrapper.findComponent(ExtensionRequest).exists()).toBe(true)
    expect(wrapper.findComponent(AgmExtensionEvaluation).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)

    // verify titles
    expect(wrapper.find('article > h1').text()).toBe('AGM Extension')
    expect(wrapper.find('article > header > h2').text()).toBe('Extension Detail')
    expect(wrapper.find('article > header > p').text()).toContain('Enter the details about')
    expect(wrapper.find('article > section > header > h2').text()).toBe('Certify')
    expect(wrapper.find('article > section > header > p').text()).toContain('Enter the legal name')
  })

  it('displays expandable help properly', async () => {
    expect(wrapper.find('.help-label').text()).toContain('Help with')
    expect(wrapper.find('.help-section').isVisible()).toBe(false)
    await wrapper.find('.help-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('.help-section').isVisible()).toBe(true)
    expect(wrapper.find('.agm-extension-help > h3').text()).toBe('AGM Extension Help')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('A company must have')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('Shareholders entitled')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('If a company does not')
  })

  it('show validation errors when Extension Request is incomplete', async () => {
    wrapper.setData({
      extensionRequestValid: false,
      certifyFormValid: true
    })
    console.log('>>> HTML =', wrapper.html())
    await wrapper.find('#file-pay-btn').trigger('click')
    expect(wrapper.vm.isPageValid).toBe(false)
  })

  it('show validation errors when Certify is incomplete', async () => {
    wrapper.setData({
      extensionRequestValid: true,
      certifyFormValid: false
    })
    await wrapper.find('#file-pay-btn').trigger('click')
    expect(wrapper.vm.isPageValid).toBe(false)
  })

  it.skip('doesn\'t file and displays dialog when not eligible', () => {
  })

  it.skip('files and set data properly when eligible', async () => {
  })
})
