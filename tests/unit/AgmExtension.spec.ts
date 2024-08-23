// framework and libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import VueRouter from 'vue-router'
import mockRouter from './mockRouter'
import { CorpTypeCd } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { LegalServices } from '@/services'
import flushPromises from 'flush-promises'

// components
import AgmExtension from '@/views/AgmExtension.vue'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'
import AgmExtensionHelp from '@/components/AgmExtension/AgmExtensionHelp.vue'
import { ConfirmDialog, NotEligibleExtensionDialog, PaymentErrorDialog } from '@/components/dialogs'
import { Certify } from '@/components/common'
import { ExpandableHelp } from '@bcrs-shared-components/expandable-help'
import ExtensionRequest from '@/components/AgmExtension/ExtensionRequest.vue'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

// suppress warning "Unknown custom element <affix>" warnings
Vue.config.silent = true

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()
const filingHistoryListStore = useFilingHistoryListStore()

describe('AGM Extension view', () => {
  let wrapper: any

  beforeEach(() => {
    // init store
    rootStore.currentDate = '2023-11-06'
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setLegalName('My Benefit Company')
    businessStore.setIdentifier('BC1234567')
    businessStore.setFoundingDate('2000-01-01T08:00:00.000+00:00')
    businessStore.setGoodStanding(true)
    rootStore.filingData = []

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'agm-extension', query: { filingId: '0' } })

    wrapper = mount(AgmExtension, {
      localVue,
      router,
      stubs: {
        // NOTE - we want to stub out some components and not others:
        AboutTheBusiness: true,
        AgmExtensionEvaluation: true,
        // AgmExtensionHelp: true,
        // Certify: true,
        ConfirmDialog: true,
        // ExpandableHelp: true,
        ExtensionRequest: true,
        NotEligibleExtensionDialog: true,
        PaymentErrorDialog: true,
        SbcFeeSummary: true
      },
      vuetify
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('displays the initial view properly', () => {
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
    expect(wrapper.findComponent(SbcFeeSummary).exists()).toBe(true)

    // verify titles
    expect(wrapper.find('article > h1').text()).toBe('AGM Extension')
    expect(wrapper.find('article > header > h2').text()).toBe('Extension Detail')
    expect(wrapper.find('article > header > p').text()).toContain('Enter the details about')
    expect(wrapper.find('article > section > header > h2').text()).toBe('Certify')
    expect(wrapper.find('article > section > header > p').text()).toContain('Enter the legal name')
  })

  it('displays expandable help properly', async () => {
    expect(wrapper.find('.help-label').text()).toContain('Help with')

    // verify help section is not visible
    expect(wrapper.find('.help-section').isVisible()).toBe(false)
    await wrapper.find('.help-btn').trigger('click')

    // verify help section is now visible
    expect(wrapper.find('.help-section').isVisible()).toBe(true)

    // verify title and text
    expect(wrapper.find('.agm-extension-help > h3').text()).toBe('AGM Extension Help')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('A company must have')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('Shareholders entitled')
    expect(wrapper.find('.agm-extension-help > div').text()).toContain('If a company does not')
  })

  it('sets fee summary data properly', () => {
    expect(wrapper.vm.filingData).toEqual([{ filingTypeCode: 'AGMDT', entityType: 'BEN' }])
  })

  it('reports invalid page when Extension Request is invalid', async () => {
    wrapper.setData({
      extensionRequestValid: false,
      certifyFormValid: true
    })
    await wrapper.find('#file-pay-btn').trigger('click')
    expect(wrapper.vm.isPageValid).toBe(false)
  })

  it('reports invalid page when Certify is invalid', async () => {
    wrapper.setData({
      extensionRequestValid: true,
      certifyFormValid: false
    })
    await wrapper.find('#file-pay-btn').trigger('click')
    expect(wrapper.vm.isPageValid).toBe(false)
  })

  it('doesn\'t file and displays dialog when not eligible', async () => {
    // verify that dialog is initially disabled
    // (NB: stub doesn't show dialog="false")
    expect(wrapper.findComponent(NotEligibleExtensionDialog).attributes('dialog')).toBeUndefined()

    // simulate ineligibility but valid component
    wrapper.setData({
      data: { isEligible: false },
      extensionRequestValid: true
    })

    // simulate valid certify data and component
    wrapper.setData({ certifiedBy: 'Full Name', isCertified: true, certifyFormValid: true })

    // click the file-pay button
    await wrapper.find('#file-pay-btn').trigger('click')

    // verify that dialog is now enabled
    expect(wrapper.findComponent(NotEligibleExtensionDialog).attributes('dialog')).toBe('true')
  })

  it('returns total months in agm within the same year extension', async () => {
    const filingHistoryList = [
      { name: FilingTypes.AGM_EXTENSION, data: { agmExtension: { extensionDuration: 2, year: 2023 } } },
      { name: FilingTypes.AGM_EXTENSION, data: { agmExtension: { extensionDuration: 4, year: 2023 } } },
      { name: FilingTypes.AGM_EXTENSION, data: { agmExtension: { extensionDuration: 4, year: 2024 } } }
    ]
    filingHistoryListStore.setFilings(filingHistoryList as any)
    const totalAgmExtension = filingHistoryListStore.getTotalAgmExtensionDuration(2023)
    expect(totalAgmExtension).toBe(6)
  })

  it('files JSON data properly when eligible', async () => {
    // verify initial route name
    expect(wrapper.vm.$route.name).toBe('agm-extension')

    // mock hasPendingTasks()
    LegalServices.hasPendingTasks = vi.fn().mockResolvedValue(false)

    // mock createFiling()
    LegalServices.createFiling = vi.fn().mockResolvedValue({
      agmExtension: {},
      business: {},
      header: {
        filingId: 123,
        isPaymentActionRequired: false
      }
    })

    // simulate eligible data and valid component
    wrapper.setData({
      data: { isEligible: true },
      extensionRequestValid: true
    })

    // simulate valid certify data and component
    wrapper.setData({ certifiedBy: 'Full Name', isCertified: true, certifyFormValid: true })

    // click the file-pay button
    await wrapper.find('#file-pay-btn').trigger('click')

    // wait for save to complete and everything to update
    await flushPromises()

    // verify legal services method was called
    expect(LegalServices.createFiling).toHaveBeenCalled()

    // verify payload (filing JSON)
    const data = {
      agmExtension: {
        agmDueDate: null,
        agmYear: null,
        alreadyExtended: null,
        currentDate: '2023-11-06',
        expireDateApprovedExt: null,
        extReqForAgmYear: null,
        extensionDuration: NaN,
        incorporationDate: new Date('2000-01-01T08:00:00.000Z'),
        isEligible: true,
        isFirstAgm: null,
        isGoodStanding: true,
        isPrevExtension: null,
        prevAgmDate: null,
        prevExpiryDate: null,
        requestExpired: null,
        totalApprovedExt: NaN,
        year: null
      },
      business: {
        foundingDate: '2000-01-01T08:00:00.000+00:00',
        identifier: 'BC1234567',
        legalName: 'My Benefit Company',
        legalType: 'BEN'
      },
      header: {
        certifiedBy: 'Full Name',
        date: '2023-11-06',
        name: 'agmExtension'
      }
    }
    expect(LegalServices.createFiling).toHaveBeenCalledWith('BC1234567', data, false)

    // verify redirection to dashboard
    expect(wrapper.vm.$route.name).toBe('dashboard')
  })
})
