import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import EntityMenu from '@/components/EntityInfo/EntityMenu.vue'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import { AllowableActions, CorpTypeCd, EntityState, EntityStatus } from '@/enums'
import * as utils from '@/utils'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Entity Menu - entities', () => {
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
      mixins: [{ methods: { isAllowed: () => false } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#business-information-button').exists()).toBe(false)
    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a coop', async () => {
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
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: 'CP0001191' }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(true)
    expect(wrapper.find('#business-information-button').exists()).toBe(true)
    expect(wrapper.find('.menu-btn').exists()).toBe(true)
    expect(wrapper.find('#download-summary-button').exists()).toBe(true)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a draft IA', async () => {
    // set store properties
    businessStore.setLegalName('My Named Company')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.entityStatus = EntityStatus.DRAFT_INCORP_APP
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
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#business-information-button').exists()).toBe(false)
    expect(wrapper.find('.menu-btn').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays entity info properly for a filed IA', async () => {
    // set store properties
    businessStore.setLegalName('My Future Company')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.entityStatus = EntityStatus.FILED_INCORP_APP
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
      mixins: [{ methods: { isAllowed } }],
      propsData: { businessId: null }
    })
    await Vue.nextTick()

    expect(wrapper.findComponent(StaffComments).exists()).toBe(false)
    expect(wrapper.find('#business-information-button').exists()).toBe(false)
    expect(wrapper.find('#dissolution-button').exists()).toBe(false)
    expect(wrapper.find('#download-summary-button').exists()).toBe(false)
    expect(wrapper.find('#view-add-digital-credentials-button').exists()).toBe(false)

    wrapper.destroy()
  })
})

describe('Entity Menu - View and Change Business Information button', () => {
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
      state: 'DRAFT_INCORP_APP',
      isAllowed: false,
      buttonExists: false
    },
    { // 3
      businessId: null,
      state: 'FILED_INCORP_APP',
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
        mixins: [{ methods: { isAllowed: () => _.isAllowed } }],
        propsData: { businessId: _.businessId }
      })

      // verify button
      const companyInformationButton = wrapper.find('#business-information-button')
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
    window.location = { assign: vi.fn() } as any

    const configuration = {
      VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Edit URL to view/alter business info', async () => {
    // init session storage
    sessionStorage.clear()
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

    await wrapper.find('#business-information-button').trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/alteration'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('redirects to special-resolution for a coop', async () => {
    // init session storage
    sessionStorage.clear()
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2299" }')

    // init store
    businessStore.setIdentifier('CP1234567')
    businessStore.setGoodStanding(true)
    businessStore.setLegalType(CorpTypeCd.COOP)
    businessStore.setState(EntityState.ACTIVE)

    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'CP1234567' }
    })
    await Vue.nextTick()

    await wrapper.find('#business-information-button').trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/CP1234567/special-resolution'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('Entity Menu - Amalgamate button tests', () => {
  beforeAll(() => {
    // override feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-agm-extension-entities') return ''
      if (flag === 'supported-agm-location-chg-entities') return ''
      if (flag === 'supported-amalgamation-entities') return 'BEN'
      if (flag === 'supported-consent-amalgamation-out-entities') return ''
      if (flag === 'supported-consent-continuation-out-entities') return ''
      return null
    })
  })

  afterAll(() => {
    // restore feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockRestore()
  })

  it('displays the Amalgamate button', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.$state.businessInfo.state = EntityState.ACTIVE

    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#amalgamate-list-item').exists()).toBe(true)
    expect(wrapper.find('#amalgamate-list-item').text()).toBe('Amalgamate')
    expect(wrapper.find('#amalgamate-list-item').classes()).not.toContain('v-list-item--disabled') // enabled
    wrapper.destroy()
  })

  it('amalgamate button is disabled if not allowed', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.$state.businessInfo.state = EntityState.ACTIVE

    const wrapper = mount(EntityMenu, {
      vuetify,
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#amalgamate-list-item').exists()).toBe(true)
    expect(wrapper.find('#amalgamate-list-item').text()).toBe('Amalgamate')
    expect(wrapper.find('#amalgamate-list-item').classes()).toContain('v-list-item--disabled') // disabled
    wrapper.destroy()
  })
})

