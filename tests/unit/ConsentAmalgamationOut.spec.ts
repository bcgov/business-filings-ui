import Vue from 'vue'
import sinon from 'sinon'
import Vuetify from 'vuetify'
import axios from '@/axios-auth'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import ConsentAmalgamationOut from '@/views/ConsentAmalgamationOut.vue'
import { ConfirmDialog, PaymentErrorDialog, ResumeErrorDialog, SaveErrorDialog, StaffPaymentDialog }
  from '@/components/dialogs'
import { Certify, DetailComment, ForeignJurisdiction } from '@/components/common'
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
const vuetify = new Vuetify({})
const localVue = createLocalVue()
localVue.use(VueRouter)
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Consent to Amalgamation Out view', () => {
  beforeEach(() => {
    // init store
    rootStore.currentDate = '2020-03-04'
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('CP1234567')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []
    rootStore.keycloakRoles = ['staff']
  })

  it('mounts the sub-components properly', async () => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentAmalgamationOut, { mocks: { $route, $router } })
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

    const wrapper = shallowMount(ConsentAmalgamationOut, { mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    const vm: any = wrapper.vm

    // verify initial Filing Data
    expect(vm.filingData).not.toBeUndefined()
    expect(vm.filingData).not.toBeNull()
    expect(vm.filingData.length).toBe(1)
    expect(vm.filingData[0].filingTypeCode).toBe('IAMGO')
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

    const wrapper = shallowMount(ConsentAmalgamationOut, { mocks: { $route, $router } })
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
    vm.foreignJurisdictionValid = true
    expect(vm.isPageValid).toBe(true)

    // verify "validated" - invalid Detail Comment form
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = false
    vm.documentDeliveryValid = true
    vm.foreignJurisdictionValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Certify form
    vm.certifyFormValid = false
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    vm.foreignJurisdictionValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Court Order form
    vm.certifyFormValid = true
    vm.courtOrderValid = false
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    vm.foreignJurisdictionValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Document Delivery form
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = false
    vm.foreignJurisdictionValid = true
    expect(vm.isPageValid).toBe(false)

    // verify "validated" - invalid Foreign Jurisdiction form
    vm.certifyFormValid = true
    vm.courtOrderValid = true
    vm.detailCommentValid = true
    vm.documentDeliveryValid = true
    vm.foreignJurisdictionValid = false
    expect(vm.isPageValid).toBe(false)

    wrapper.destroy()
  })

  it('saves draft consent to amalgamation out properly', async () => {
    // mock "has pending tasks" legal service
    vi.spyOn(LegalServices, 'hasPendingTasks').mockImplementation((): any => {
      return Promise.resolve(false)
    })

    // mock "create filing" legal service
    // (garbage response data - we aren't testing that)
    vi.spyOn(LegalServices, 'createFiling').mockImplementation((): any => {
      return Promise.resolve({
        business: {},
        header: { filingId: 456 },
        consentAmalgamationOut: { details: 'test' },
        annualReport: {}
      })
    })

    // mock $route
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-amalgamation-out' })

    const wrapper = shallowMount(ConsentAmalgamationOut, {
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        ForeignJurisdiction: true,
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

    vi.restoreAllMocks()
    wrapper.destroy()
  })

  it('resumes draft consent to amalgamation out properly with FAS staff payment', async () => {
    // mock "fetch filing" legal service
    vi.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve({
        business: {
          identifier: 'CP1234567',
          legalName: 'My Test Entity'
        },
        header: {
          name: 'consentAmalgamationOut',
          status: 'DRAFT',
          certifiedBy: 'Johnny Certifier',
          routingSlipNumber: '123456789',
          priority: true
        },
        consentAmalgamationOut: {
          details: 'Line 1\nLine 2\nLine 3',
          foreignJurisdiction: {
            country: 'CA',
            region: 'AB'
          }
        },
        annualReport: {}
      })
    })

    // mock $route
    const $route = { params: { filingId: '456' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-amalgamation-out' })

    const wrapper = shallowMount(ConsentAmalgamationOut, {
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        ForeignJurisdiction: true,
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
    expect(vm.draftCountry).toBe('CA')
    expect(vm.draftRegion).toBe('AB')

    vi.restoreAllMocks()
    wrapper.destroy()
  })
})

describe('Consent to Continue Out for general user and IAs only', () => {
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
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    businessStore.setLegalName('My Test Entity')
    businessStore.setIdentifier('BC0007291')
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')
    rootStore.filingData = []
    rootStore.keycloakRoles = ['user']

    // mock "get tasks" endpoint - needed for hasPendingTasks()
    sinon
      .stub(axios, 'get')
      .withArgs('businesses/BC0007291/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: [] } })))

    // mock "save and file" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/BC0007291/filings')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {
              filing: {
                consentAmalgamationOut: {
                  expiry: '2023-08-17T07:59:00.000000+00:00',
                  foreignJurisdiction: {
                    country: 'CA',
                    region: 'AB'
                  }
                },
                business: {
                  foundingDate: '2007-04-08T00:00:00+00:00',
                  identifier: 'BC0007291',
                  legalName: 'Legal Name - BC0007291'
                },
                header: {
                  name: 'consentAmalgamationOut',
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
          })
        )
      )
  })

  afterEach(() => {
    sinon.restore()
    vi.restoreAllMocks()
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('mounts the sub-components properly', async () => {
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const $router = mockRouter.mock()

    const wrapper = shallowMount(ConsentAmalgamationOut, { mocks: { $route, $router } })
    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    // verify sub-components
    expect(wrapper.findComponent(Certify).exists()).toBe(true)
    expect(wrapper.findComponent(ConfirmDialog).exists()).toBe(true)
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(false) // staff only
    expect(wrapper.findComponent(DetailComment).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentDelivery).exists()).toBe(true)
    expect(wrapper.findComponent(ForeignJurisdiction).exists()).toBe(true)
    expect(wrapper.findComponent(PaymentErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(ResumeErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(SaveErrorDialog).exists()).toBe(true)
    expect(wrapper.findComponent(StaffPaymentDialog).exists()).toBe(true)

    wrapper.destroy()
  })

  it('saves draft consent to amalgamation out properly', async () => {
    // mock "has pending tasks" legal service
    vi.spyOn(LegalServices, 'hasPendingTasks').mockImplementation((): any => {
      return Promise.resolve(false)
    })

    // mock "create filing" legal service
    // (garbage response data - we aren't testing that)
    vi.spyOn(LegalServices, 'createFiling').mockImplementation((): any => {
      return Promise.resolve({
        business: {},
        header: { filingId: 456 },
        consentAmalgamationOut: { details: 'test' },
        annualReport: {}
      })
    })

    // mock $route
    const $route = { params: { filingId: '0' } }

    // create local Vue and mock router
    createLocalVue().use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-amalgamation-out' })

    const wrapper = shallowMount(ConsentAmalgamationOut, {
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        ForeignJurisdiction: true,
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

    vi.restoreAllMocks()
    wrapper.destroy()
  })

  it('saves a new filing and redirects to Pay URL when the File & Pay button is clicked', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'consent-amalgamation-out', params: { filingId: '0' } }) // new filing id

    const wrapper = mount(ConsentAmalgamationOut, {
      localVue,
      router,
      stubs: {
        CourtOrderPoa: true,
        DetailComment: true,
        DocumentDelivery: true,
        Certify: true,
        ForeignJurisdiction: true,
        SbcFeeSummary: true
      },
      vuetify
    })
    const vm: any = wrapper.vm

    // make sure form is validated
    await wrapper.setData({
      detailCommentValid: true,
      documentDeliveryValid: true,
      certifyFormValid: true,
      courtOrderValid: true,
      foreignJurisdictionValid: true
    })

    wrapper.vm.$data.dataLoaded = true
    await Vue.nextTick()

    expect(vm.isPageValid).toEqual(true)

    // make sure a fee is required
    vm.totalFee = 350

    // sanity check
    expect(vi.isMockFunction(window.location.assign)).toBe(true)

    const button = wrapper.find('#consent-file-pay-btn')
    expect(button.attributes('disabled')).toBeUndefined()

    // click the File & Pay button
    await button.trigger('click')
    await flushPromises() // wait for save to complete and everything to update

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/321/' + encodeURIComponent('https://base.url/?filing_id=123')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })
})
