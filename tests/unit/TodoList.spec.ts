import Vue from 'vue'
import Vuetify from 'vuetify'
import Vue2Filters from 'vue2-filters'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import { createLocalVue, mount } from '@vue/test-utils'
import axios from '@/axios-auth'
import sinon from 'sinon'
import mockRouter from './mockRouter'
import { getVuexStore } from '@/store'
import TodoList from '@/components/Dashboard/TodoList.vue'
import flushPromises from 'flush-promises'

// Components
import { DetailsList } from '@/components/common'
import PaymentPending from '@/components/Dashboard/TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from '@/components/Dashboard/TodoList/PaymentPendingOnlineBanking.vue'
import PaymentIncomplete from '@/components/Dashboard/TodoList/PaymentIncomplete.vue'
import PaymentPaid from '@/components/Dashboard/TodoList/PaymentPaid.vue'
import PaymentUnsuccessful from '@/components/Dashboard/TodoList/PaymentUnsuccessful.vue'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vue2Filters)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app: HTMLDivElement = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

describe('TodoList - UI', () => {
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

    expect(vm.taskItems.length).toEqual(0)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(wrapper.emitted('task-count')).toEqual([[0]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).not.toBeNull()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  it('displays multiple task items', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2017,
              'status': 'NEW',
              'filingId': 1
            },
            'business': {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      },
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2018,
              'status': 'NEW',
              'filingId': 2
            },
            'business': {
              'nextAnnualReport': '2018-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 2
      },
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW',
              'filingId': 3
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 3
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('task-count')).toEqual([[3]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    // verify that first task is enabled and other 2 are disabled
    const item1 = vm.$el.querySelectorAll('.todo-item')[0]
    const item2 = vm.$el.querySelectorAll('.todo-item')[1]
    const item3 = vm.$el.querySelectorAll('.todo-item')[2]

    // check list items
    expect(item1.classList.contains('disabled')).toBe(false)
    expect(item2.classList.contains('disabled')).toBe(true)
    expect(item3.classList.contains('disabled')).toBe(true)

    // check action buttons
    expect(item1.querySelector('.list-item__actions .v-btn').disabled).toBe(false)
    expect(item2.querySelector('.list-item__actions .v-btn').disabled).toBe(true)
    expect(item3.querySelector('.list-item__actions .v-btn').disabled).toBe(true)

    wrapper.destroy()
  })

  it('displays a NEW \'Annual Report\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW',
              'filingId': 1
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent)
      .toContain('(including Address and/or Director Change)')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  it('displays a DRAFT \'Annual Report\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 1
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })

  it('displays a DRAFT \'Address Change\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfAddress',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 1
            },
            'changeOfAddress': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Address Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })

  it('displays a DRAFT \'Director Change\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 1
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })

  it('displays a DRAFT \'Correction\' task for a client', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'correction',
              'status': 'DRAFT',
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017). Filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            'correction': {
              'correctedFilingType': 'annualReport'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    // Validate the resume button does not exist for NON-staff
    expect(item.querySelector('.list-item__actions .v-btn')).toBeNull()

    wrapper.destroy()
  })

  it('displays a DRAFT \'Correction\' task for staff', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'correction',
              'status': 'DRAFT',
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017). Filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            'correction': {
              'correctedFilingType': 'annualReport'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]
    // Only staff may resume drafts
    store.state.keycloakRoles = ['staff']

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    // Validate the resume button exists and is enabled for Staff
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })

  it('displays details on a DRAFT \'Correction\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'correction',
              'status': 'DRAFT',
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017). Filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            'correction': {
              'correctedFilingType': 'annualReport'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // Only staff may resume drafts
    store.state.keycloakRoles = ['user']

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')

    expect(item.querySelector('.list-item__subtitle .todo-subtitle').textContent)
      .toContain('Detail (1)')

    // Validate the child component does NOT exist on the parent before opening the dropdown
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // click the View Details button
    const button = item.querySelector('.list-item__subtitle .todo-subtitle .expand-btn')
    await button.click()

    expect(vm.$el.querySelector('#todo-list .todo-list-detail').textContent)
      .toContain('This filing is in review and has been saved as a draft.')

    // Validate that the resume button does not exist for NON-Staff
    expect(item.querySelector('.list-item__actions .v-btn')).toBeNull()

    // Validate the child component exists on the parent after opening the dropdown
    expect(wrapper.find(DetailsList).exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays a PENDING_CORRECTION \'Correction\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'correction',
              'ARFilingYear': 2019,
              'status': 'PENDING_CORRECTION',
              'paymentToken': 12345678,
              'filingId': 1
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'correction': {
              'correctedFilingType': 'annualReport'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')

    wrapper.destroy()
  })

  it('displays details on a PENDING \'Correction\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'correction',
              'status': 'PENDING_CORRECTION',
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017). Filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            'correction': {
              'correctedFilingType': 'annualReport'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')

    expect(item.querySelector('.list-item__subtitle .todo-subtitle').textContent)
      .toContain('Detail (1)')

    // Validate the child component does NOT exist on the parent before opening the dropdown
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // click the View Details button
    const button = item.querySelector('.list-item__subtitle .todo-subtitle .expand-btn')
    await button.click()

    expect(vm.$el.querySelector('#todo-list .todo-list-detail').textContent)
      .toContain('This filing is pending review by Registry Staff.')

    // Validate that the resume button does not exist for NON-Staff
    expect(item.querySelector('.list-item__actions .v-btn')).toBeNull()

    // Validate the child component exists on the parent after opening the dropdown
    expect(wrapper.find(DetailsList).exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT INCOMPLETE task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 1
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    // click the View Details button
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // validate that child component exists
    expect(wrapper.find(PaymentPending).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT UNSUCCESSFUL task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'ERROR',
              'paymentToken': 12345678,
              'filingId': 1
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT UNSUCCESSFUL')

    // click the View Details button
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // validate that child component exists
    expect(wrapper.find(PaymentUnsuccessful).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - ONLINE BANKING PAYMENT PENDING task', async () => {
    // init store
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'annualReport',
              ARFilingYear: 2019,
              status: 'PENDING',
              filingId: 1,
              paymentToken: 12345678,
              paymentMethod: 'ONLINE_BANKING'
            },
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('ONLINE BANKING PAYMENT PENDING')

    // click the View Details button
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // validate that child component exists
    expect(wrapper.find(PaymentPendingOnlineBanking).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Change Payment Type')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAID task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PAID',
              'paymentToken': 12345678,
              'filingId': 1
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAID')

    // click the View Details button
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // validate that child component exists
    expect(wrapper.find(PaymentPaid).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button).toBeNull()

    wrapper.destroy()
  })

  it('displays a PROCESSING message on a filing that is expected to be complete', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 123
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 123 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(vm.taskItems[0].id).toEqual(wrapper.props('inProcessFiling'))
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PROCESSING...')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('does not break if a filing is marked as processing, that is not in the to-do list', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 123
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 456 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(vm.taskItems[0].id).not.toEqual(wrapper.props('inProcessFiling'))
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    wrapper.destroy()
  })
})

