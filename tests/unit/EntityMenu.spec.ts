import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import EntityMenu from '@/components/EntityInfo/EntityMenu.vue'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import mockRouter from './mockRouter'
import { AllowableActions, CorpTypeCd, EntityState, EntityStatus } from '@/enums'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

/** To prevent - Unable to locate target [data-app] */
console.warn = jest.fn()

describe('Entity Menu - entities', () => {
  const router = mockRouter.mock()

  it('handles empty data', async () => {
    // set store properties
    businessStore.setGoodStanding(false)
    businessStore.setLegalName(null)
    businessStore.setLegalType(null)
    rootStore.entityStatus = null
    businessStore.setState(null)
    rootStore.keycloakRoles = []

    const wrapper = mount(EntityMenu, {
      vuetify,
      router,
      mixins: [{ methods: { isAllowed: () => false } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#historical-chip').exists()).toBe(false)
    expect(wrapper.find('#company-information-button').exists()).toBe(false)
    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a business', async () => {
    // set store properties
    businessStore.setGoodStanding(true)
    businessStore.setLegalName('My Business')
    businessStore.setLegalType(CorpTypeCd.COOP)
    rootStore.keycloakRoles = ['staff']

    // mock isAllowed mixin method
    function isAllowed (action: AllowableActions): boolean {
      if (action === AllowableActions.STAFF_COMMENT) return true
      if (action === AllowableActions.BUSINESS_INFORMATION) return true
      if (action === AllowableActions.VOLUNTARY_DISSOLUTION) return true
      if (action === AllowableActions.BUSINESS_SUMMARY) return true
      if (action === AllowableActions.DIGITAL_CREDENTIALS) return false
      return false
    }

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      router,
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: 'CP0001191' }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(true)
    expect(wrapper.find('#historical-chip').exists()).toBe(false)
    expect(wrapper.find('#company-information-button').exists()).toBe(true)
    expect(wrapper.find('.menu-btn').exists()).toBe(true)
    expect(wrapper.find('#download-summary-button').exists()).toBe(true)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a draft IA', async () => {
    // set store properties
    businessStore.setLegalName('My Named Company')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.entityStatus = EntityStatus.DRAFT_APP
    rootStore.keycloakRoles = ['staff']

    // mock isAllowed mixin method
    function isAllowed (action: AllowableActions): boolean {
      if (action === AllowableActions.STAFF_COMMENT) return false
      if (action === AllowableActions.BUSINESS_INFORMATION) return false
      if (action === AllowableActions.VOLUNTARY_DISSOLUTION) return false
      if (action === AllowableActions.BUSINESS_SUMMARY) return false
      if (action === AllowableActions.DIGITAL_CREDENTIALS) return false
      return false
    }

    const wrapper = mount(EntityMenu, {
      vuetify,
      router,
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#historical-chip').exists()).toBe(false)
    expect(wrapper.find('#company-information-button').exists()).toBe(false)
    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a filed IA', async () => {
    // set store properties
    businessStore.setLegalName('My Future Company')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.entityStatus = EntityStatus.FILED_APP
    rootStore.keycloakRoles = ['staff']

    // mock isAllowed mixin method
    function isAllowed (action: AllowableActions): boolean {
      if (action === AllowableActions.STAFF_COMMENT) return false
      if (action === AllowableActions.BUSINESS_INFORMATION) return false
      if (action === AllowableActions.VOLUNTARY_DISSOLUTION) return false
      if (action === AllowableActions.BUSINESS_SUMMARY) return false
      if (action === AllowableActions.DIGITAL_CREDENTIALS) return false
      return false
    }

    const wrapper = mount(EntityMenu, {
      vuetify,
      router,
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#historical-chip').exists()).toBe(false)
    expect(wrapper.find('#company-information-button').exists()).toBe(false)
    expect(wrapper.find('#dissolution-button').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })
})

describe('Entity Menu - HISTORICAL badge', () => {
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
      businessStore.setState(_.entityState as any)
      rootStore.setStateFiling(_.stateFiling as any || null)

      const wrapper = mount(EntityMenu, { vuetify, router, propsData: { businessId: null } })
      await Vue.nextTick()

      expect(wrapper.find('#historical-chip').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#historical-chip').text()).toBe('HISTORICAL')
        expect(wrapper.find('#historical-chip + span').text()).toBe(_.text)
      }

      wrapper.destroy()
    })
  })
})

describe('Entity Menu - View and Change Business Information button', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      businessId: 'BC1234567',
      state: 'ACTIVE',
      isAllowed: true,
      buttonExists: true
    },
    { // 1
      businessId: 'BC1234567',
      state: 'HISTORICAL',
      isAllowed: false,
      buttonExists: false
    },
    { // 2
      businessId: null,
      state: 'DRAFT_APP',
      isAllowed: false,
      buttonExists: false
    },
    { // 3
      businessId: null,
      state: 'FILED_APP',
      isAllowed: false,
      buttonExists: false
    },
    { // 4
      businessId: null,
      tempRegNumber: null,
      state: null,
      isAllowed: null,
      buttonExists: false
    }
  ]

  variations.forEach((_, index) => {
    it(`displays company info button properly - variation #${index}`, () => {
      businessStore.setState(_.state || null)

      const wrapper = shallowMount(EntityMenu, {
        vuetify,
        router,
        mixins: [{ methods: { isAllowed: () => _.isAllowed } }],
        propsData: { businessId: _.businessId }
      })

      // verify button
      const companyInformationButton = wrapper.find('#company-information-button')
      expect(companyInformationButton.exists()).toBe(_.buttonExists)

      wrapper.destroy()
    })
  })
})

describe('Entity Menu - View and Change Business Information click tests', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  xit('redirects to Edit URL to view/alter business info', async () => {
    // init session storage
    sessionStorage.clear()
    configurationStore.setTestConfiguration({ configuration: null },
      { key: 'VUE_APP_BUSINESS_EDIT_URL', value: 'https://edit.url/' })
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')

    // init store
    businessStore.setIdentifier('BC1234567')
    businessStore.setGoodStanding(true)
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setState(EntityState.ACTIVE)

    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })
    await Vue.nextTick()

    await wrapper.find('#company-information-button').trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/alteration'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('Entity Menu - Dissolve this Business click tests', () => {
  it('displays the Dissolve this Business button', async () => {
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.find('#dissolution-list-item').exists()).toBe(true)
    expect(wrapper.find('#dissolution-list-item').text()).toBe('Dissolve this Business')
    expect(wrapper.find('#dissolution-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })

  it('emits Confirm Dissolution event if in good standing', async () => {
    businessStore.setGoodStanding(true)
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    // click the button and verify emitted event
    await wrapper.find('#dissolution-list-item').trigger('click')
    expect(wrapper.emitted().confirmDissolution).toEqual([[]])

    wrapper.destroy()
  })

  it('emits Not In Good Standing event if not in good standing', async () => {
    businessStore.setGoodStanding(false)
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    // click the button and verify emitted event
    await wrapper.find('#dissolution-list-item').trigger('click')
    expect(wrapper.emitted().notInGoodStanding).toEqual([['dissolve']])

    wrapper.destroy()
  })
})

describe('Entity Menu - Business Summary click tests', () => {
  it('displays the Business Summary button', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })
    await Vue.nextTick()

    const button = wrapper.find('#download-summary-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Business Summary')

    wrapper.destroy()
  })

  it('emits Download Business Summary event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })
    await Vue.nextTick()

    // click the button and verify emitted event
    await wrapper.find('#download-summary-button').trigger('click')
    expect(wrapper.emitted().downloadBusinessSummary).toEqual([[]])

    wrapper.destroy()
  })
})

