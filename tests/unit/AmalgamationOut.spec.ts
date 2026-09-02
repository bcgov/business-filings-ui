import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import AmalgamationOut from '@/views/AmalgamationOut.vue'
import { ConfirmDialog, ResumeErrorDialog, SaveErrorDialog } from '@/components/dialogs'
import { BusinessNameForeign, Certify, DetailComment, EffectiveDate, ForeignJurisdiction }
  from '@/components/common'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { DocumentDelivery } from '@bcrs-shared-components/document-delivery'
import { BusinessServices } from '@/services'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'

import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { BusinessRegistryStaffActions } from './test-data/authorizedActions'

// suppress various warnings:
// - "Unknown custom element <affix>" warnings
// - "$listeners is readonly"
// - "Avoid mutating a prop directly"
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

describe('Amalgamation Out view', () => {
  beforeEach(() => {
    // init store
    rootStore.currentDate = '2020-03-04'
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('BC1234567')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    configurationStore.setConfiguration({
      'VUE_APP_BUSINESS_API_URL': 'https://business-api.url/',
      'VUE_APP_BUSINESS_API_VERSION_2': 'v2'
    })
    rootStore.filingData = []
    rootStore.setAuthorizedActions(BusinessRegistryStaffActions)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts the sub-components properly', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    // verify sub-components
    expect(wrapper.findComponent(BusinessNameForeign).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)
    expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true)
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.findComponent(DetailComment).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentDelivery).exists()).toBe(true)
    expect(wrapper.findComponent(EffectiveDate).exists()).toBe(true)
    expect(wrapper.findComponent(ForeignJurisdiction).exists()).toBe(true)
    expect(wrapper.findComponent(ResumeErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(SaveErrorDialog).exists()).toBe(true)

    wrapper.destroy()
  })

  it('does not show authorization alerts when there is no consent filing', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    vm.effectiveDate = '2020-03-01'
    vm.selectedCountry = 'US'
    vm.selectedRegion = 'NY'

    expect(vm.consentAmalgamationOutFilingId).toBe(0)
    expect(vm.isConsentExpired).toBe(false)
    expect(vm.showDateAuthorization).toBe(false)
    expect(vm.showJurisdictionAuthorization).toBe(false)
    expect(vm.dateAuthorizationValid).toBe(true)
    expect(vm.jurisdictionAuthorizationValid).toBe(true)

    wrapper.destroy()
  })

  it('shows date authorization only when effective date is outside the consent window', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    vm.consentValidFromDate = '2023-01-01'
    vm.consentValidToDate = '2023-06-30'

    vm.effectiveDate = '2023-03-15'
    expect(vm.isDateMismatch).toBe(false)
    expect(vm.showDateAuthorization).toBe(false)

    vm.effectiveDate = '2022-12-31'
    expect(vm.isDateMismatch).toBe(true)
    expect(vm.showDateAuthorization).toBe(true)

    vm.effectiveDate = '2023-07-01'
    expect(vm.isDateMismatch).toBe(true)
    expect(vm.dateAuthorizationValid).toBe(false)

    vm.dateAuthorizationCheckbox = true
    expect(vm.dateAuthorizationValid).toBe(true)

    wrapper.destroy()
  })

  it('shows jurisdiction authorization only when jurisdiction differs from the consent filing', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    vm.consentJurisdictionCountry = 'US'
    vm.consentJurisdictionRegion = 'NY'

    vm.selectedCountry = 'US'
    vm.selectedRegion = 'NY'
    expect(vm.isJurisdictionMismatch).toBe(false)

    vm.selectedRegion = 'CA'
    expect(vm.isJurisdictionMismatch).toBe(true)

    vm.selectedCountry = 'CA'
    vm.selectedRegion = 'ON'
    expect(vm.isJurisdictionMismatch).toBe(true)
    expect(vm.jurisdictionAuthorizationValid).toBe(false)

    vm.jurisdictionAuthorizationCheckbox = true
    expect(vm.jurisdictionAuthorizationValid).toBe(true)

    wrapper.destroy()
  })

  it('resets authorization checkboxes when the date or jurisdiction changes', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    vm.dateAuthorizationCheckbox = true
    vm.jurisdictionAuthorizationCheckbox = true

    vm.effectiveDate = '2023-07-01'
    await Vue.nextTick()
    expect(vm.dateAuthorizationCheckbox).toBe(false)
    expect(vm.jurisdictionAuthorizationCheckbox).toBe(true)

    vm.selectedCountry = 'CA'
    await Vue.nextTick()
    expect(vm.jurisdictionAuthorizationCheckbox).toBe(false)

    wrapper.destroy()
  })

  it('requires authorization checks before the page is considered valid when mismatches are present', async () => {
    const $route = { query: { filingId: '0' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    vm.businessNameValid = true
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    vm.effectiveDateValid = true
    vm.foreignJurisdictionValid = true
    vm.consentValidFromDate = '2023-01-01'
    vm.consentValidToDate = '2023-06-30'
    vm.effectiveDate = '2023-07-01'
    vm.selectedCountry = 'CA'
    vm.consentJurisdictionCountry = 'US'
    vm.selectedRegion = 'ON'
    vm.consentJurisdictionRegion = 'NY'

    expect(vm.isPageValid).toBe(false)
    expect(vm.validFlags['effectiveDate']).toBe(false)
    expect(vm.validFlags['foreignJurisdiction']).toBe(false)

    vm.dateAuthorizationCheckbox = true
    vm.jurisdictionAuthorizationCheckbox = true
    expect(vm.isPageValid).toBe(true)
    expect(vm.validFlags['effectiveDate']).toBe(true)
    expect(vm.validFlags['foreignJurisdiction']).toBe(true)

    wrapper.destroy()
  })

  it('pre-populates jurisdiction and consent date range from a consent amalgamation out filing', async () => {
    const fetchFilingSpy = vi.spyOn(BusinessServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve({
        consentAmalgamationOut: {
          foreignJurisdiction: {
            country: 'US',
            region: 'NY'
          }
        },
        header: {
          effectiveDate: '2024-01-10T08:00:00+00:00'
        }
      })
    })

    const $route = { query: { filingId: '0', consentAmalgamationOutFilingId: '123546' } }
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'amalgamation-out' })

    const wrapper = shallowMount(AmalgamationOut, {
      router,
      stubs: {
        BusinessNameForeign: true,
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        EffectiveDate: true,
        ForeignJurisdiction: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    await flushPromises()

    expect(fetchFilingSpy).toHaveBeenCalledWith('https://business-api.url/v2/businesses/BC1234567/filings/123546')
    expect(vm.consentAmalgamationOutFilingId).toBe(123546)
    expect(vm.initialCountry).toBe('US')
    expect(vm.initialRegion).toBe('NY')
    expect(vm.consentJurisdictionCountry).toBe('US')
    expect(vm.consentJurisdictionRegion).toBe('NY')
    expect(vm.consentValidFromDate).toBe('2024-01-10')
    expect(vm.consentValidToDate).toBe('2024-07-10')
    expect(vm.isConsentExpired).toBe(false)
    expect(vm.showJurisdictionAuthorization).toBe(false)

    wrapper.destroy()
  })

  it('flags an expired consent amalgamation out filing', async () => {
    vi.spyOn(BusinessServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve({
        consentAmalgamationOut: {
          foreignJurisdiction: { country: 'US' }
        },
        header: {
          effectiveDate: '2019-01-10T08:00:00+00:00'
        }
      })
    })

    const $route = { query: { filingId: '0', consentAmalgamationOutFilingId: '123546' } }
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'amalgamation-out' })

    const wrapper = shallowMount(AmalgamationOut, {
      router,
      stubs: {
        BusinessNameForeign: true,
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        EffectiveDate: true,
        ForeignJurisdiction: true,
        SbcFeeSummary: true
      },
      mocks: { $route }
    })
    const vm: any = wrapper.vm

    await flushPromises()

    // consent valid to 2019-07-10, current date is 2020-03-04
    expect(vm.consentValidToDate).toBe('2019-07-10')
    expect(vm.isConsentExpired).toBe(true)
    expect(wrapper.find('.expired-consent-alert').exists()).toBe(true)

    wrapper.destroy()
  })

  it('does not fetch the consent filing when resuming a draft', async () => {
    const fetchFilingSpy = vi.spyOn(BusinessServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve({
        header: {
          name: 'amalgamationOut',
          status: 'DRAFT',
          certifiedBy: 'Some Body'
        },
        business: {
          identifier: 'BC1234567',
          legalName: 'My Test Entity'
        },
        amalgamationOut: {
          details: 'Amalgamation Out\nsome detail',
          amalgamationOutDate: '2020-02-01',
          foreignJurisdiction: { country: 'CA', region: 'AB' }
        }
      })
    })

    const $route = { query: { filingId: '456', consentAmalgamationOutFilingId: '123546' } }
    const $router = mockRouter.mock()

    const wrapper = shallowMount(AmalgamationOut, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    await flushPromises()

    // only the draft filing is fetched (not the consent filing)
    expect(fetchFilingSpy).toHaveBeenCalledTimes(1)
    expect(fetchFilingSpy).toHaveBeenCalledWith('https://business-api.url/v2/businesses/BC1234567/filings/456')
    expect(vm.initialCountry).toBe('CA')
    expect(vm.initialRegion).toBe('AB')
    expect(vm.consentJurisdictionCountry).toBe('')
    expect(vm.showJurisdictionAuthorization).toBe(false)

    wrapper.destroy()
  })
})
