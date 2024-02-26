// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import mockRouter from './mockRouter'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import { AllowableActions, CorpTypeCd, EntityStatus } from '@/enums'

// Components
import Dashboard from '@/views/Dashboard.vue'
import { CoaWarningDialog } from '@/components/dialogs'
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'

// Alerts
import Amalgamation from '@/components/Dashboard/Alerts/Amalgamation.vue'
import FrozenInformation from '@/components/Dashboard/Alerts/FrozenInformation.vue'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import NotInCompliance from '@/components/Dashboard/Alerts/NotInCompliance.vue'
import NotInGoodStanding from '@/components/Dashboard/Alerts/NotInGoodStanding.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('Dashboard - UI', () => {
  const $route = { query: {} }
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(() => {
    // create wrapper for Dashboard
    // this stubs out the 5 sub-components
    wrapper = shallowMount(Dashboard, {
      vuetify,
      mocks: { $route },
      // create local properties for use in computed object below
      data: () => ({
        _isFutureEffectiveAmalgamation: false,
        _isAdminFrozen: false,
        _hasMissingInfoWarning: false,
        _hasComplianceWarning: false,
        _isGoodStanding: true
      }),
      // declare computed properties to override store getters/actions
      computed: {
        isFutureEffectiveAmalgamation: {
          get (): boolean { return this.$data._isFutureEffectiveAmalgamation },
          set (val: boolean) { this.$data._isFutureEffectiveAmalgamation = val }
        },
        isAdminFrozen: {
          get (): boolean { return this.$data._isAdminFrozen },
          set (val: boolean) { this.$data._isAdminFrozen = val }
        },
        hasMissingInfoWarning: {
          get (): boolean { return this.$data._hasMissingInfoWarning },
          set (val: boolean) { this.$data._hasMissingInfoWarning = val }
        },
        hasComplianceWarning: {
          get (): boolean { return this.$data._hasComplianceWarning },
          set (val: boolean) { this.$data._hasComplianceWarning = val }
        },
        isGoodStanding: {
          get (): boolean { return this.$data._isGoodStanding },
          set (val: boolean) { this.$data._isGoodStanding = val }
        }
      }
    })
    vm = wrapper.vm
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the dashboard sub-components properly', () => {
    expect(wrapper.findComponent(CoaWarningDialog).exists()).toBe(true)
    expect(wrapper.findComponent(TodoList).exists()).toBe(true)
    expect(wrapper.findComponent(FilingHistoryList).exists()).toBe(true)
    expect(wrapper.findComponent(AddressListSm).exists()).toBe(true)
    expect(wrapper.findComponent(DirectorListSm).exists()).toBe(true)

    // verify no alerts are displayed
    expect(wrapper.find('#dashboard-alerts-section').exists()).toBe(false)
  })

  it('identifies app tasks vs app filings', () => {
    const tests = [
      { entityStatus: EntityStatus.DRAFT_AMALGAMATION, isAppTask: true },
      { entityStatus: EntityStatus.DRAFT_INCORP_APP, isAppTask: true },
      { entityStatus: EntityStatus.DRAFT_REGISTRATION, isAppTask: true },
      { entityStatus: EntityStatus.FILED_AMALGAMATION, isAppFiling: true },
      { entityStatus: EntityStatus.FILED_INCORP_APP, isAppFiling: true },
      { entityStatus: EntityStatus.FILED_REGISTRATION, isAppFiling: true }
    ]

    tests.forEach((test) => {
      rootStore.entityStatus = test.entityStatus
      expect(vm.isAppTask).toBe(!!test.isAppTask)
      expect(vm.isAppFiling).toBe(!!test.isAppFiling)
    })
  })

  it('identifies app tasks vs app filings', () => {
    const tests = [
      { entityStatus: EntityStatus.DRAFT_AMALGAMATION, isAppTask: true },
      { entityStatus: EntityStatus.DRAFT_INCORP_APP, isAppTask: true },
      { entityStatus: EntityStatus.DRAFT_REGISTRATION, isAppTask: true },
      { entityStatus: EntityStatus.FILED_AMALGAMATION, isAppFiling: true },
      { entityStatus: EntityStatus.FILED_INCORP_APP, isAppFiling: true },
      { entityStatus: EntityStatus.FILED_REGISTRATION, isAppFiling: true }
    ]

    tests.forEach((test) => {
      rootStore.entityStatus = test.entityStatus
      expect(vm.isAppTask).toBe(!!test.isAppTask)
      expect(vm.isAppFiling).toBe(!!test.isAppFiling)
    })
  })

  it('updates its counts from sub-component events', () => {
    wrapper.findComponent(TodoList).vm.$emit('todo-count', 2)
    // wrapper.findComponent(FilingHistoryList).vm.$emit('history-count', 3)

    expect(vm.todoCount).toEqual(2)
    // expect(vm.getHistoryCount).toEqual(3)
  })

  it('enables standalone filing buttons when actions are allowed', async () => {
    // re-mount the component since setting session storage is not reactive
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    const localWrapper: Wrapper<Vue> = shallowMount(Dashboard, { vuetify, mocks: { $route } })
    const localVm: any = localWrapper.vm

    vi.spyOn(vm, 'isHistorical', 'get').mockReturnValue(false)
    businessStore.setAllowedActions({
      digitalBusinessCard: false,
      filing: {
        filingTypes: [
          { name: 'changeOfAddress' },
          { name: 'changeOfDirectors' }
        ]
      } as any
    })
    await Vue.nextTick()

    expect(localVm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(true)
    expect(localVm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(true)

    expect(localWrapper.find('#standalone-addresses-button').attributes('disabled')).toBeUndefined()
    expect(localWrapper.find('#standalone-directors-button').attributes('disabled')).toBeUndefined()
  })

  it('disables standalone filing buttons when actions are not allowed', async () => {
    // re-mount the component since setting session storage is not reactive
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    const localWrapper: Wrapper<Vue> = shallowMount(Dashboard, { vuetify, mocks: { $route } })
    const localVm: any = localWrapper.vm

    vi.spyOn(vm, 'isHistorical', 'get').mockReturnValue(false)
    businessStore.setAllowedActions({
      digitalBusinessCard: false,
      filing: {
        filingTypes: []
      } as any
    })
    await Vue.nextTick()

    expect(localVm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)
    expect(localVm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    expect(localWrapper.find('#standalone-addresses-button').attributes('disabled')).toBe('true')
    expect(localWrapper.find('#standalone-directors-button').attributes('disabled')).toBe('true')
  })

  it('disables filing buttons when there is a BCOMP Future Effective COA', async () => {
    // re-mount the component since setting session storage is not reactive
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    const localWrapper: Wrapper<Vue> = shallowMount(Dashboard, { vuetify, mocks: { $route } })
    const localVm: any = localWrapper.vm

    await Vue.nextTick()

    expect(localVm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)
    expect(localVm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    expect(localWrapper.find('#standalone-addresses-button').attributes('disabled')).toBe('true')
    expect(localWrapper.find('#standalone-directors-button').attributes('disabled')).toBe('true')
  })

  it('disables standalone filing buttons when there is no Business ID', async () => {
    // re-mount the component since setting session storage is not reactive
    sessionStorage.removeItem('BUSINESS_ID')
    const localWrapper: Wrapper<Vue> = shallowMount(Dashboard, { vuetify, mocks: { $route } })
    const localVm: any = localWrapper.vm

    expect(localVm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)
    expect(localVm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    expect(localWrapper.find('#standalone-addresses-button').attributes('disabled')).toBe('true')
    expect(localWrapper.find('#standalone-directors-button').attributes('disabled')).toBe('true')
  })

  it('displays the Amalgamation alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(Amalgamation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isFutureEffectiveAmalgamation: true })
    expect(wrapper.findComponent(Amalgamation).exists()).toBe(true)

    // cleanup
    await wrapper.setData({ isFutureEffectiveAmalgamation: false })
  })

  it('displays the Frozen Information alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(FrozenInformation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isAdminFrozen: true })
    expect(wrapper.findComponent(FrozenInformation).exists()).toBe(true)

    // cleanup
    await wrapper.setData({ isAdminFrozen: false })
  })

  it('displays the Missing Information alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(MissingInformation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ hasMissingInfoWarning: true })
    expect(wrapper.findComponent(MissingInformation).exists()).toBe(true)

    // cleanup
    await wrapper.setData({ hasMissingInfoWarning: false })
  })

  it('displays the Not In Compliance alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(NotInCompliance).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ hasComplianceWarning: true })
    expect(wrapper.findComponent(NotInCompliance).exists()).toBe(true)

    // cleanup
    await wrapper.setData({ hasComplianceWarning: false })
  })

  it('displays the Not In Good Standing alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(NotInGoodStanding).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isGoodStanding: false })
    expect(wrapper.findComponent(NotInGoodStanding).exists()).toBe(true)

    // cleanup
    await wrapper.setData({ isGoodStanding: true })
  })
})

