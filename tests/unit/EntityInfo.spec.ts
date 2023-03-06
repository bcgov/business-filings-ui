import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityInfo from '@/components/EntityInfo.vue'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import mockRouter from './mockRouter'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('EntityInfo - data', () => {
  const router = mockRouter.mock()

  it('displays Business entity info properly', async () => {
    // session storage must be set before mounting component
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')

    // set store properties
    store.commit('setLegalName', 'My Business')
    store.commit('setGoodStanding', true)
    store.commit('setLegalType', 'CP')
    store.commit('setTaxId', '123456789')
    store.commit('setIdentifier', 'CP0001191')
    store.state.businessEmail = 'business@mail.zzz'
    store.state.businessPhone = '(111)222-3333'
    store.state.businessPhoneExtension = '444'

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#entity-legal-name').text()).toBe('My Business')
    expect(wrapper.find('#entity-business-number').text()).toBe('123456789')
    expect(wrapper.find('#entity-incorporation-number').text()).toBe('CP0001191')
    expect(wrapper.find('#entity-business-email span').text()).toBe('business@mail.zzz')
    expect(wrapper.find('#entity-business-phone span').text()).toBe('(111)222-3333 x444')
    expect(wrapper.find('#ia-reg-subtitle').exists()).toBeFalsy()
    expect(wrapper.find('#nr-number').exists()).toBeFalsy()
  })

  it('displays Draft Incorp App entity info properly - Named Company', async () => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')

    store.commit('setLegalName', 'My Named Company')
    store.state.entityStatus = 'DRAFT_APP'
    store.commit('setLegalType', 'BEN')
    store.state.nameRequest = { nrNum: 'NR 1234567' }

    const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
    await Vue.nextTick()

    expect(wrapper.find('#incorp-app-title').text()).toBe('My Named Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-subtitle').text()).toBe('BC Benefit Company Incorporation Application')
    expect(wrapper.find('#nr-number').text()).toBe('NR 1234567')
  })

  it('displays Draft Incorp App entity info properly - Numbered Company', async () => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')

    store.commit('setLegalName', null)
    store.state.entityStatus = 'DRAFT_APP'
    store.commit('setLegalType', 'BEN')
    store.state.nameRequest = null

    const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
    await Vue.nextTick()

    expect(wrapper.find('#incorp-app-title').text()).toBe('Numbered Benefit Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-subtitle').text()).toBe('BC Benefit Company Incorporation Application')
    expect(wrapper.find('#nr-number').exists()).toBeFalsy()
  })

  it('displays Paid (Named) Incorp App entity info properly', async () => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')

    store.commit('setLegalName', 'My Future Company')
    store.state.entityStatus = 'FILED_APP'
    store.commit('setLegalType', 'BEN')
    store.state.nameRequest = { nrNum: 'NR 1234567' }

    const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
    await Vue.nextTick()

    expect(wrapper.find('#incorp-app-title').text()).toBe('My Future Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-subtitle').text()).toBe('BC Benefit Company Incorporation Application')
    expect(wrapper.find('#nr-number').text()).toBe('NR 1234567')
  })

  it('handles empty data', async () => {
    sessionStorage.clear()

    store.commit('setLegalName', null)
    store.commit('setLegalType', null)
    store.state.entityStatus = null
    store.commit('setTaxId', null)
    store.commit('setIdentifier', null)
    store.state.businessEmail = null
    store.state.businessPhone = null
    store.state.businessPhoneExtension = null
    store.state.nameRequest = null

    const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').exists()).toBeFalsy()
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-subtitle').exists()).toBeFalsy()
    expect(wrapper.find('#nr-number').exists()).toBeFalsy()
  })
})

describe('EntityInfo - Staff Comments', () => {
  const router = mockRouter.mock()

  it('does not display Staff Comments component when there is no business id', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', null)
    store.state.keycloakRoles = []

    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)

    wrapper.destroy()
  })

  it('does not display Staff Comments component when not allowed', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.keycloakRoles = []

    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays Staff Comments component when conditions are met', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.keycloakRoles = ['staff']

    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(true)

    store.state.keycloakRoles = []
    wrapper.destroy()
  })
})

describe('EntityInfo - company info button and tooltip', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      businessId: 'CP1234567',
      entityType: 'CP',
      goodStanding: true,
      buttonExists: false,
      tooltip: null
    },
    { // 1
      businessId: 'BC1234567',
      entityType: 'BEN',
      goodStanding: true,
      buttonExists: true,
      tooltip: null
    },
    { // 2
      businessId: 'BC1234567',
      entityType: 'BC',
      goodStanding: true,
      buttonExists: true,
      tooltip: null
    },
    { // 3
      businessId: 'BC1234567',
      entityType: 'ULC',
      goodStanding: true,
      buttonExists: true,
      tooltip: null
    },
    { // 4
      tempRegNumber: 'T123456789',
      entityType: 'BEN',
      entityStatus: 'DRAFT_APP',
      buttonExists: false
    },
    { // 5
      tempRegNumber: 'T123456789',
      entityType: 'BEN',
      entityStatus: 'FILED_APP',
      buttonExists: false
    },
    { // 6
      businessId: null,
      tempRegNumber: null,
      entityType: null,
      goodStanding: false,
      entityStatus: null,
      buttonExists: false,
      tooltip: null
    }
  ]

  variations.forEach((_, index) => {
    it(`displays company info button and tooltips properly - variation #${index}`, async () => {
      sessionStorage.clear()
      if (_.businessId) sessionStorage.setItem('BUSINESS_ID', _.businessId)
      if (_.tempRegNumber) sessionStorage.setItem('TEMP_REG_NUMBER', _.tempRegNumber)

      store.commit('setLegalType', _.entityType)
      store.commit('setGoodStanding', _.goodStanding || false)
      store.state.entityStatus = _.entityStatus || null

      const wrapper = shallowMount(EntityInfo, { store, vuetify, router })
      await Vue.nextTick()

      // verify button
      const companyInformationButton = wrapper.find('#company-information-button')
      expect(companyInformationButton.exists()).toBe(_.buttonExists)

      // verify tooltip
      // expect index = 4 to display compliance warning
      const vTooltipStub = wrapper.find('v-tooltip-stub')
      expect(vTooltipStub.exists()).toBe(index === 4 ? !!_.tooltip : false)
      if (_.tooltip) expect(vTooltipStub.text()).toContain(_.tooltip)
    })
  })
})

