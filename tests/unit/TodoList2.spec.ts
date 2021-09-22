//
// This file differs from TodoList.spec.ts in that it tests "backwards" from the HTML,
// instead of working "forwards" from the data.
//

import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import TodoList from '@/components/Dashboard/TodoList.vue'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // make type-less for unit tests

xdescribe('TodoList - common expansion panel header tests', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    store.state.entityType = 'CP'
  })

  it('handles empty data', async () => {
    // init store
    store.state.tasks = []

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(vm.$el.querySelector('.no-results')).toBeDefined()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  it('displays disabled task', async () => {
    // NB: this should only be NEW tasks (ie, blocked by another task)
    // verify class
    // verify disabled actions
    // verify title

  })

  it('displays draft task with pay error', async () => {
    // verify class
    // verify red top border
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it('displays draft correction without comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  it('displays draft correction with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  it('displays draft correction as staff', async () => {
    // verify resume button
    // verify delete draft button
  })

  it('displays draft alteration without comments', async () => {
    // verify title
    // verify sub-title
    // verify detaild expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  it('displays draft alteration with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  it('displays draft alteration as staff', async () => {
    // verify resume button
    // verify delete draft button
  })

  it('displays new task with subtitle', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
  })

  it('displays new task without subtitle', async () => {
    // verify title
    // verify no sub-title
    // verify no details expand-btn
  })

  it('displays draft IA for numbered company', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify "incorporate a numbered company" button
  })

  it('displays draft IA for named business', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify "incorporate using this nr" button
  })

  it('displays correction-pending correction', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  it('displays correction-pending alteration', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  it('displays pending task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it('displays pending task with online banking pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it('displays pending task with other pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it('displays error task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it('displays error task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it('displays paid task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it('displays paid task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })
})

xdescribe('TodoList - common actions list tests', () => {
})

xdescribe('TodoList - common expansion panel content tests', () => {
})

xdescribe('TodoList - tests specific to Benefit Companies', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    store.state.entityType = 'BEN'
  })

  it('displays new AR header/checkbox', async () => {
    // verify title
    // verify bcorps-ar-subtitle
    // verify no subtitle
    // verify enable-checkbox
    // verify no details expand-btn
    // verify date subtitle
  })
})

xdescribe('TodoList - tests specific to Incorporation Applications', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'TaAbBcC123')
    store.state.entityType = 'BEN'
  })
  //
  // TODO: numbered vs named
  //
})

xdescribe('TodoList - tests specific to Name Requests', () => {
  // this functionality is current disabled in the code
  // FUTURE: implement appropriate unit tests here
})
