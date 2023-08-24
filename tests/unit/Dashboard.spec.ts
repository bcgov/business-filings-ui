// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import mockRouter from './mockRouter'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import { AllowableActions, CorpTypeCd } from '@/enums'

// Components
import Dashboard from '@/views/Dashboard.vue'
import { CoaWarningDialog } from '@/components/dialogs'
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

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
      data: () => ({
        isInGoodStanding: true
      }),
      computed: {
        isGoodStanding: {
          get (): boolean {
            return this.$data.isInGoodStanding
          },
          set (val: boolean) {
            this.$data.isInGoodStanding = val
          }
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

  it('Alert does not display by default, and does display for business not in good standing', async () => {
    expect(wrapper.find('#dashboard-alerts-section').exists()).toBe(false)
    wrapper.setData({ isInGoodStanding: false })
    await Vue.nextTick()

    expect(wrapper.find('#dashboard-alerts-section').exists()).toBe(true)
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
    expect(vm.$route.params.filingId).toBe(0)

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
    expect(vm.$route.params.filingId).toBe(0)

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
    expect(vm.$route.params.filingId).toBe(0)

    wrapper.destroy()
  })
})
