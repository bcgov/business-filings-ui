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

// mock the mixin to always return True
const AllowableActionsMixin: any = {
  methods: {
    isAllowed: () => true
  }
}

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
    expect(wrapper.find('#ia-reg-description').exists()).toBeFalsy()
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

    expect(wrapper.find('#ia-reg-name').text()).toBe('My Named Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
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

    expect(wrapper.find('#ia-reg-name').text()).toBe('Numbered Benefit Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
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

    expect(wrapper.find('#ia-reg-name').text()).toBe('My Future Company')
    expect(wrapper.find('#entity-status').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-incorporation-number').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-email').exists()).toBeFalsy()
    expect(wrapper.find('#entity-business-phone').exists()).toBeFalsy()
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
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
    expect(wrapper.find('#ia-reg-description').exists()).toBeFalsy()
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

describe('EntityInfo - View and Change Business Information', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      businessId: 'BC1234567',
      state: 'ACTIVE',
      buttonExists: true
    },
    { // 1
      businessId: 'BC1234567',
      state: 'HISTORICAL',
      buttonExists: false
    },
    { // 2
      tempRegNumber: 'T123456789',
      state: 'DRAFT_APP',
      buttonExists: false
    },
    { // 3
      tempRegNumber: 'T123456789',
      state: 'FILED_APP',
      buttonExists: false
    },
    { // 4
      businessId: null,
      tempRegNumber: null,
      state: null,
      buttonExists: false
    }
  ]

  variations.forEach((_, index) => {
    it(`displays company info button properly - variation #${index}`, () => {
      sessionStorage.clear()
      if (_.businessId) sessionStorage.setItem('BUSINESS_ID', _.businessId)
      if (_.tempRegNumber) sessionStorage.setItem('TEMP_REG_NUMBER', _.tempRegNumber)

      store.commit('setState', _.state || null)

      const wrapper = shallowMount(EntityInfo, {
        store,
        vuetify,
        router,
        mixins: [AllowableActionsMixin]
      })

      // verify button
      const companyInformationButton = wrapper.find('#company-information-button')
      expect(companyInformationButton.exists()).toBe(_.buttonExists)
    })
  })
})

describe('EntityInfo - LIMITED RESTORATION badge', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      stateFiling: null,
      exists: false
    },
    { // 1
      stateFiling: { restoration: { type: 'limitedRestoration' } },
      exists: true
    },
    { // 2
      stateFiling: { restoration: { type: 'limitedRestorationExtension' } },
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
    it(`conditionally displays limited restoration badge - variation #${index}`, async () => {
      // init store
      store.state.stateFiling = _.stateFiling

      const wrapper = mount(EntityInfo, { vuetify, store, router })
      await Vue.nextTick()

      expect(wrapper.find('#limited-restoration').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#limited-restoration').text()).toContain('Active until')
        expect(wrapper.find('#limited-restoration').text()).toContain('LIMITED RESTORATION')
      }

      // cleanup
      store.state.stateFiling = null
      wrapper.destroy()
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

      expect(wrapper.find('#authorized-to-continue-out').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#authorized-to-continue-out').text()).toBe('AUTHORIZED TO CONTINUE OUT')
      }

      // cleanup
      store.state.stateFiling = null
      wrapper.destroy()
    })
  })
})

describe('EntityInfo - HISTORICAL badge', () => {
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

    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
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

describe('EntityInfo - Click Tests - Dissolutions', () => {
  beforeEach(() => {
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.commit('setState', 'ACTIVE')
  })

  it('displays the Dissolve this Business button', () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    const button = wrapper.find('#dissolution-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Dissolve this Business')
    expect(button.classes()).not.toContain('v-btn--disabled') // enabled
  })

  it('does not display the button if no business id', () => {
    sessionStorage.removeItem('BUSINESS_ID')

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    expect(wrapper.find('#dissolution-button').exists()).toBe(false)
  })

  it('does not display the button if historical', () => {
    store.commit('setState', 'HISTORICAL')

    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    expect(wrapper.find('#dissolution-button').exists()).toBe(false)
  })

  it('displays the button as disabled if action is not allowed', () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [{ methods: { isAllowed: () => false } }]
    })

    const button = wrapper.find('#dissolution-button')
    expect(button.exists()).toBe(true)
    expect(button.classes()).toContain('v-btn--disabled')
  })

  it('emits Confirm Dissolution event if in good standing', async () => {
    store.commit('setGoodStanding', true)

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    // click the button and verify emitted event
    await wrapper.find('#dissolution-button').trigger('click')
    expect(wrapper.emitted().confirmDissolution).toEqual([[]])
  })

  it('emits Not In Good Standing event if not in good standing', async () => {
    store.commit('setGoodStanding', false)

    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    // click the button and verify emitted event
    await wrapper.find('#dissolution-button').trigger('click')
    expect(wrapper.emitted().notInGoodStanding).toEqual([['dissolve']])
  })
})

describe('EntityInfo - Click Tests - Business Summary', () => {
  it('displays the Business Summary button', () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    const button = wrapper.find('#download-summary-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Business Summary')
  })

  it('emits Download Business Summary event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    // click the button and verify emitted event
    await wrapper.find('#download-summary-button').trigger('click')
    expect(wrapper.emitted().downloadBusinessSummary).toEqual([[]])
  })
})

describe('EntityInfo - Click Tests - Business Digital Credentials', () => {
  it('displays the Business Digital Credentials button', () => {
    // mount the component and wait for everything to stabilize
    const wrapper = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    const button = wrapper.find('#view-add-digital-credentials-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Business Digital Credentials')
  })

  it('emits View Add Digital Credentials event', async () => {
    // mount the component and wait for everything to stabilize
    const wrapper: any = mount(EntityInfo, {
      store,
      vuetify,
      mixins: [AllowableActionsMixin]
    })

    // click the button and verify emitted event
    await wrapper.find('#view-add-digital-credentials-button').trigger('click')
    expect(wrapper.emitted().viewAddDigitalCredentials).toEqual([[]])
  })
})
