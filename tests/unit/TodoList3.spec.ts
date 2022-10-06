//
// This test suite differs from TodoList1.spec.ts and TodoList2.spec.ts in that it
// tests by filing type. This test suite may ultimately replace TodoList2.spec.ts.
//

import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import TodoList from '@/components/Dashboard/TodoList.vue'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// FUTURE: implement this
describe('TodoList - dialogs', () => {
  it('displays Confirm Dialog correctly', () => {
  })

  it('displays Delete Error Dialog correctly', () => {
  })

  it('displays Cancel Payment Error Dialog correctly', () => {
  })
})

// FUTURE: implement this
describe('TodoList - action required', () => {
  it('displays Action Required component correctly', () => {
  })
})

// FUTURE: implement this
describe('TodoList - panel header for NEW status', () => {
  let wrapper: any

  beforeAll(async () => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    store.state.entityType = 'CP'

    // init store
    store.state.tasks = []

    wrapper = mount(TodoList, { store, vuetify })
    await Vue.nextTick()
  })

  afterAll(() => {
    wrapper.destroy()
  })

  it('displays list item info correctly', () => {
  })

  it('displays list item actions correctly', () => {
  })

  it('displays panel content correctly', () => {
  })
})

// FUTURE: implement this
describe('TodoList - panel header for DRAFT status', () => {
})

// FUTURE: implement this
describe('TodoList - panel header for PENDING status', () => {
})

// FUTURE: implement this
describe('TodoList - panel header for ERROR status', () => {
})

// FUTURE: implement this
describe('TodoList - panel header for PAID status', () => {
})
