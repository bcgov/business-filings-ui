import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'
import axios from '@/axios-auth'
import sinon from 'sinon'
import mockRouter from './mockRouter'
import { getVuexStore } from '@/store'
import TodoList from '@/components/Dashboard/TodoList.vue'
import flushPromises from 'flush-promises'

// Components
import { DetailsList } from '@/components/common'
import Vue2Filters from 'vue2-filters'

// NB: test util async issue
// in some cases, the elements are not updated during the test
// the work-around is to first initialize the property we are changing
// suppress update watchers warnings
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
    expect(wrapper.emitted('todo-count')).toEqual([[0]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('todo-count')).toEqual([[3]])
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.todo-label .list-item__title').textContent).toContain('File 2019 Annual Report')
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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

    // Open the details list dropdown
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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

    // Open the details list dropdown
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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

  // FUTURE: enable when/if we have NRs without a draft
  xit('displays the Name Request details in the Todo list', async () => {
    // init store
    store.state.tasks = [
      {
        'enabled': true,
        'order': 1,
        'task': {
          'todo': {
            'header': {
              'name': 'nameRequest',
              'status': 'NEW'
            },
            'nameRequest': {
              'additionalInfo': '',
              'applicants': {
                'addrLine1': '1234 Fake Street',
                'addrLine2': 'Block 3',
                'addrLine3': 'Suite 1001',
                'city': 'Victoria',
                'clientFirstName': 'Connor',
                'clientLastName': 'Horton',
                'contact': 'James Bond',
                'countryTypeCd': 'CA',
                'declineNotificationInd': 'N',
                'emailAddress': 'abc@test.com',
                'faxNumber': null,
                'firstName': 'Adam',
                'lastName': 'Smith',
                'middleName': 'Jane',
                'partyId': 1657726,
                'phoneNumber': '7777777777',
                'postalCd': 'V9E 3S2',
                'stateProvinceCd': 'BC'
              },
              'comments': [],
              'consentFlag': null,
              'consent_dt': null,
              'corpNum': null,
              'entity_type_cd': 'CR',
              'expirationDate': 'Mon, 21 Nov 2022 08:00:00 GMT',
              'furnished': 'Y',
              'hasBeenReset': false,
              'id': 2258180,
              'lastUpdate': 'Fri, 03 Apr 2020 20:07:10 GMT',
              'names': [
                {
                  'choice': 1,
                  'designation': 'INC.',
                  'name': 'Test Name 1 INC.',
                  'name_type_cd': null,
                  'state': 'APPROVED'
                },
                {
                  'choice': 3,
                  'designation': 'INCORPORATED',
                  'name': 'Test Name 2 INC.',
                  'name_type_cd': null,
                  'state': 'NE'
                },
                {
                  'choice': 2,
                  'designation': 'INCORPORATED',
                  'name': 'Test Name 3 INC.',
                  'name_type_cd': null,
                  'state': 'NE'
                }
              ],
              'nrNumber': 'NR 1234567',
              'priorityCd': 'Y',
              'priorityDate': 'Wed, 25 Sep 2019 17:48:58 GMT',
              'requestTypeCd': 'CR',
              'request_action_cd': 'NRO-NEWAML',
              'state': 'APPROVED',
              'submitCount': 1,
              'submittedDate': 'Wed, 25 Sep 2019 17:48:00 GMT',
              'submitter_userid': '',
              'userId': 'abc',
              'xproJurisdiction': null
            }
          }
        }
      }
    ]

    store.state.entityStatus = 'NAME_REQUEST'

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)

    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    const nrListSelector = '#name-request-info ul li'
    const itemCount = vm.$el.querySelectorAll(nrListSelector).length

    expect(itemCount).toEqual(6)

    const title = vm.$el.querySelectorAll(nrListSelector)[0]
    const entityType = vm.$el.querySelectorAll(nrListSelector)[1]
    const requestType = vm.$el.querySelectorAll(nrListSelector)[2]
    const expiryDate = vm.$el.querySelectorAll(nrListSelector)[3]
    const status = vm.$el.querySelectorAll(nrListSelector)[4]
    const conditionConsent = vm.$el.querySelectorAll(nrListSelector)[5]

    expect(title.textContent).toContain('Name Request')
    expect(entityType.textContent).toContain('Entity Type: BC Benefit Company')
    expect(requestType.textContent).toContain('Request Type: New Business')
    expect(expiryDate.textContent).toContain('Expiry Date: Nov 21, 2022')
    expect(status.textContent).toContain('Status: Approved')
    expect(conditionConsent.textContent).toContain('Condition/Consent: Not Required')

    const applicantInfoListSelector = '#name-request-applicant-info ul li'
    const applicantInfoListCount = vm.$el.querySelectorAll(applicantInfoListSelector).length
    const name = vm.$el.querySelectorAll(applicantInfoListSelector)[1]
    const address = vm.$el.querySelectorAll(applicantInfoListSelector)[2]
    const email = vm.$el.querySelectorAll(applicantInfoListSelector)[3]
    const phone = vm.$el.querySelectorAll(applicantInfoListSelector)[4]

    expect(applicantInfoListCount).toEqual(5)
    expect(name.textContent).toContain('Name: Adam Jane Smith')
    expect(address.textContent)
      .toContain('Address: 1234 Fake Street, Block 3, Suite 1001, Victoria, BC, V9E 3S2, Canada')
    expect(email.textContent).toContain('Email: abc@test.com')
    expect(phone.textContent).toContain('Phone: (777) 777-7777')

    wrapper.destroy()
  })
})

