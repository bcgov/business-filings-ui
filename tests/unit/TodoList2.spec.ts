//
// This file differs from TodoList.spec.ts in that it tests "backwards" from the HTML,
// instead of working "forwards" from the data.
//

import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import TodoList from '@/components/Dashboard/TodoList.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingStatus, FilingSubTypes } from '@/enums'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

// Prevent the warning "[Vuetify] Unable to locate target #filing-history-list"
document.body.setAttribute('id', 'todo-list')

// FUTURE: expand this
describe('TodoList - common expansion panel header tests', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setGoodStanding(true)
  })

  it('handles empty data', async () => {
    // init store
    rootStore.tasks = []

    const wrapper = mount(TodoList, { vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify no-results message
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(vm.$el.querySelector('.no-results')).toBeDefined()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  xit('displays disabled task', async () => {
    // NB: this should only be NEW tasks (ie, blocked by another task)
    // verify class
    // verify disabled actions
    // verify title

  })

  xit('displays draft task with pay error', async () => {
    // verify class
    // verify red top border
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  xit('displays draft correction without comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  xit('displays draft correction with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  xit('displays draft correction as non-staff', async () => {
    // verify no resume button
    // verify no delete draft button
  })

  it('displays draft restoration as staff', async () => {
    // init store
    rootStore.tasks = [
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            header: {
              name: FilingTypes.RESTORATION,
              status: FilingStatus.DRAFT,
              filingId: 1,
              comments: []
            },
            business: {},
            restoration: { type: FilingSubTypes.FULL_RESTORATION }
          } as any
        }
      }
    ]

    const wrapper = mount(TodoList, {
      computed: { isRoleStaff: () => true },
      vuetify
    })
    await Vue.nextTick()

    // verify title
    // verify sub-title
    // verify resume button
    expect(wrapper.findAll('.todo-item').length).toEqual(1)
    expect(wrapper.find('.list-item__title').text()).toBe('Full Restoration')
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')
    expect(wrapper.find('.btn-draft-resume').exists()).toBe(true)

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-draft-delete').trigger('click')

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })

  it('displays draft restoration as non-staff', async () => {
    // init store
    rootStore.tasks = [
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            header: {
              name: FilingTypes.RESTORATION,
              status: FilingStatus.DRAFT,
              filingId: 1,
              comments: []
            },
            business: {},
            restoration: { type: FilingSubTypes.FULL_RESTORATION }
          } as any
        }
      }
    ]

    const wrapper = mount(TodoList, {
      computed: { isRoleStaff: () => false },
      vuetify
    })
    await Vue.nextTick()

    // verify title
    // verify sub-title
    // verify no resume button
    expect(wrapper.findAll('.todo-item').length).toEqual(1)
    expect(wrapper.find('.list-item__title').text()).toBe('Full Restoration')
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')
    expect(wrapper.find('.btn-draft-resume').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays draft consent to continuation out as staff', async () => {
    // init store
    rootStore.tasks = [
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            header: {
              name: FilingTypes.CONSENT_CONTINUATION_OUT,
              status: FilingStatus.DRAFT,
              filingId: 1,
              comments: []
            },
            business: {},
            consentContinuationOut: { comment: 'line1\nline2' }
          } as any
        }
      }
    ]

    const wrapper = mount(TodoList, {
      computed: { isRoleStaff: () => true },
      vuetify
    })
    await Vue.nextTick()

    // verify title
    // verify sub-title
    // verify resume button
    expect(wrapper.findAll('.todo-item').length).toEqual(1)
    expect(wrapper.find('.list-item__title').text()).toBe('Consent to Continuation Out')
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')
    expect(wrapper.find('.btn-draft-resume').exists()).toBe(true)

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-draft-delete').trigger('click')

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })

  it('displays draft consent to continuation out as non-staff', async () => {
    // init store
    rootStore.tasks = [
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            header: {
              name: FilingTypes.CONSENT_CONTINUATION_OUT,
              status: FilingStatus.DRAFT,
              filingId: 1,
              comments: []
            },
            business: {},
            consentContinuationOut: { comment: 'line1\nline2' }
          } as any
        }
      }
    ]

    const wrapper = mount(TodoList, {
      computed: { isRoleStaff: () => false },
      vuetify
    })
    await Vue.nextTick()

    // verify title
    // verify sub-title
    // verify no resume button
    expect(wrapper.findAll('.todo-item').length).toEqual(1)
    expect(wrapper.find('.list-item__title').text()).toBe('Consent to Continuation Out')
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')
    expect(wrapper.find('.btn-draft-resume').exists()).toBe(false)

    wrapper.destroy()
  })

  xit('displays draft alteration without comments', async () => {
    // verify title
    // verify sub-title
    // verify detaild expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  xit('displays draft alteration with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  xit('displays draft alteration as staff', async () => {
    // verify resume button
    // verify delete draft button
  })

  xit('displays new task with subtitle', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
  })

  xit('displays new task without subtitle', async () => {
    // verify title
    // verify no sub-title
    // verify no details expand-btn
  })

  xit('displays draft IA for numbered company', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify "incorporate a numbered company" button
  })

  xit('displays draft IA for named business', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify "incorporate using this nr" button
  })

  xit('displays correction-pending correction', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  xit('displays correction-pending alteration', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  xit('displays pending task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  xit('displays pending task with online banking pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  xit('displays pending task with other pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  xit('displays error task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  xit('displays error task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  xit('displays paid task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  xit('displays paid task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })
})

// FUTURE: implement this
xdescribe('TodoList - common actions list tests', () => {
})

// FUTURE: implement this
xdescribe('TodoList - common expansion panel content tests', () => {
})

// FUTURE: implement this
xdescribe('TodoList - tests specific to Cooperatives', () => {
  // beforeAll(() => {
  // sessionStorage.clear()
  // sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
  // businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  // })
  //
  // FUTURE: add any Coop-specific tests here
  // eg, year in title
  // eg, no checkbox (as with BENs)
  //
})

// FUTURE: implement this
xdescribe('TodoList - tests specific to corporations (BEN, etc)', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  })

  it('displays new AR header/checkbox', async () => {
    // verify title
    // verify bcomp ar subtitle
    // verify no subtitle
    // verify enable-checkbox
    // verify no details expand-btn
    // verify date subtitle
  })
})

// FUTURE: implement this
xdescribe('TodoList - tests specific to Incorporation Applications', () => {
  // beforeAll(() => {
  // sessionStorage.clear()
  // sessionStorage.setItem('TEMP_REG_NUMBER', 'TaAbBcC123')
  // businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  // })
  //
  // FUTURE: verify numbered vs named IAs (see also Filing History List unit tests)
  //
})

// FUTURE: implement this
xdescribe('TodoList - tests specific to Name Requests', () => {
  // this functionality is current disabled in the code
  // FUTURE: implement appropriate unit tests here
})
