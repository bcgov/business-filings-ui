import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import mockRouter from './mockRouter'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'

// Components
import Dashboard from '@/views/Dashboard.vue'
import { CoaWarningDialog } from '@/components/dialogs'
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'

// NB: test util async issue
// in some cases, the elements are not updated during the test
// the work-around is to first initialize the property we are changing
// suppress update watchers warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app: HTMLDivElement = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

describe('Dashboard - UI', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(() => {
    // create wrapper for Dashboard
    // this stubs out the 5 sub-components
    wrapper = shallowMount(Dashboard, { store, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the dashboard sub-components properly', () => {
    expect(wrapper.find(CoaWarningDialog).exists()).toBe(true)
    expect(wrapper.find(TodoList).exists()).toBe(true)
    expect(wrapper.find(FilingHistoryList).exists()).toBe(true)
    expect(wrapper.find(AddressListSm).exists()).toBe(true)
    expect(wrapper.find(DirectorListSm).exists()).toBe(true)
  })

  it('updates its counts from sub-component events', () => {
    wrapper.find(TodoList).vm.$emit('todo-count', 2)
    wrapper.find(FilingHistoryList).vm.$emit('filed-count', 3)

    expect(vm.todoCount).toEqual(2)
    expect(vm.filedCount).toEqual(3)
  })

  it('enables standalone filing buttons when there are no blocker filings in the to-do list', () => {
    wrapper.find(TodoList).vm.$emit('has-blocker-filing', false)

    expect(vm.hasBlockerFiling).toEqual(false)
    expect(vm.$el.querySelector('#standalone-addresses-button')
      .getAttribute('disabled')).toBeNull()
    expect(vm.$el.querySelector('#standalone-directors-button')
      .getAttribute('disabled')).toBeNull()
  })

  it('disables standalone filing buttons when there is a blocker filing in the to-do list', () => {
    wrapper.find(TodoList).vm.$emit('has-blocker-filing', true)

    expect(vm.hasBlockerFiling).toEqual(true)
    expect(vm.$el.querySelector('#standalone-addresses-button')
      .getAttribute('disabled')).toBe('true')
    expect(vm.$el.querySelector('#standalone-directors-button')
      .getAttribute('disabled')).toBe('true')
  })

  it('disables filing buttons when there is a future effective filing pending', () => {
    store.state.entityType = 'BC'

    wrapper.find(FilingHistoryList).vm.$emit('filings-list',
      [{ 'name': 'Address Change', 'status': 'PAID' }])
    wrapper.find(TodoList).vm.$emit('has-blocker-filing', true)

    expect(vm.hasBlockerFiling).toEqual(true)
    expect(vm.coaPending).toEqual(true)
    expect(vm.$el.querySelector('#standalone-addresses-button')
      .getAttribute('disabled')).toBe('true')
    expect(vm.$el.querySelector('#standalone-directors-button')
      .getAttribute('disabled')).toBe('true')
  })
})

describe('Dashboard - In Process Tests', () => {
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(() => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'

    // mock "get filing" endpoint
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/123')
      .returns(new Promise((resolve) => resolve({
        data: {
          filing: {
            header: {
              status: 'PENDING'
            }
          }
        }
      })))

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    // set Filing ID in URL to indicate that we've returned from the dashboard from a filing (file pay, not save draft)
    router.push({ name: 'dashboard', query: { filing_id: '123' } })

    wrapper = shallowMount(Dashboard, { localVue, store, router, vuetify })
    vm = wrapper.vm as any
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('marks filing as PROCESSING when expecting completed filing and dashboard does not reflect this', () => {
    // verify Filing ID passed in
    expect(vm.$route.query.filing_id).toBe('123')

    // emit Todo List _with_ the pending filing
    wrapper.find(TodoList).vm.$emit('todo-filings', [
      { id: 123 }
    ])

    // emit Filings List _without_ the completed filing
    wrapper.find(FilingHistoryList).vm.$emit('filings-list', [])

    // clear Todo List so test can end
    wrapper.find(TodoList).vm.$emit('todo-filings', [])

    // verify that filing is "in process"
    expect(vm.inProcessFiling).toEqual(123)

    wrapper.destroy()
  })

  it('does not mark filing as PROCESSING when expecting completed filing and dashboard reflects this', () => {
    // verify Filing ID passed in
    expect(vm.$route.query.filing_id).toBe('123')

    // emit Todo List _without_ the pending filing
    wrapper.find(TodoList).vm.$emit('todo-filings', [])

    // emit Filings List _with_ the completed filing
    wrapper.find(FilingHistoryList).vm.$emit('filings-list', [
      { id: 123 }
    ])

    // verify that there is no "in process" filing
    expect(vm.inProcessFiling).toBeNull()

    wrapper.destroy()
  })
})

describe('Dashboard - Click Tests', () => {
  it('routes to Standalone Office Address Filing page when EDIT is clicked', done => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityType = 'CP'

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    const wrapper = shallowMount(Dashboard, { localVue, store, router, vuetify })
    const vm = wrapper.vm as any

    Vue.nextTick(async () => {
      const button = vm.$el.querySelector('#standalone-addresses-button')
      expect(button.textContent).toContain('Change')
      await button.click()

      // verify routing to Standalone Office Address Filing page with id=0
      expect(vm.$route.name).toBe('standalone-addresses')
      expect(vm.$route.params.filingId).toBe(0)

      wrapper.destroy()
      done()
    })
  })

  it('displays the change of address warning dialog as a BCOMP', done => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityType = 'BC'

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    router.push({ name: 'dashboard' })

    const wrapper = shallowMount(Dashboard, { localVue, store, router, vuetify })
    const vm = wrapper.vm as any

    vm.coaWarningDialog = false // initially hidden

    Vue.nextTick(async () => {
      const button = vm.$el.querySelector('#standalone-addresses-button')
      expect(button.textContent).toContain('Change')
      await button.click()

      expect(vm.coaWarningDialog).toBe(true)
      expect(wrapper.find('#dialog-toggle-button')).toBeDefined()
      expect(wrapper.find('#dialog-proceed-button')).toBeDefined()

      wrapper.find(CoaWarningDialog).vm.$emit('proceed', true)

      expect(vm.$route.name).toBe('standalone-addresses')
      expect(vm.$route.params.filingId).toBe(0)

      wrapper.destroy()
      done()
    })
  })

  it('routes to Standalone Directors Filing page when EDIT is clicked', done => {
    // init store
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    const wrapper = shallowMount(Dashboard, { localVue, store, router, vuetify })
    const vm = wrapper.vm as any

    Vue.nextTick(async () => {
      const button = vm.$el.querySelector('#standalone-directors-button')
      expect(button.textContent).toContain('Change')
      await button.click()

      // verify routing to Standalone Directors Filing page with id=0
      expect(vm.$route.name).toBe('standalone-directors')
      expect(vm.$route.params.filingId).toBe(0)

      wrapper.destroy()
      done()
    })
  })
})