describe('TodoList - UI - BCOMP', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    store.state.entityType = 'BEN'
  })

  it('handles empty data', async () => {
    // init store
    store.state.tasks = []

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(0)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(wrapper.emitted('task-count')).toEqual([[0]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).not.toBeNull()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  it('displays multiple task items', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2017,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      },
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2018,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2018-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 2
      },
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 3
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('task-count')).toEqual([[3]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    // verify that first task is enabled and other 2 are disabled
    const item1 = vm.$el.querySelectorAll('.todo-item')[0]
    const item2 = vm.$el.querySelectorAll('.todo-item')[1]
    const item3 = vm.$el.querySelectorAll('.todo-item')[2]

    // check list items
    expect(item1.classList.contains('disabled')).toBe(false)
    expect(item2.classList.contains('disabled')).toBe(true)
    expect(item3.classList.contains('disabled')).toBe(true)

    // Check Checkboxes
    expect(item1.querySelector('.todo-list-checkbox')).toBeDefined()
    expect(item2.querySelector('.todo-list-checkbox')).toBeDefined()
    expect(item3.querySelector('.todo-list-checkbox')).toBeDefined()

    // Simulate Checkbox being selected to enable first File Now button
    wrapper.find('#enable-checkbox').trigger('click')

    // check action buttons
    expect(item1.querySelector('.list-item__actions .v-btn').disabled).toBe(false)
    expect(item2.querySelector('.list-item__actions .v-btn').disabled).toBe(true)
    expect(item3.querySelector('.list-item__actions .v-btn').disabled).toBe(true)

    wrapper.destroy()
  })

  it('displays a NEW \'Annual Report\' task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.bcorps-ar-subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    // Simulate Checkbox being selected to enable File Now Button
    wrapper.find('#enable-checkbox').trigger('click')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  it('disables \'File Annual Report\' and verification checkbox when COA is pending', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0, coaPending: true } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.bcorps-ar-subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    // Verify checkbox is disabled
    expect(wrapper.find('#enable-checkbox').attributes('disabled')).toBe('disabled')

    // Simulate the attempt to enable the File Annual Report btn
    wrapper.find('#enable-checkbox').trigger('click')

    // Verify File Annual Report btn is disabled
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(wrapper.find('.list-item__actions .v-btn').attributes('disabled')).toBe('disabled')
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  it('displays a task but \'File Now\' is disabled when checkbox is unselected', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.bcorps-ar-subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(true) // TODO: fix
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT INCOMPLETE task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'paymentToken': 12345678
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT UNSUCCESSFUL task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'ERROR',
              'paymentToken': 12345678
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT UNSUCCESSFUL')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAID task', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PAID',
              'paymentToken': 12345678
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAID')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button).toBeNull()

    wrapper.destroy()
  })

  it('displays a PROCESSING message on a filing that is expected to be complete', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 123
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 123 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(vm.taskItems[0].id).toEqual(wrapper.props('inProcessFiling'))
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PROCESSING...')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('does not break if a filing is marked as processing, that is not in the to-do list', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'changeOfDirectors',
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 123
            },
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 456 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(vm.taskItems[0].id).not.toEqual(wrapper.props('inProcessFiling'))
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    wrapper.destroy()
  })
})

