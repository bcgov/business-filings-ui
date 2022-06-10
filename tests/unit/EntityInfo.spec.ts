import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityInfo from '@/components/EntityInfo.vue'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import mockRouter from './mockRouter'
import { min } from 'lodash'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('EntityInfo - data', () => {
  it('displays Business entity info properly', async () => {
    // session storage must be set before mounting component
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')

    // set store properties
    store.state.entityName = 'My Business'
    store.state.goodStanding = true
    store.state.entityType = 'CP'
    store.state.businessNumber = '123456789'
    store.state.identifier = 'CP0001191'
    store.state.businessEmail = 'business@mail.zzz'
    store.state.businessPhone = '(111)222-3333'
    store.state.businessPhoneExtension = '444'

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityInfo, { store, vuetify })
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

    store.state.entityName = 'My Named Company'
    store.state.entityStatus = 'DRAFT_APP'
    store.state.entityType = 'BEN'
    store.state.nameRequest = { nrNumber: 'NR 1234567' }

    const wrapper = shallowMount(EntityInfo, { store, vuetify })
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

    store.state.entityName = null
    store.state.entityStatus = 'DRAFT_APP'
    store.state.entityType = 'BEN'
    store.state.nameRequest = null

    const wrapper = shallowMount(EntityInfo, { store, vuetify })
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

    store.state.entityName = 'My Future Company'
    store.state.entityStatus = 'FILED_APP'
    store.state.entityType = 'BEN'
    store.state.nameRequest = { nrNumber: 'NR 1234567' }

    const wrapper = shallowMount(EntityInfo, { store, vuetify })
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

    store.state.entityName = null
    store.state.entityType = null
    store.state.entityStatus = null
    store.state.businessNumber = null
    store.state.identifier = null
    store.state.businessEmail = null
    store.state.businessPhone = null
    store.state.businessPhoneExtension = null
    store.state.nameRequest = null

    const wrapper = shallowMount(EntityInfo, { store, vuetify })
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
  it('does not display Staff Comments component when there is no business id', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', null)
    store.state.keycloakRoles = []

    const router = mockRouter.mock()
    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.find(StaffComments).exists()).toBe(false)

    wrapper.destroy()
  })

  it('does not display Staff Comments component when not allowed', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.keycloakRoles = []

    const router = mockRouter.mock()
    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.find(StaffComments).exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays Staff Comments component when conditions are met', async () => {
    // init session storage + store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.keycloakRoles = ['staff']

    const router = mockRouter.mock()
    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    expect(wrapper.find(StaffComments).exists()).toBe(true)

    store.state.keycloakRoles = []
    wrapper.destroy()
  })
})

describe('EntityInfo - company info button and tooltip', () => {
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
      businessId: 'BC1234567',
      entityType: 'BEN',
      warnings: [{}, {}],
      buttonExists: true,
      tooltip: 'not in compliance'
    },
    { // 5
      tempRegNumber: 'T123456789',
      entityType: 'BEN',
      entityStatus: 'DRAFT_APP',
      buttonExists: false
    },
    { // 6
      tempRegNumber: 'T123456789',
      entityType: 'BEN',
      entityStatus: 'FILED_APP',
      buttonExists: false
    },
    { // 7
      businessId: null,
      tempRegNumber: null,
      entityType: null,
      goodStanding: false,
      warnings: null,
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

      store.state.entityType = _.entityType
      store.state.goodStanding = _.goodStanding || false
      store.state.businessWarnings = _.warnings || []
      store.state.entityStatus = _.entityStatus || null

      const wrapper = shallowMount(EntityInfo, { store, vuetify })
      await Vue.nextTick()

      // verify button
      const companyInformationButton = wrapper.find('#company-information-button')
      expect(companyInformationButton.exists()).toBe(_.buttonExists)

      // verify tooltip
      const vTooltipStub = wrapper.find('v-tooltip-stub')
      expect(vTooltipStub.exists()).toBe(!!_.tooltip)
      if (_.tooltip) expect(vTooltipStub.text()).toContain(_.tooltip)
    })
  })
})

describe('EntityInfo - Historical badge', () => {
  const variations = [
    { // 0
      state: 'ACTIVE',
      exists: false
    },
    { // 1
      state: 'LIQUIDATION',
      exists: false
    },
    { // 2
      state: 'HISTORICAL',
      exists: true,
      text: null
    },
    { // 3
      state: 'HISTORICAL',
      exists: true,
      text: 'Some Reason Text'
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays historical badge - variation #${index}`, async () => {
      // init store
      store.state.entityState = _.state
      store.state.reasonText = _.text

      const router = mockRouter.mock()
      const wrapper = mount(EntityInfo, { vuetify, store, router })
      await Vue.nextTick()

      expect(wrapper.find('.v-chip').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('.v-chip__content').text()).toBe('HISTORICAL')
        expect(wrapper.find('.v-chip + span').text()).toBe(_.text || 'Unknown Reason')
      }

      // cleanup
      store.state.entityState = null
      store.state.reasonText = null
      wrapper.destroy()
    })
  })
})

describe('EntityInfo - Click Tests - Alterations', () => {
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
    sessionStorage.setItem('EDIT_URL', 'https://edit.url/')
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    store.state.identifier = 'BC1234567'
    store.state.goodStanding = true
    store.state.entityType = 'BEN'
    // store.state.entityType = 'LTD' // FUTURE: uncomment this

    const router = mockRouter.mock()
    const wrapper = mount(EntityInfo, { vuetify, store, router })
    await Vue.nextTick()

    wrapper.find('#company-information-button').trigger('click')
    await Vue.nextTick()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/alteration'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('EntityInfo - Click Tests - Dissolutions', () => {
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
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()
    expect(wrapper.find('#dissolution-button').exists()).toBe(true)
  })

  it('prompts the Confirm Dissolution dialog if in good standing', async () => {
    store.state.goodStanding = true
    const router = mockRouter.mock()

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    wrapper.find('#dissolution-button').trigger('click')
    await Vue.nextTick()

    // verify emit event
    expect(wrapper.emitted().confirmDissolution).toEqual([[]])
  })

  it('prompts the Not In Good Standing dialog', async () => {
    store.state.goodStanding = false
    const router = mockRouter.mock()

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    wrapper.find('#dissolution-button').trigger('click')
    await Vue.nextTick()

    // verify emit event
    expect(wrapper.emitted().notInGoodStanding).toEqual([['dissolve']])
  })
})

describe('EntityInfo - Click Tests - Business Summary', () => {
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
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    expect(wrapper.find('#download-summary-button').exists()).toBe(true)
  })

  it('emits the download business summary event', async () => {
    const router = mockRouter.mock()

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      router,
      mixins: [AllowableActionsMixin]
    })
    await Vue.nextTick()

    wrapper.find('#download-summary-button').trigger('click')
    await Vue.nextTick()

    // verify emit event
    expect(wrapper.emitted().downloadBusinessSummary).toEqual([[]])
  })
})