describe('Entity Menu - Business Digital Credentials click tests', () => {
  it('displays the Business Digital Credentials button', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })
    await Vue.nextTick()

    const button = wrapper.find('#view-add-digital-credentials-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Business Digital Credentials')

    wrapper.destroy()
  })

  it('emits View Add Digital Credentials event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })
    await Vue.nextTick()

    // click the button and verify emitted event
    await wrapper.find('#view-add-digital-credentials-button').trigger('click')
    expect(wrapper.emitted().viewAddDigitalCredentials).toEqual([[]])

    wrapper.destroy()
  })
})

describe('Entity Menu - More actions click tests', () => {
  it('renders More actions correctly', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    expect(wrapper.find('.menu-btn').text()).toBe('More Actions')

    wrapper.destroy()
  })

  it('does not render More actions if historical', async () => {
    businessStore.setState(EntityState.HISTORICAL)

    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => false } }],
      propsData: { businessId: 'BC1234567' }
    })

    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    wrapper.destroy()
  })

  it('does not render More actions if not a business', async () => {
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: null }
    })

    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    wrapper.destroy()
  })
})

describe('Entity Menu - Consent to Continuation click tests', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('displays the Consent to Continuation button', async () => {
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.find('#cco-list-item').exists()).toBe(true)
    expect(wrapper.find('#cco-list-item').text()).toBe('Consent to Continue Out')
    expect(wrapper.find('#cco-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })
})