describe('TodoList - UI - Incorp Apps', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
  })

  it('displays a DRAFT numbered company IA', async () => {
    // init store
    store.state.nameRequest = null
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'incorporationApplication',
              status: 'DRAFT'
            },
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('BC Benefit Company Incorporation Application')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('NR APPROVED')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('PAYMENT INCOMPLETE')
    expect(item.querySelector('.expand-btn')).toBeNull()

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Incorporate a Numbered Company')

    wrapper.destroy()
  })

  it('displays a DRAFT named company IA', async () => {
    // init store
    store.state.nameRequest = {}
    store.state.entityName = 'My Business Inc'
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'incorporationApplication',
              status: 'DRAFT'
            },
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('BC Benefit Company Incorporation Application - My Business Inc')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('NR APPROVED')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('DRAFT')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('PAYMENT INCOMPLETE')
    expect(item.querySelector('.expand-btn').textContent).toContain('View Details')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Incorporate using this NR')

    wrapper.destroy()
  })

  it('displays a PENDING numbered company IA', async () => {
    // init store
    store.state.nameRequest = null
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'incorporationApplication',
              status: 'PENDING'
            },
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('BC Benefit Company Incorporation Application')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('DRAFT')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('NR APPROVED')
    expect(item.querySelector('.expand-btn').textContent).toContain('View Details')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })

  it('displays a PENDING named company IA', async () => {
    // init store
    store.state.nameRequest = {}
    store.state.entityName = 'My Business Inc'
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'incorporationApplication',
              status: 'PENDING'
            },
            nameRequest: {},
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await flushPromises()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('task-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[true]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('BC Benefit Company Incorporation Application - My Business Inc')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('DRAFT')
    expect(item.querySelector('.list-item__subtitle').textContent).not.toContain('NR APPROVED')
    expect(item.querySelector('.expand-btn').textContent).toContain('View Details')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests', () => {
  const { assign } = window.location

  beforeAll(() => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    store.state.businessId = 'CP0001191'
    store.state.entityIncNo = 'CP0001191'
    store.state.entityType = 'CP'

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('routes to Annual Report page when \'File Now\' clicked', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW',
              'filingId': 1
            },
            'business': {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, store, router, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.textContent).toContain('File Annual Report')

    await button.click()

    // verify that filing status was set
    expect(vm.$store.state.currentFilingStatus).toBe('NEW')

    // verify routing to Annual Report page with id=0
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe(0)

    wrapper.destroy()
  })

  it('routes to Annual Report page when \'Resume\' is clicked', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 123
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, store, router, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    await button.click()

    // verify that filing status was set
    expect(vm.$store.state.currentFilingStatus).toBe('DRAFT')

    // verify routing to Annual Report page with id=123
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe(123)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Resume Payment\' is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'filingId': 456,
              'paymentToken': 654
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    await button.click()

    // verify redirection
    const payURL = 'auth/makepayment/654/' + encodeURIComponent('business/?filing_id=456')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Retry Payment\' is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'ERROR',
              'filingId': 789,
              'paymentToken': 987
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')

    await button.click()

    // verify redirection
    const payURL = 'auth/makepayment/987/' + encodeURIComponent('business/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Change Payment Type\' is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    // init store
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'annualReport',
              ARFilingYear: 2019,
              status: 'PENDING',
              filingId: 789,
              paymentToken: 987,
              paymentMethod: 'ONLINE_BANKING'
            },
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Change Payment Type')

    await button.click()

    // verify redirection
    const payURL = 'auth/makepayment/987/' + encodeURIComponent('business/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('captures payment error in todo list', async () => {
    sessionStorage.setItem('PAY_API_URL', '')
    // store a task with a filing associated to a payment error
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 123,
              'paymentStatusCode': 'BCOL_ERROR'
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // stub out a response from the Error endpoint in Pay API
    sinon.stub(axios, 'get').withArgs('codes/errors/BCOL_ERROR')
      .returns(new Promise(resolve => resolve({
        data: {
          detail: 'An error has occurred',
          title: 'Error'
        }
      })))

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await flushPromises()

    // validate that todo item exists
    const todoItem = vm.$el.querySelector('.pay-error')
    expect(todoItem).toBeDefined()

    // validate the title and sub-title
    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    // click the View Details button
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // validate that child component exists
    expect(wrapper.find(PaymentIncomplete).exists()).toBe(true)

    // confirm the message is visible after expansion panel clicked
    const bcolPanel = vm.$el.querySelector('.payment-incomplete')
    expect(bcolPanel.textContent).toContain('Payment Incomplete - Error')
    expect(bcolPanel.textContent).toContain('An error has occurred')

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - BCOMPs', () => {
  const { assign } = window.location

  beforeAll(() => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    store.state.businessId = 'BC0007291'
    store.state.entityIncNo = 'BC0007291'

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
    store.state.entityType = 'BEN'
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('routes to Annual Report page when \'File Now\' clicked', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'todo': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'NEW'
            },
            'business': {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, store, router, vuetify, propsData: { inProcessFiling: 0 } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    // verify model state
    expect(vm.enableCheckbox[0]).toBeUndefined()

    // verify checkbox content
    const firstTodoItem = vm.$el.querySelectorAll('.todo-item')[0]
    const htmlDivElement = firstTodoItem.querySelector('.bcorps-ar-subtitle .todo-list-checkbox')
    expect(htmlDivElement.textContent)
      .toContain('All information about the Office Addresses and Current Directors is correct.')

    // verify that checkbox is enabled
    const htmlInputElement = htmlDivElement.querySelector('[type="checkbox"]')
    expect(htmlInputElement.disabled).toBe(false)

    // verify File Now button
    const listItem = vm.$el.querySelector('.list-item')
    const fileNowButton = listItem.querySelector('.list-item__actions .v-btn')
    expect(fileNowButton.querySelector('.v-btn__content').textContent).toContain('File Annual Report')
    expect(fileNowButton.disabled).toBe(true)

    // click checkbox to enable File Now button
    await htmlInputElement.click()
    expect(vm.enableCheckbox[0]).toBe(true)
    expect(fileNowButton.disabled).toBe(false)

    // click File Now button
    await fileNowButton.click()

    // verify that filing status was set
    expect(vm.$store.state.currentFilingStatus).toBe('NEW')

    // verify routing to Annual Report page with id=0
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe(0)

    wrapper.destroy()
  })

  it('routes to Annual Report page when \'Resume\' is clicked', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 123
            },
            'annualReport': {
              'annualReportDate': '2019-07-15',
              'nextARDate': '2020-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, store, router, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    await button.click()

    // verify that filing status was set
    expect(vm.$store.state.currentFilingStatus).toBe('DRAFT')

    // verify routing to Annual Report page with id=123
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe(123)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Resume Payment\' is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'filingId': 456,
              'paymentToken': 654
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    await button.click()

    // verify redirection
    const payURL = 'auth/makepayment/654/' + encodeURIComponent('business/?filing_id=456')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Retry Payment\' is clicked', async () => {
    // set necessary session variables
    sessionStorage.setItem('BASE_URL', `${process.env.VUE_APP_PATH}/`)
    sessionStorage.setItem('AUTH_URL', 'auth/')

    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'ERROR',
              'filingId': 789,
              'paymentToken': 987
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')

    await button.click()

    // verify redirection
    const payURL = 'auth/makepayment/987/' + encodeURIComponent('business/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - NRs and Incorp Apps', () => {
  const { assign } = window.location

  beforeAll(() => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('CREATE_URL', `${process.env.VUE_APP_PATH}/create/`)
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityName = 'My Business Inc'
    store.state.entityType = 'BEN'

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Create URL when \'Resume\' is clicked on a Named Company draft IA', async () => {
    // init Incorporation Application filing task
    store.state.tasks = [
      {
        task: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              accountId: '123',
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567'
              }
            }
          }
        },
        enabled: true,
        order: 1
      }
    ]
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityStatus = 'DRAFT_INCORP_APP'

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const button = wrapper.find('.list-item__actions .v-btn')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.find('.v-btn__content').text()).toContain('Incorporate using this NR')

    button.trigger('click')
    await flushPromises()

    // verify redirection
    const createUrl = 'business/create/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })

  it('redirects to Create URL when \'Resume\' is clicked on a Numbered Company draft IA', async () => {
    // init Incorporation Application filing task
    store.state.tasks = [
      {
        task: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BEN'
            },
            header: {
              accountId: '123',
              date: '2020-05-21T00:11:55.887740+00:00',
              name: 'incorporationApplication',
              status: 'DRAFT',
              filingId: 789
            }
          }
        },
        enabled: true,
        order: 1
      }
    ]
    store.state.nameRequest = null
    store.state.entityStatus = 'DRAFT_INCORP_APP'

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    const button = wrapper.find('.list-item__actions .v-btn')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.find('.v-btn__content').text()).toContain('Incorporate a Numbered Company')

    button.trigger('click')
    await flushPromises()

    // verify redirection
    const createUrl = 'business/create/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - IA Corrections', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Edit URL to resume a draft IA correction', async () => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('EDIT_URL', `${process.env.VUE_APP_PATH}/edit/`)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityIncNo = 'BC1234567'
    // init draft Correction filing task
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'correction',
              status: 'DRAFT',
              filingId: 123,
              comments: []
            },
            correction: {
              correctedFilingType: 'incorporationApplication'
            }
          }
        },
        enabled: true,
        order: 1
      }
    ]
    store.state.keycloakRoles = ['staff'] // only staff may resume draft corrections

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')
    wrapper.find('.btn-corr-draft-resume').trigger('click')
    await Vue.nextTick()

    // verify redirection
    const editUrl = 'business/edit/BC1234567/correction?correction-id=123'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl)

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - Alterations', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Edit URL to resume a draft alteration', async () => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('EDIT_URL', `${process.env.VUE_APP_PATH}/edit/`)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    sessionStorage.setItem('SHOW_COMPANY_INFO_BUTTON', 'yes') // FUTURE: remove this
    store.state.entityIncNo = 'BC1234567'
    // store.state.entityType = 'LTD' // FUTURE: uncomment this
    store.state.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'alteration',
              status: 'DRAFT',
              filingId: 123,
              comments: []
            },
            alteration: {}
          }
        },
        enabled: true,
        order: 1
      }
    ]
    store.state.keycloakRoles = ['staff'] // only staff may resume draft alterations

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')

    wrapper.find('.btn-corr-draft-resume').trigger('click')
    await Vue.nextTick()

    // verify redirection
    const editUrl = 'business/edit/BC1234567/alteration?alteration-id=123'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl)

    wrapper.destroy()
  })
})

