import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import AgmLocationChg from '@/views/AgmLocationChg.vue'
import { Certify } from '@/components/common'
import AgmYear from '@/components/AgmLocationChange/AgmYear.vue'
import flushPromises from 'flush-promises'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import sinon from 'sinon'
import axios from '@/axios-auth'

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
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('AGM Location Chg view', () => {
  const { assign } = window.location

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
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('BC0007291')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/BC0007291/tasks')
      .returns(Promise.resolve({ data: { tasks: [] } }))

    // mock "save and file" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/BC0007291/filings')
      .returns(Promise.resolve({
        data: {
          filing: {
            agmLocationChange: {
              year: '2023',
              agmLocation: 'Toronto, Ontario, Canada',
              reason: 'Test Reason'
            },
            business: {
              foundingDate: '2007-04-08T00:00:00+00:00',
              identifier: 'BC0007291',
              legalName: 'Legal Name - BC0007291'
            },
            header: {
              name: 'agmLocationChange',
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
      }))
  })

  afterEach(() => {
    sinon.restore()
    vi.restoreAllMocks()
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('mounts the sub-components properly', () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()
    const $route = { query: { filingId: '0' } }

    const wrapper = shallowMount(AgmLocationChg, { mocks: { $route, $router } })

    // verify sub-components
    expect(wrapper.findComponent(AgmYear).exists()).toBe(true)
    expect(wrapper.findComponent(Certify).exists()).toBe(true)

    wrapper.destroy()
  })

  it('sets filing data properly', () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()
    const $route = { query: { filingId: '0' } }

    const wrapper = shallowMount(AgmLocationChg, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify initial Filing Data
    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('AGMLC')
    expect(vm.filingData[0].entityType).toBe('BEN')

    wrapper.destroy()
  })

  it('sets computed states properly', () => {
    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()
    const $route = { query: { filingId: '0' } }

    const wrapper = shallowMount(AgmLocationChg, { mocks: { $route, $router } })
    const vm: any = wrapper.vm

    // verify "isPayRequired" with no fee
    vm.totalFee = 0
    expect(!!vm.isPayRequired).toBe(false)

    // verify "isPayRequired" with a fee
    vm.totalFee = 350
    expect(!!vm.isPayRequired).toBe(true)

    // verify "validated" - all true
    vm.agmLocationValid = true
    vm.agmYearValid = true
    vm.certifyFormValid = true
    vm.reasonValid = true
    expect(!!vm.isPageValid).toBe(true)

    // verify "validated" - invalid agm year
    vm.agmLocationValid = true
    vm.agmYearValid = false
    vm.certifyFormValid = true
    vm.reasonValid = true
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid reason
    vm.agmLocationValid = true
    vm.agmYearValid = true
    vm.certifyFormValid = true
    vm.reasonValid = false
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid Location change form
    vm.agmLocationValid = false
    vm.agmYearValid = true
    vm.certifyFormValid = true
    vm.reasonValid = true
    expect(!!vm.isPageValid).toBe(false)

    // verify "validated" - invalid Certify form
    vm.agmLocationValid = true
    vm.agmYearValid = true
    vm.certifyFormValid = false
    vm.reasonValid = true
    expect(!!vm.isPageValid).toBe(false)
  })

  it('saves a new filing and redirects to Pay URL when the File & Pay button is clicked', async () => {
    const $route = { query: { filingId: '0' } } // new filing id

    const wrapper = shallowMount(AgmLocationChg, { mocks: { $route }, vuetify })
    const vm: any = wrapper.vm

    // make sure form is validated
    await wrapper.setData({
      agmLocationValid: true,
      agmYearValid: true,
      certifyFormValid: true,
      reasonValid: true
    })

    expect(vm.isPageValid).toEqual(true)

    // fee is set to 0
    vm.totalFee = 0

    // sanity check
    expect(vi.isMockFunction(window.location.assign)).toBe(true)

    // click the File & Pay button
    await vm.onClickFilePay()
    await flushPromises() // wait for save to complete and everything to update

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })
})