describe('EntityInfo - AUTHORIZED TO CONTINUE OUT badge', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      stateFiling: null,
      exists: false
    },
    { // 1
      stateFiling: null,
      exists: false
    },
    { // 2
      stateFiling: { consentContinuationOut: {} },
      exists: true
    }
  ]

  beforeAll(() => {
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
  })

  afterAll(() => {
    sessionStorage.clear()
  })

  variations.forEach((_, index) => {
    it(`conditionally displays continue out badge - variation #${index}`, async () => {
      // init store
      store.state.stateFiling = _.stateFiling

      const wrapper = mount(EntityInfo, { vuetify, store, router })
      await Vue.nextTick()

      expect(wrapper.find('#authorized-to-continue-out-chip').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#authorized-to-continue-out-chip').text()).toBe('AUTHORIZED TO CONTINUE OUT')
      }

      // cleanup
      store.state.stateFiling = null
      wrapper.destroy()
    })
  })
})

describe('EntityInfo - Historical badge', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      entityState: 'ACTIVE',
      exists: false
    },
    { // 1
      entityState: 'LIQUIDATION',
      exists: false
    },
    { // 2
      entityState: 'HISTORICAL',
      stateFiling: null,
      exists: true,
      text: 'Unknown Reason'
    },
    { // 3
      entityState: 'HISTORICAL',
      stateFiling: {
        header: { name: 'dissolution' },
        dissolution: {
          dissolutionDate: '2020-01-01',
          dissolutionType: 'voluntary'
        }
      },
      exists: true,
      text: 'Voluntary Dissolution – January 1, 2020'
    },
    { // 4
      entityState: 'HISTORICAL',
      stateFiling: {
        header: {
          name: 'involuntaryDissolution',
          effectiveDate: '2020-01-01T08:01:00+00:00'
        }
      },
      exists: true,
      text: 'Involuntary Dissolution – January 1, 2020 at 12:01 am Pacific time'
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays historical badge - variation #${index}`, async () => {
      // init store
      store.commit('setState', _.entityState)
      store.state.stateFiling = _.stateFiling || null

      const wrapper = mount(EntityInfo, { vuetify, store, router })
      await Vue.nextTick()

      expect(wrapper.find('#historical-chip').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#historical-chip').text()).toBe('HISTORICAL')
        expect(wrapper.find('#historical-chip + span').text()).toBe(_.text)
      }

      // cleanup
      store.commit('setState', null)
      store.state.stateFiling = null
      wrapper.destroy()
    })
  })
})

describe('EntityInfo - Click Tests - Alterations', () => {
  const router = mockRouter.mock()

  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Edit URL to view/alter business info', async () => {
    // init session storage + store
    sessionStorage.clear()
    store.commit('setTestConfiguration', { key: 'BUSINESS_EDIT_URL', value: 'https://edit.url/' })
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    store.commit('setIdentifier', 'BC1234567')
    store.commit('setGoodStanding', true)
    store.commit('setLegalType', 'BEN')

    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    await wrapper.find('#company-information-button').trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/alteration'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('EntityInfo - Click Tests - Dissolutions', () => {
  const router = mockRouter.mock()

  // mock the mixin to always return True
  const AllowableActionsMixin: any = {
    methods: {
      isAllowed: () => true
    }
  }

  it('displays the Dissolve this Company button', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()
    expect(wrapper.find('#dissolution-button').exists()).toBe(true)
  })

  it('prompts the Confirm Dissolution dialog if in good standing', async () => {
    store.commit('setGoodStanding', true)

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    await wrapper.find('#dissolution-button').trigger('click')

    // verify emit event
    expect(wrapper.emitted().confirmDissolution).toEqual([[]])
  })

  it('prompts the Not In Good Standing dialog', async () => {
    store.commit('setGoodStanding', false)

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    await wrapper.find('#dissolution-button').trigger('click')

    // verify emit event
    expect(wrapper.emitted().notInGoodStanding).toEqual([['dissolve']])
  })
})

describe('EntityInfo - Click Tests - Business Summary', () => {
  const router = mockRouter.mock()

  // mock the mixin to always return True
  const AllowableActionsMixin: any = {
    methods: {
      isAllowed: () => true
    }
  }

  it('displays the Business Summary button', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    expect(wrapper.find('#download-summary-button').exists()).toBe(true)
  })

  it('emits the download business summary event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    await wrapper.find('#download-summary-button').trigger('click')

    // verify emit event
    expect(wrapper.emitted().downloadBusinessSummary).toEqual([[]])
  })
})