describe('Dashboard - Route Parameter Tests', () => {
  it('sets Filing Id to a falsy value when the route query parameter doesn\'t exist', () => {
    const $route = { query: {} }
    const wrapper = shallowMount(Dashboard, { mocks: { $route } })
    const vm = wrapper.vm as any

    expect(vm.filingId).toBeFalsy()

    wrapper.destroy()
  })

  it('sets Filing Id to the numeric value of the route query parameter when it exists', () => {
    const $route = { query: { filing_id: '123' } }
    const wrapper = shallowMount(Dashboard, { mocks: { $route } })
    const vm = wrapper.vm as any

    expect(vm.filingId).toBe(123)

    wrapper.destroy()
  })
})

describe('Dashboard - Click Tests', () => {
  it('routes to Standalone Office Address Filing page when EDIT is clicked', async () => {
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    // init store
    businessStore.setIdentifier('CP1234567')
    businessStore.setLegalType(CorpTypeCd.COOP)

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard', query: {} })

    const wrapper = shallowMount(Dashboard, { localVue, router, vuetify })
    const vm = wrapper.vm as any

    const button = wrapper.find('#standalone-addresses-button')
    expect(button.text()).toContain('Change')
    await button.trigger('click')

    // verify routing to Standalone Office Address Filing page with id=0
    expect(vm.$route.name).toBe('standalone-addresses')
    expect(vm.$route.params.filingId).toBe('0')

    wrapper.destroy()
  })

  it('displays the change of address warning dialog as a BCOMP', async () => {
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    // init store
    businessStore.setIdentifier('BC1234567')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard', query: {} })

    const wrapper = shallowMount(Dashboard, { localVue, router, vuetify })
    const vm = wrapper.vm as any

    vm.coaWarningDialog = false // initially hidden

    const button = wrapper.find('#standalone-addresses-button')
    expect(button.text()).toContain('Change')
    await button.trigger('click')

    expect(vm.coaWarningDialog).toBe(true)
    expect(wrapper.find('#dialog-toggle-button')).toBeDefined()
    expect(wrapper.find('#dialog-proceed-button')).toBeDefined()

    wrapper.findComponent(CoaWarningDialog).vm.$emit('proceed', true)

    expect(vm.$route.name).toBe('standalone-addresses')
    expect(vm.$route.params.filingId).toBe('0')

    wrapper.destroy()
  })

  it('routes to Standalone Directors Filing page when EDIT is clicked', async () => {
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    // init store
    businessStore.setIdentifier('CP1234567')

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ query: {} })

    const wrapper = shallowMount(Dashboard, { localVue, router, vuetify })
    const vm = wrapper.vm as any

    const button = wrapper.find('#standalone-directors-button')
    expect(button.text()).toContain('Change')
    await button.trigger('click')

    // verify routing to Standalone Directors Filing page with id=0
    expect(vm.$route.name).toBe('standalone-directors')
    expect(vm.$route.params.filingId).toBe('0')

    wrapper.destroy()
  })
})