describe('TodoList - UI - BCOMP', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    store.state.entityType = 'BC'
  })

  it('handles empty data', async () => {
    // init store
    store.state.tasks = []

    const wrapper = mount(TodoList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(0)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(wrapper.emitted('todo-count')).toEqual([[0]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('todo-count')).toEqual([[3]])
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
    vm.confirmCheckbox = true

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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(wrapper.emitted('has-blocker-task')).toEqual([[false]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.bcorps-ar-subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    // Simulate Checkbox being selected to enable File Now Button
    vm.confirmCheckbox = true

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
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
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    await Vue.nextTick()

    expect(vm.taskItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    const payURL = 'auth/makepayment/654/' + encodeURIComponent('cooperatives/?filing_id=456')
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
    const payURL = 'auth/makepayment/987/' + encodeURIComponent('cooperatives/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL)

    wrapper.destroy()
  })

  it('Confirm BCOL error is captured in todo list', async () => {
    sessionStorage.setItem('PAY_API_URL', '')
    // store a task with a filing associated to a BCOL error
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

    // the class appended to a todo div when an item has a bcol error
    const todoItem = vm.$el.querySelector('.bcol-error')
    expect(todoItem).toBeDefined()

    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // confirm the message is visible after expansion panel clicked
    const bcolPanel = vm.$el.querySelector('.bcol-todo-list-detail')
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
    store.state.entityType = 'BC'
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
    expect(vm.confirmCheckbox).toBe(false)

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
    expect(vm.confirmCheckbox).toBe(true)
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
    const payURL = 'auth/makepayment/654/' + encodeURIComponent('cooperatives/?filing_id=456')
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
    const payURL = 'auth/makepayment/987/' + encodeURIComponent('cooperatives/?filing_id=789')
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
    store.state.entityType = 'BC'

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  // FUTURE: enable when/if we have NRs without a draft
  xit('redirects to Create URL when \'Incorporate using this NR\' is clicked', async () => {
    // init Name Request todo task
    store.state.tasks = [
      {
        task: {
          todo: {
            header: {
              name: 'nameRequest',
              status: 'NEW'
            },
            nameRequest: {
              names: [
                {
                  name: 'Test Name',
                  state: 'APPROVED'
                }
              ],
              nrNumber: 'NR 1234567',
              applicants: {
                addrLine1: '1234 Fake Street',
                addrLine2: 'Block 3',
                addrLine3: 'Suite 1001',
                city: 'Victoria',
                countryTypeCd: 'CA',
                postalCd: 'V9E 3S2',
                stateProvinceCd: 'BC',
                emailAddress: 'abc@test.com',
                phoneNumber: '7777777777',
                firstName: 'Adam',
                middleName: 'John',
                lastName: 'Smith'
              },
              consentFlag: null,
              expirationDate: 'Thu, 31 Dec 2099 08:00:00 GMT',
              state: 'APPROVED'
            }
          }
        },
        enabled: true,
        order: 1
      }
    ]
    store.state.entityStatus = 'NAME_REQUEST'

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
    const createUrl = 'cooperatives/create/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })

  it('redirects to Create URL when \'Resume\' is clicked on a Named Company draft IA', async () => {
    // init Incorporation Application filing task
    store.state.tasks = [
      {
        task: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: 'BC'
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
    const createUrl = 'cooperatives/create/?id=T123456789'
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
              legalType: 'BC'
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
    const createUrl = 'cooperatives/create/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })
})

describe('TodoList - Delete Draft', () => {
  const { assign } = window.location
  let deleteCall

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
    store.state.entityType = 'BC'
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
  let patchCall

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