describe('Entity Menu - Dissolve this Business click tests', () => {
  it('displays the Dissolve this Business button', async () => {
    businessStore.setState(EntityState.ACTIVE)

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

describe('Entity Menu - Digital Business Cards click tests', () => {
  it('displays the Digital Business Cards button', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    const button = wrapper.find('#view-add-digital-credentials-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Digital Business Cards')

    wrapper.destroy()
  })

  it('emits View Add Digital Credentials event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

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

it('renders More actions if historical and digital credential feature is allowed', async () => {
  businessStore.setState(EntityState.HISTORICAL)

  const wrapper = mount(EntityMenu, {
    vuetify,
    mixins: [{ methods: { isAllowed: () => true } }],
    propsData: { businessId: 'BC1234567' }
  })

  expect(wrapper.find('.menu-btn').exists()).toBe(true)
  wrapper.destroy()
})

describe('Entity Menu - Consent to Amalgamation Out click tests', () => {
  beforeAll(() => {
    // override feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-agm-extension-entities') return ''
      if (flag === 'supported-agm-location-chg-entities') return ''
      if (flag === 'supported-amalgamation-entities') return ''
      if (flag === 'supported-consent-amalgamation-out-entities') return 'BEN'
      if (flag === 'supported-consent-continuation-out-entities') return ''
      return null
    })
  })

  afterAll(() => {
    // restore feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockRestore()
  })

  it('displays the Consent to Amalgamate Out button', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#consent-amalgamate-out-list-item').exists()).toBe(true)
    expect(wrapper.find('#consent-amalgamate-out-list-item').text()).toBe('Consent to Amalgamate Out')
    expect(wrapper.find('#consent-amalgamate-out-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })
})

describe('Entity Menu - Consent to Continuation Out click tests', () => {
  beforeAll(() => {
    // override feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-agm-extension-entities') return ''
      if (flag === 'supported-agm-location-chg-entities') return ''
      if (flag === 'supported-amalgamation-entities') return ''
      if (flag === 'supported-consent-amalgamation-out-entities') return ''
      if (flag === 'supported-consent-continuation-out-entities') return 'BEN'
      return null
    })
  })

  afterAll(() => {
    // restore feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockRestore()
  })

  it('displays the Consent to Continue Out button', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setState(EntityState.ACTIVE)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#consent-continue-out-list-item').exists()).toBe(true)
    expect(wrapper.find('#consent-continue-out-list-item').text()).toBe('Consent to Continue Out')
    expect(wrapper.find('#consent-continue-out-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })
})

describe('Entity Menu - Request AGM Extension click tests', () => {
  beforeAll(() => {
    // override feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-agm-extension-entities') return 'BEN'
      if (flag === 'supported-agm-location-chg-entities') return ''
      if (flag === 'supported-amalgamation-entities') return ''
      if (flag === 'supported-consent-amalgamation-out-entities') return ''
      if (flag === 'supported-consent-continuation-out-entities') return ''
      return null
    })
  })

  afterAll(() => {
    // restore feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockRestore()
  })

  it('displays the Request AGM Extension button', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#agm-ext-list-item').exists()).toBe(true)
    expect(wrapper.find('#agm-ext-list-item').text()).toBe('Request AGM Extension')
    expect(wrapper.find('#agm-ext-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })
})

describe('Entity Menu - Request AGM Location Change click tests', () => {
  beforeAll(() => {
    // override feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-agm-extension-entities') return ''
      if (flag === 'supported-agm-location-chg-entities') return 'BEN'
      if (flag === 'supported-amalgamation-entities') return ''
      if (flag === 'supported-consent-amalgamation-out-entities') return ''
      if (flag === 'supported-consent-continuation-out-entities') return ''
      return null
    })
  })

  afterAll(() => {
    // restore feature flag
    vi.spyOn(utils, 'GetFeatureFlag').mockRestore()
  })

  it('displays the Request AGM Location Change button', async () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityMenu, {
      vuetify,
      mixins: [{ methods: { isAllowed: () => true } }],
      propsData: { businessId: 'BC1234567' }
    })

    await wrapper.find('.menu-btn').trigger('click')

    expect(wrapper.find('#agm-loc-chg-list-item').exists()).toBe(true)
    expect(wrapper.find('#agm-loc-chg-list-item').text()).toBe('Request AGM Location Change')
    expect(wrapper.find('#agm-loc-chg-list-item').classes()).not.toContain('v-btn--disabled') // enabled

    wrapper.destroy()
  })
})