describe('TodoList - Delete Draft', () => {
  const { assign } = window.location
  let deleteCall: any

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    deleteCall = sinon.stub(axios, 'delete')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('shows confirmation popup when \'Delete Draft\' is clicked', async () => {
    // init store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 789
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    await Vue.nextTick()

    wrapper.find('#menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-delete-draft').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })

  it('calls DELETE endpoint when user clicks confirmation OK', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 789
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    wrapper.find('#menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-delete-draft').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(vm.$refs.confirm.dialog).toBeTruthy()

    // click the OK button (call the 'yes' callback function)
    await vm.$refs.confirm.onClickYes()

    // confirm that delete API was called
    expect(deleteCall.called).toBeTruthy()

    wrapper.destroy()
  })

  it('does not call DELETE endpoint when user clicks confirmation Cancel', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'DRAFT',
              'filingId': 789
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    wrapper.find('#menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-delete-draft').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(vm.$refs.confirm.dialog).toBeTruthy()

    // click the cancel button (call the 'cancel' callback function)
    await vm.$refs.confirm.onClickCancel()

    // confirm that delete API was not called
    expect(deleteCall.called).toBeFalsy()

    wrapper.destroy()
  })

  it('shows confirmation popup when \'Delete Incorporation Application\' is clicked', async () => {
    // init
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityIncNo = 'T123456789'
    store.state.entityType = 'BEN'
    store.state.entityStatus = 'DRAFT_INCORP_APP'
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'incorporationApplication',
              'status': 'DRAFT',
              'filingId': 789
            },
            'incorporationApplication': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    await Vue.nextTick()

    wrapper.find('#menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-delete-incorporation').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })
})

