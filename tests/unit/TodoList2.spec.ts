//
// This file differs from TodoList.spec.ts in that it tests "backwards" from the HTML,
// instead of working "forwards" from the data.
//

import { AuthServices } from '@/services'
import flushPromises from 'flush-promises'
import sinon from 'sinon'
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import TodoList from '@/components/Dashboard/TodoList.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { AffiliationInvitationStatus, AffiliationInvitationType, FilingStatus, FilingSubTypes } from '@/enums'
import * as utils from '@/utils'

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

  it('display affiliation invitation todo (request access, open)', async () => {
    rootStore.tasks = []
    businessStore.businessInfo = Object.assign(businessStore.businessInfo, { identifier: 'testIdentifier' })

    const sandbox = sinon.createSandbox()
    const fetchAffiliationInvites = sandbox.stub(AuthServices, 'fetchAffiliationInvitations')

    // feature flag override
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(
      (flag) => {
        if (flag === 'enable-affiliation-invitation-request-access') {
          return true
        } else {
          return false
        }
      })

    fetchAffiliationInvites.returns(new Promise(
      resolve => resolve(
        {
          config: undefined,
          headers: undefined,
          status: 200,
          statusText: '',
          data: {
            affiliationInvitations: [
              // returns 3 items, but only 1st one should be displayed
              {
                id: 12,
                type: AffiliationInvitationType.REQUEST,
                status: AffiliationInvitationStatus.PENDING,
                entity: {
                  businessIdentifier: 'BC0871427',
                  name: '0871427 B.C. LTD.',
                  corpType: 'BC',
                  state: 'ACTIVE'
                },
                toOrg: { name: 'Two Monkeys are friends Corp.', id: 3113 },
                fromOrg: { name: 'Tree Frog Design Inc.', id: 1114 }
              },
              {
                id: 17,
                type: AffiliationInvitationType.EMAIL,
                status: AffiliationInvitationStatus.PENDING,
                entity: {
                  businessIdentifier: 'BC0871428',
                  name: '0871427 B.C. LTD.',
                  corpType: 'BC',
                  state: 'ACTIVE'
                },
                toOrg: { name: 'Two Monkeys are friends Corp.', id: 3113 },
                fromOrg: { name: 'Some other org', id: 8787 }
              },
              {
                id: 19,
                type: AffiliationInvitationType.EMAIL,
                status: AffiliationInvitationStatus.PENDING,
                entity: {
                  businessIdentifier: 'BC0871429',
                  name: '0871427 B.C. LTD.',
                  corpType: 'BC',
                  state: 'ACTIVE'
                },
                toOrg: { name: 'Two Monkeys are friends Corp.', id: 3113 },
                fromOrg: { name: 'Some third org', id: 8787 }
              }
            ]
          }
        }
      )))

    const wrapper = mount(TodoList, { vuetify })
    await flushPromises()

    expect(wrapper.findAll('.todo-item').length).toEqual(1)
    // verify title starts with
    expect(wrapper.find('.list-item__title').text())
      .toContain('Request for authorization to manage this business')

    // verify subtitle has information
    expect(wrapper.find('.todo-subtitle').text()).toBe('From: Tree Frog Design Inc.')

    // verify both buttons authorize and do not authorize are visible
    const actionBtns = wrapper.findAll('.affiliation-invitation-action-button')

    const { wrappers } = actionBtns
    const btnTexts = wrappers.map(actionBtn => actionBtn.text())

    expect(actionBtns.length).toBe(2)
    expect(['Authorize', 'Do not authorize'].every(btnText => btnTexts.includes(btnText)))

    fetchAffiliationInvites.restore()
    vi.restoreAllMocks()
    wrapper.destroy()
  })

  it.skip('displays disabled task', async () => {
    // NB: this should only be NEW tasks (ie, blocked by another task)
    // verify class
    // verify disabled actions
    // verify title

  })

  it.skip('displays draft task with pay error', async () => {
    // verify class
    // verify red top border
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it.skip('displays draft correction without comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  it.skip('displays draft correction with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  it.skip('displays draft correction as non-staff', async () => {
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

  it('displays draft consent to continuation out (staff and non-staff)', async () => {
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

  it.skip('displays draft alteration without comments', async () => {
    // verify title
    // verify sub-title
    // verify detaild expand-btn
    // verify no resume button
    // verify no delete draft button
  })

  it.skip('displays draft alteration with comments', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify comments "button"
    // verify no resume button
    // verify no delete draft button
  })

  it.skip('displays draft alteration as staff', async () => {
    // verify resume button
    // verify delete draft button
  })

  it.skip('displays new task with subtitle', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
  })

  it.skip('displays new task without subtitle', async () => {
    // verify title
    // verify no sub-title
    // verify no details expand-btn
  })

  it.skip('displays draft IA for numbered company', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify "incorporate a numbered company" button
  })

  it.skip('displays draft IA for named business', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
    // verify "incorporate using this nr" button
  })

  it.skip('displays correction-pending correction', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  it.skip('displays correction-pending alteration', async () => {
    // verify title
    // verify sub-title
    // verify comments "button"
    // verify no action buttons
  })

  it.skip('displays pending task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it.skip('displays pending task with online banking pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it.skip('displays pending task with other pay method', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it.skip('displays error task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it.skip('displays error task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })

  it.skip('displays paid task in process', async () => {
    // verify title
    // verify sub-title
    // verify no details expand-btn
    // verify loading button
  })

  it.skip('displays paid task', async () => {
    // verify title
    // verify sub-title
    // verify details expand-btn
  })
})

// FUTURE: implement this
describe.skip('TodoList - common actions list tests', () => {
})

// FUTURE: implement this
describe.skip('TodoList - common expansion panel content tests', () => {
})

// FUTURE: implement this
describe.skip('TodoList - tests specific to Cooperatives', () => {
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
describe.skip('TodoList - tests specific to corporations (BEN, etc)', () => {
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
describe.skip('TodoList - tests specific to Incorporation Applications', () => {
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
describe.skip('TodoList - tests specific to Name Requests', () => {
  // this functionality is current disabled in the code
  // FUTURE: implement appropriate unit tests here
})