describe('TodoList - Cancel Payment', () => {
  const { assign } = window.location
  let patchCall: any

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    patchCall = sinon.stub(axios, 'patch')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('shows confirmation popup when \'Cancel Payment\' is clicked', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'filingId': 789,
              'paymentToken': 123
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    await Vue.nextTick()

    wrapper.find('#pending-item-menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-cancel-payment').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirmCancelPaymentDialog).toBeTruthy()

    wrapper.destroy()
  })

  it('calls PATCH endpoint when user clicks confirmation OK', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'filingId': 789,
              'paymentToken': 123
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    wrapper.find('#pending-item-menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-cancel-payment').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(vm.$refs.confirmCancelPaymentDialog.dialog).toBeTruthy()

    // click the OK button (call the 'yes' callback function)
    await vm.$refs.confirmCancelPaymentDialog.onClickYes()

    // confirm that delete API was called
    expect(patchCall.called).toBeTruthy()

    wrapper.destroy()
  })

  it('does not call the PATCH endpoint when user clicks confirmation Cancel', async () => {
    // init store
    store.state.tasks = [
      {
        'task': {
          'filing': {
            'header': {
              'name': 'annualReport',
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'filingId': 789,
              'paymentToken': 123
            },
            'annualReport': {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            'changeOfAddress': {},
            'changeOfDirectors': {}
          }
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    wrapper.find('#pending-item-menu-activator').trigger('click')
    await flushPromises()

    wrapper.find('#btn-cancel-payment').trigger('click')
    await flushPromises()

    // verify confirmation popup is showing
    expect(vm.$refs.confirmCancelPaymentDialog.dialog).toBeTruthy()

    // click the cancel button (call the 'cancel' callback function)
    await vm.$refs.confirmCancelPaymentDialog.onClickCancel()

    // confirm that delete API was not called
    expect(patchCall.called).toBeFalsy()

    wrapper.destroy()
  })
})
