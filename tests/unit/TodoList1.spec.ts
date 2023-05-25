import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import VueRouter from 'vue-router'
import { createLocalVue, mount } from '@vue/test-utils'
import axios from '@/axios-auth'
import sinon from 'sinon'
import mockRouter from './mockRouter'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import flushPromises from 'flush-promises'

// Components
import TodoList from '@/components/Dashboard/TodoList.vue'
import CorrectionComment from '@/components/Dashboard/TodoList/CorrectionComment.vue'
import PaymentIncomplete from '@/components/Dashboard/TodoList/PaymentIncomplete.vue'
import PaymentPaid from '@/components/Dashboard/TodoList/PaymentPaid.vue'
import PaymentPending from '@/components/Dashboard/TodoList/PaymentPending.vue'
import PaymentPendingOnlineBanking from '@/components/Dashboard/TodoList/PaymentPendingOnlineBanking.vue'
import PaymentUnsuccessful from '@/components/Dashboard/TodoList/PaymentUnsuccessful.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { EntityState, EntityStatus, FilingStatus } from '@/enums'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

// Prevent the warning "[Vuetify] Unable to locate target #staff-notation"
document.body.setAttribute('id', 'todo-list')

// mock the mixin to always return True
const AllowableActionsMixin: any = {
  methods: {
    isAllowed: () => true
  }
}

describe('TodoList - UI', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
  })

  it('handles empty data', async () => {
    // init store
    rootStore.tasks = []

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(0)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(wrapper.emitted('todo-count')).toEqual([[0]])
    expect(vm.$el.querySelector('.no-results')).not.toBeNull()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  it('displays multiple task items', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2017,
              'status': FilingStatus.NEW,
              'filingId': 1
            },
            business: {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      } as any,
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2018,
              'status': FilingStatus.NEW,
              'filingId': 2
            },
            business: {
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
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW,
              'filingId': 3
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 3
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('todo-count')).toEqual([[3]])
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

  it('displays DRAFT \'Special Resolution\' task', async () => {
    // init store
    rootStore.tasks = [
      {
        'enabled': true,
        'order': 1,
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.SPECIAL_RESOLUTION,
              'status': FilingStatus.DRAFT,
              'filingId': 1,
              'comments': []
            },
            business: {},
            specialResolution: {}
          }
        }
      } as any
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(vm.$el.querySelector('.no-results')).toBeNull()
    wrapper.destroy()
  })

  it('displays a NEW \'Annual Report\' task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW,
              'filingId': 1
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.DRAFT,
              'filingId': 1
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CHANGE_OF_ADDRESS,
              'ARFilingYear': 2019,
              'status': FilingStatus.DRAFT,
              'filingId': 1
            },
            business: {},
            changeOfAddress: {}
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CHANGE_OF_DIRECTORS,
              'ARFilingYear': 2019,
              'status': FilingStatus.DRAFT,
              'filingId': 1
            },
            business: {},
            changeOfDirectors: {}
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CORRECTION,
              'status': FilingStatus.DRAFT,
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017), filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            business: {},
            correction: {
              'correctedFilingType': 'annualReport'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CORRECTION,
              'status': FilingStatus.DRAFT,
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017), filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            business: {},
            correction: {
              'correctedFilingType': 'annualReport'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]
    // Only staff may resume drafts
    rootStore.keycloakRoles = ['staff']

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CORRECTION,
              'status': FilingStatus.DRAFT,
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017), filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            business: {},
            correction: {
              'correctedFilingType': 'annualReport'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    // Only staff may resume drafts
    rootStore.keycloakRoles = ['user']

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('DRAFT')
    expect(item.querySelector('.expand-btn').textContent).toContain('View Details')

    // Validate the child component does NOT exist on the parent before opening the dropdown
    expect(wrapper.findComponent(CorrectionComment).exists()).toBe(false)

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    expect(vm.$el.querySelector('#todo-list .todo-list-detail').textContent)
      .toContain('This filing is in review and has been saved as a draft.')

    // Validate that the resume button does not exist for NON-Staff
    expect(item.querySelector('.list-item__actions .v-btn')).toBeNull()

    // Validate the child component exists on the parent after opening the dropdown
    expect(wrapper.findComponent(CorrectionComment).exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays a PENDING \'Correction\' task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CORRECTION,
              'ARFilingYear': 2019,
              'status': 'PENDING',
              'paymentToken': 12345678,
              'filingId': 1
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            correction: {
              'correctedFilingType': 'annualReport'
            }
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')

    wrapper.destroy()
  })

  it('displays details on a PENDING \'Correction\' task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CORRECTION,
              'status': FilingStatus.PENDING,
              'filingId': 1,
              'comments': [
                {
                  'comment': {
                    'comment': 'Correction for Annual Report (2017), filed on 2018-01-08.',
                    'filingId': 1,
                    'id': 123,
                    'submitterDisplayName': 'cbIdIr1234',
                    'timestamp': '2020-03-02T20:26:31.697044+00:00'
                  }
                }
              ]
            },
            business: {},
            annualReport: {},
            correction: {
              'correctedFilingType': 'annualReport'
            }
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('Correction')
    expect(item.querySelector('.list-item__title').textContent).toContain('Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.expand-btn').textContent).toContain('View Details')

    // Validate the child component does NOT exist on the parent before opening the dropdown
    expect(wrapper.findComponent(CorrectionComment).exists()).toBe(false)

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    expect(vm.$el.querySelector('#todo-list .todo-list-detail').textContent)
      .toContain('This filing is pending review by Registry Staff.')

    // Validate that the resume button does not exist for NON-Staff
    expect(item.querySelector('.list-item__actions .v-btn')).toBeNull()

    // Validate the child component exists on the parent after opening the dropdown
    expect(wrapper.findComponent(CorrectionComment).exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT INCOMPLETE task', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              paymentToken: 12345678,
              filingId: 1
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    // validate that child component exists
    expect(wrapper.findComponent(PaymentPending).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAYMENT UNSUCCESSFUL task', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.ERROR,
              paymentToken: 12345678,
              filingId: 1
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT UNSUCCESSFUL')

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    // validate that child component exists
    expect(wrapper.findComponent(PaymentUnsuccessful).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - ONLINE BANKING PAYMENT PENDING task', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              filingId: 1,
              paymentToken: 12345678,
              paymentMethod: 'ONLINE_BANKING'
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('ONLINE BANKING PAYMENT PENDING')

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    // validate that child component exists
    expect(wrapper.findComponent(PaymentPendingOnlineBanking).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('Change Payment Type')

    wrapper.destroy()
  })

  it('displays a FILING PENDING - PAID task', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.CHANGE_OF_DIRECTORS,
              status: FilingStatus.PAID,
              paymentToken: 12345678,
              filingId: 1
            },
            business: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAID')

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    // validate that child component exists
    expect(wrapper.findComponent(PaymentPaid).exists()).toBe(true)

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button).toBeNull()

    wrapper.destroy()
  })

  it('displays a PROCESSING message when the In Process variable is set', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.CHANGE_OF_DIRECTORS,
              status: FilingStatus.PENDING,
              paymentToken: 12345678,
              filingId: 123
            },
            business: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // set the "in progress" task
    await wrapper.setData({ inProcessFiling: 123 })

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PROCESSING...')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('does not display a PROCESSING message when the In Process variable is falsy', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.CHANGE_OF_DIRECTORS,
              status: FilingStatus.PENDING,
              paymentToken: 12345678,
              filingId: 123
            },
            business: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // clear the "in progress" task
    vm.inProcessFiling = NaN

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()

    wrapper.destroy()
  })
})

describe('TodoList - UI - BCOMPs', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'BC0007291')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  })

  it('handles empty data', async () => {
    // init store
    rootStore.tasks = []

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(0)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(0)
    expect(wrapper.emitted('todo-count')).toEqual([[0]])
    expect(vm.$el.querySelector('.no-results')).not.toBeNull()
    expect(vm.$el.querySelector('.no-results').textContent).toContain('You don\'t have anything to do yet')

    wrapper.destroy()
  })

  it('displays multiple task items', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2017,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      } as any,
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2018,
              'status': FilingStatus.NEW
            },
            business: {
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
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': false,
        'order': 3
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(3)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(3)
    expect(wrapper.emitted('todo-count')).toEqual([[3]])
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
    await wrapper.find('#enable-checkbox').trigger('click')

    // check action buttons
    expect(item1.querySelector('.list-item__actions .v-btn').disabled).toBe(false)
    expect(item2.querySelector('.list-item__actions .v-btn').disabled).toBe(true)
    expect(item3.querySelector('.list-item__actions .v-btn').disabled).toBe(true)

    wrapper.destroy()
  })

  it('displays a NEW \'Annual Report\' task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    // Simulate Checkbox being selected to enable File Now Button
    await wrapper.find('#enable-checkbox').trigger('click')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(false)
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  // NOT WORKING
  it('disables \'File Annual Report\' and verification checkbox when COA is pending', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    jest.spyOn(vm, 'isCoaPending', 'get').mockReturnValue(true)
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    // Verify checkbox is disabled
    expect(wrapper.find('#enable-checkbox').attributes('disabled')).toBe('disabled')

    // Simulate the attempt to enable the File Annual Report btn
    await wrapper.find('#enable-checkbox').trigger('click')

    // Verify File Annual Report btn is disabled
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(wrapper.find('.list-item__actions .v-btn').attributes('disabled')).toBe('disabled')
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  it('displays a task but \'File Now\' is disabled when checkbox is unselected', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2019-09-17T00:00:00+00:00'
            }
          }
        },
        'enabled': true,
        'order': 1
      } as any
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent)
      .toContain('Verify your Office Address and Current Directors before filing your Annual Report.')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.disabled).toBe(true)
    expect(button.querySelector('.v-btn__content').textContent).toContain('File Annual Report')

    wrapper.destroy()
  })

  xit('displays a FILING PENDING - PAYMENT INCOMPLETE task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.PENDING,
              'paymentToken': 12345678
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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

  xit('displays a FILING PENDING - PAYMENT UNSUCCESSFUL task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.ERROR,
              'paymentToken': 12345678
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
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

  xit('displays a FILING PENDING - PAID task', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.CHANGE_OF_DIRECTORS,
              'status': FilingStatus.PAID,
              'paymentToken': 12345678
            },
            business: {},
            changeOfDirectors: {}
          }
        } as any,
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAID')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button).toBeNull()

    wrapper.destroy()
  })

  it('displays a PROCESSING message when the In Process variable is set', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.CHANGE_OF_DIRECTORS,
              status: FilingStatus.PENDING,
              paymentToken: 12345678,
              filingId: 123
            },
            business: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // set the "in progress" task
    await wrapper.setData({ inProcessFiling: 123 })

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PROCESSING...')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('does not display a PROCESSING message when the In Process variable is falsy', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.CHANGE_OF_DIRECTORS,
              status: FilingStatus.PENDING,
              paymentToken: 12345678,
              filingId: 123
            },
            business: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // clear the "in progress" task
    vm.inProcessFiling = NaN

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File Director Change')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('FILING PENDING')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()

    wrapper.destroy()
  })
})

describe('TodoList - UI - Incorp Apps', () => {
  beforeAll(() => {
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  })

  xit('displays a DRAFT numbered company IA', async () => {
    // init store
    rootStore.nameRequest = null
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.INCORPORATION_APPLICATION,
              status: FilingStatus.DRAFT
            },
            business: {},
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('Benefit Company Incorporation Application')
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

  xit('displays a DRAFT named company IA', async () => {
    // init store
    rootStore.nameRequest = {}
    businessStore.setLegalName('My Business Inc')
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.INCORPORATION_APPLICATION,
              status: FilingStatus.DRAFT
            },
            business: {},
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('Benefit Company Incorporation Application')
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

  xit('displays a PENDING numbered company IA', async () => {
    // init store
    rootStore.nameRequest = null
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.INCORPORATION_APPLICATION,
              status: FilingStatus.PENDING
            },
            business: {},
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('Benefit Company Incorporation Application')
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

  xit('displays a PENDING named company IA', async () => {
    // init store
    rootStore.nameRequest = {}
    businessStore.setLegalName('My Business Inc')
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: 'incorporationApplication',
              status: FilingStatus.PENDING
            },
            business: {},
            nameRequest: {},
            incorporationApplication: {},
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(vm.$el.querySelectorAll('.todo-item').length).toEqual(1)
    expect(wrapper.emitted('todo-count')).toEqual([[1]])
    expect(vm.$el.querySelector('.no-results')).toBeNull()

    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent)
      .toContain('Benefit Company Incorporation Application')
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
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any

    // set configurations
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }
    configurationStore.setConfiguration(configuration)

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('routes to Annual Report page when \'File Now\' clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW,
              'filingId': 1
            },
            business: {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, router, vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const button = wrapper.find('.list-item .list-item__actions .v-btn')
    expect(button.text()).toContain('File Annual Report')
    await button.trigger('click')

    // verify that filing status was set
    expect(rootStore.currentFilingStatus).toBe('NEW')

    // verify routing to Annual Report page with id=0
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe('0')

    wrapper.destroy()
  })

  it('routes to Annual Report page when \'Resume\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.DRAFT,
              'filingId': 123
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, router, vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    // const item = vm.$el.querySelector('.list-item')
    // const button = item.querySelector('.list-item__actions .v-btn')
    // expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    // await button.click()
    const button = wrapper.find('.list-item .list-item__actions .v-btn')
    expect(button.text()).toContain('Resume')
    await button.trigger('click')

    // verify that filing status was set
    expect(rootStore.currentFilingStatus).toBe('DRAFT')

    // verify routing to Annual Report page with id=123
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe('123')

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Resume Payment\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.PENDING,
              'filingId': 456,
              'paymentToken': 654
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const button = wrapper.find('.list-item .list-item__actions .v-btn')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).toContain('Resume Payment')
    await button.trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/654/' + encodeURIComponent('https://base.url/?filing_id=456')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Retry Payment\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.ERROR,
              'filingId': 789,
              'paymentToken': 987
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')
    await button.click()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/987/' + encodeURIComponent('https://base.url/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Change Payment Type\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              filingId: 789,
              paymentToken: 987,
              paymentMethod: 'ONLINE_BANKING'
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Change Payment Type')
    await button.click()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/987/' + encodeURIComponent('https://base.url/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('captures payment error in todo list', async () => {
    // store a task with a filing associated to a payment error
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.DRAFT,
              filingId: 123,
              paymentStatusCode: 'BCOL_ERROR'
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
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

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await flushPromises() // wait for pay error to finish loading

    // validate that todo item exists
    const todoItem = vm.$el.querySelector('.pay-error')
    expect(todoItem).toBeDefined()

    // validate the title and sub-title
    const item = vm.$el.querySelector('.list-item')
    expect(item.querySelector('.list-item__title').textContent).toContain('File 2019 Annual Report')
    expect(item.querySelector('.list-item__subtitle').textContent).toContain('PAYMENT INCOMPLETE')

    // click the View Details button
    await wrapper.find('.expand-btn').trigger('click')
    await Vue.nextTick()

    // validate that child component exists
    expect(wrapper.findComponent(PaymentIncomplete).exists()).toBe(true)

    // confirm the message is visible after expansion panel clicked
    const bcolPanel = vm.$el.querySelector('.payment-incomplete-details')
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
    businessStore.setIdentifier('BC0007291')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    // set configurations
    const configuration = {
      'VUE_APP_AUTH_WEB_URL': 'https://auth.web.url/'
    }
    configurationStore.setConfiguration(configuration)

    // set necessary session variables
    sessionStorage.setItem('BASE_URL', 'https://base.url/')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('routes to Annual Report page when \'File Now\' clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'todo': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.NEW
            },
            business: {
              'nextAnnualReport': '2017-09-17T00:00:00+00:00'
            }
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, router, vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    // verify model state
    expect(vm.enableCheckbox[0]).toBeUndefined()

    // verify checkbox content
    const firstTodoItem = vm.$el.querySelectorAll('.todo-item')[0]
    const htmlDivElement = firstTodoItem.querySelector('.list-item__subtitle .todo-list-checkbox')
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
    expect(rootStore.currentFilingStatus).toBe('NEW')

    // verify routing to Annual Report page with id=0
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe('0')

    wrapper.destroy()
  })

  it('routes to Annual Report page when \'Resume\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.DRAFT,
              'filingId': 123
            },
            business: {},
            annualReport: {
              'annualReportDate': '2019-07-15',
              'nextARDate': '2020-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    const wrapper = mount(TodoList, { localVue, router, vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume')

    await button.click()

    // verify that filing status was set
    expect(rootStore.currentFilingStatus).toBe('DRAFT')

    // verify routing to Annual Report page with id=123
    expect(vm.$route.name).toBe('annual-report')
    expect(vm.$route.params.filingId).toBe('123')

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Resume Payment\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.PENDING,
              'filingId': 456,
              'paymentToken': 654
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Resume Payment')
    await button.click()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/654/' + encodeURIComponent('https://base.url/?filing_id=456')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })

  it('redirects to Pay URL when \'Retry Payment\' is clicked', async () => {
    // init store
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.ANNUAL_REPORT,
              'ARFilingYear': 2019,
              'status': FilingStatus.ERROR,
              'filingId': 789,
              'paymentToken': 987
            },
            business: {},
            annualReport: {
              'annualGeneralMeetingDate': '2019-07-15',
              'annualReportDate': '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = vm.$el.querySelector('.list-item')
    const button = item.querySelector('.list-item__actions .v-btn')
    expect(button.getAttribute('disabled')).toBeNull()
    expect(button.querySelector('.v-btn__content').textContent).toContain('Retry Payment')
    await button.click()

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const payURL = 'https://auth.web.url/makepayment/987/' + encodeURIComponent('https://base.url/?filing_id=789')
    expect(window.location.assign).toHaveBeenCalledWith(payURL + '?accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - NRs and Incorp Apps', () => {
  const { assign } = window.location

  beforeAll(() => {
    // init store
    sessionStorage.clear()
    const configuration = {
      VUE_APP_BUSINESS_CREATE_URL: 'https://create.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    businessStore.setLegalName('My Business Inc')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('redirects to Create URL when \'Resume\' is clicked on a Named Company draft IA', async () => {
    // init Incorporation Application filing task
    rootStore.tasks = [
      {
        task: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: CorpTypeCd.BENEFIT_COMPANY
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: FilingTypes.INCORPORATION_APPLICATION,
              status: FilingStatus.DRAFT,
              filingId: 789
            },
            incorporationApplication: {
              nameRequest: {
                nrNumber: 'NR 1234567'
              }
            }
          } as any
        },
        enabled: true,
        order: 1
      }
    ]
    rootStore.nameRequest = { nrNum: 'NR 1234567' }
    rootStore.entityStatus = EntityStatus.DRAFT_APP

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const button = wrapper.find('.list-item__actions .v-btn')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.find('.v-btn__content').text()).toContain('Incorporate using this NR')
    await button.trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const createUrl = 'https://create.url/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl + '&accountid=' + accountId)

    wrapper.destroy()
  })

  it('redirects to Create URL when \'Resume\' is clicked on a Numbered Company draft IA', async () => {
    // init Incorporation Application filing task
    rootStore.tasks = [
      {
        task: {
          filing: {
            business: {
              identifier: 'T123456789',
              legalType: CorpTypeCd.BENEFIT_COMPANY
            },
            header: {
              date: '2020-05-21T00:11:55.887740+00:00',
              name: FilingTypes.INCORPORATION_APPLICATION,
              status: FilingStatus.DRAFT,
              filingId: 789
            }
          } as any
        },
        enabled: true,
        order: 1
      }
    ]
    rootStore.nameRequest = null
    rootStore.entityStatus = EntityStatus.DRAFT_APP

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)

    const button = wrapper.find('.list-item__actions .v-btn')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.find('.v-btn__content').text()).toContain('Incorporate a Numbered Company')
    await button.trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const createUrl = 'https://create.url/?id=T123456789'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl + '&accountid=' + accountId)

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - Corrections', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  const editTests = [
    { businessId: 'BC1234567', correctedFilingType: 'alteration' },
    { businessId: 'BC1234567', correctedFilingType: 'incorporationApplication' },
    { businessId: 'FM1234567', correctedFilingType: 'changeOfRegistration' },
    { businessId: 'BC1234567', correctedFilingType: 'correction' },
    { businessId: 'FM1234567', correctedFilingType: 'registration' }
  ]

  for (const test of editTests) {
    it(`redirects to Edit URL to resume a draft ${test.correctedFilingType} correction`, async () => {
      // init session storage and store
      sessionStorage.clear()
      const configuration = {
        VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
      }

      // set configurations
      configurationStore.setConfiguration(configuration)
      sessionStorage.setItem('BUSINESS_ID', test.businessId)
      sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
      businessStore.setIdentifier(test.businessId)
      // init draft Correction filing task
      rootStore.tasks = [
        {
          task: {
            filing: {
              header: {
                name: FilingTypes.CORRECTION,
                status: FilingStatus.DRAFT,
                filingId: 123,
                comments: []
              },
              business: {},
              correction: {
                correctedFilingType: test.correctedFilingType
              }
            } as any
          },
          enabled: true,
          order: 1
        }
      ]
      rootStore.keycloakRoles = ['staff'] // only staff may resume draft corrections

      const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
      const vm = wrapper.vm as any
      await Vue.nextTick()

      expect(vm.todoItems.length).toEqual(1)
      expect(wrapper.find('.todo-subtitle span').text()).toBe('DRAFT')

      await wrapper.find('.btn-draft-resume').trigger('click')

      // verify redirection
      const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
      const editUrl = `https://edit.url/${test.businessId}/correction/?correction-id=123`
      expect(window.location.assign).toHaveBeenCalledWith(editUrl + '&accountid=' + accountId)

      wrapper.destroy()
    })
  }

  // courtOrder is not a valid filing for Corrections
  const localTest = ['annualReport', 'changeOfAddress', 'changeOfDirectors', 'conversion', 'changeOfName',
    'courtOrder', 'dissolution', 'dissolved', 'involuntaryDissolution', 'putBackOn', 'registrarsNotation',
    'registrarsOrder', 'specialResolution', 'transition', 'voluntaryDissolution']

  for (const test of localTest) {
    it(`Router pushes locally to resume a draft ${test} correction`, async () => {
      // init draft Correction filing task
      rootStore.tasks = [
        {
          task: {
            filing: {
              header: {
                name: FilingTypes.CORRECTION,
                status: FilingStatus.DRAFT,
                filingId: 123,
                comments: []
              },
              business: {},
              correction: {
                correctedFilingType: test,
                correctedFilingId: 456
              }
            } as any
          },
          enabled: true,
          order: 1
        }
      ]
      rootStore.keycloakRoles = ['staff'] // only staff may resume draft corrections

      const localVue = createLocalVue()
      localVue.use(VueRouter)
      const router = mockRouter.mock()

      const wrapper = mount(TodoList, { localVue, router, vuetify, mixins: [AllowableActionsMixin] })
      const vm = wrapper.vm as any
      await Vue.nextTick()

      expect(vm.todoItems.length).toEqual(1)
      expect(wrapper.find('.todo-subtitle span').text()).toBe('DRAFT')

      await wrapper.find('.btn-draft-resume').trigger('click')

      // wait for save to complete and everything to update
      // await flushPromises()

      // verify routing to Correction page with filing id = 123 and corrected filing id = 456
      if (test !== 'changeOfAddress' && test !== 'changeOfDirectors') {
        expect(vm.$route.name).toBe('correction')
        expect(vm.$route.params.filingId).toBe('123')
        expect(vm.$route.params.correctedFilingId).toBe('456')
      } else {
        // verify redirection if correction of change of Address/Directors
        const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
        const editUrl = 'https://edit.url/BC1234567/correction/?correction-id=123'
        expect(window.location.assign).toHaveBeenCalledWith(editUrl + '&accountid=' + accountId)
      }

      wrapper.destroy()
    })
  }
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
    // init session storage and store
    sessionStorage.clear()
    const configuration = {
      VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)

    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    businessStore.setIdentifier('BC1234567')
    businessStore.setGoodStanding(true)
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ALTERATION,
              status: FilingStatus.DRAFT,
              filingId: 123,
              comments: []
            },
            business: {},
            alteration: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]
    rootStore.keycloakRoles = ['staff'] // only staff may resume draft alterations

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.todoItems.length).toEqual(1)
    expect(wrapper.find('.todo-subtitle').text()).toBe('DRAFT')

    await wrapper.find('.btn-draft-resume').trigger('click')

    // verify redirection
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/alteration/?alteration-id=123'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '&accountid=' + accountId)

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
    // init session storage and store
    sessionStorage.clear()
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.DRAFT,
              filingId: 789
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    await Vue.nextTick()

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-draft-delete').trigger('click')

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })

  it('calls DELETE endpoint when user clicks confirmation OK', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.DRAFT,
              filingId: 789
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-draft-delete').trigger('click')

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
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.DRAFT,
              filingId: 789
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-draft-delete').trigger('click')

    // verify confirmation popup is showing
    expect(vm.$refs.confirm.dialog).toBeTruthy()

    // click the cancel button (call the 'cancel' callback function)
    await vm.$refs.confirm.onClickCancel()

    // confirm that delete API was not called
    expect(deleteCall.called).toBeFalsy()

    wrapper.destroy()
  })

  it('shows confirmation popup when \'Delete Incorporation Application\' is clicked', async () => {
    // init session storage and store
    sessionStorage.clear()
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    businessStore.setIdentifier('T123456789')
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.entityStatus = EntityStatus.DRAFT_APP
    rootStore.tasks = [
      {
        'task': {
          'filing': {
            header: {
              'name': FilingTypes.INCORPORATION_APPLICATION,
              'status': FilingStatus.DRAFT,
              'filingId': 789
            },
            business: {},
            incorporationApplication: {}
          } as any
        },
        'enabled': true,
        'order': 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    await Vue.nextTick()

    // open dropdown menu and click Delete button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-delete-application').trigger('click')

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
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              filingId: 789,
              paymentToken: 123
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    await Vue.nextTick()

    // open dropdown menu and click Cancel button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-cancel-payment').trigger('click')

    // verify confirmation popup is showing
    expect(wrapper.vm.$refs.confirm).toBeTruthy()

    wrapper.destroy()
  })

  it('calls PATCH endpoint when user clicks confirmation OK', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              filingId: 789,
              paymentToken: 123
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // open dropdown menu and click Cancel button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-cancel-payment').trigger('click')

    // verify confirmation popup is showing
    expect(vm.$refs.confirm.dialog).toBeTruthy()

    // click the OK button (call the 'yes' callback function)
    await vm.$refs.confirm.onClickYes()

    // confirm that delete API was called
    expect(patchCall.called).toBeTruthy()

    wrapper.destroy()
  })

  it('does not call the PATCH endpoint when user clicks confirmation Cancel', async () => {
    // init store
    rootStore.tasks = [
      {
        task: {
          filing: {
            header: {
              name: FilingTypes.ANNUAL_REPORT,
              ARFilingYear: 2019,
              status: FilingStatus.PENDING,
              filingId: 789,
              paymentToken: 123
            },
            business: {},
            annualReport: {
              annualGeneralMeetingDate: '2019-07-15',
              annualReportDate: '2019-07-15'
            },
            changeOfAddress: {},
            changeOfDirectors: {}
          } as any
        },
        enabled: true,
        order: 1
      }
    ]

    const wrapper = mount(TodoList, { vuetify, mixins: [AllowableActionsMixin] })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // open dropdown menu and click Cancel button
    await wrapper.find('#menu-activator').trigger('click')
    await wrapper.find('#btn-cancel-payment').trigger('click')

    // verify confirmation popup is showing
    expect(vm.$refs.confirm.dialog).toBeTruthy()

    // click the cancel button (call the 'cancel' callback function)
    await vm.$refs.confirm.onClickCancel()

    // confirm that delete API was not called
    expect(patchCall.called).toBeFalsy()

    wrapper.destroy()
  })
})

describe('TodoList - Click Tests - Full and Limited Restoration', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  const fullAndLtdRestorationTests = [
    { businessId: 'BC1234567', restorationType: 'fullRestoration' },
    { businessId: 'BC1234568', restorationType: 'limitedRestoration' }
  ]

  for (const test of fullAndLtdRestorationTests) {
    it(`redirects to Create URL when 'Resume' is clicked on a ${test.restorationType} draft applciation`, async () => {
      // init store
      sessionStorage.clear()
      const configuration = {
        VUE_APP_BUSINESS_CREATE_URL: 'https://create.url/'
      }

      // set configurations
      configurationStore.setConfiguration(configuration)
      sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
      rootStore.currentDate = '2022-12-31'
      businessStore.setIdentifier(test.businessId)
      businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
      businessStore.setState(EntityState.HISTORICAL)
      rootStore.tasks = [
        {
          task: {
            filing: {
              business: {
                identifier: test.businessId,
                legalType: CorpTypeCd.BENEFIT_COMPANY
              },
              header: {
                date: '2020-05-21T00:11:55.887740+00:00',
                name: FilingTypes.RESTORATION,
                status: FilingStatus.DRAFT,
                filingId: 789
              },
              restoration: {
                type: test.restorationType
              }
            } as any
          },
          enabled: true,
          order: 1
        }
      ]

      rootStore.keycloakRoles = ['staff']
      rootStore.entityStatus = EntityStatus.DRAFT_APP

      const wrapper = mount(TodoList, { vuetify })
      const vm = wrapper.vm as any
      await Vue.nextTick()

      expect(vm.todoItems.length).toEqual(1)
      expect(wrapper.find('.todo-subtitle span').text()).toBe('DRAFT')

      const button = wrapper.find('.list-item__actions .v-btn')
      expect(button.find('.v-btn__content').text()).toContain('Resume')
      await button.trigger('click')

      // verify redirection
      const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
      const createUrl = `https://create.url/?id=${test.businessId}`
      expect(window.location.assign).toHaveBeenCalledWith(createUrl + '&accountid=' + accountId)

      wrapper.destroy()
    })
  }
})

describe('TodoList - Click Tests - Extension and Coversion Restoration', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    window.location.assign = assign
  })

  const extensionAndConversionTests = [
    { businessId: 'BC1234569', restorationType: 'limitedRestorationExtension' },
    { businessId: 'BC1234569', restorationType: 'limitedRestorationToFull' }
  ]

  for (const test of extensionAndConversionTests) {
    it(`redirects to Edit URL when 'Resume' is clicked on a ${test.restorationType} draft applciation`, async () => {
      // init store
      sessionStorage.clear()
      const configuration = {
        VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
      }

      // set configurations
      configurationStore.setConfiguration(configuration)
      sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
      rootStore.currentDate = '2022-12-31'
      businessStore.setIdentifier(test.businessId)
      businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
      businessStore.setState(EntityState.ACTIVE)
      rootStore.tasks = [
        {
          task: {
            filing: {
              business: {
                identifier: test.businessId,
                legalType: CorpTypeCd.BENEFIT_COMPANY
              },
              header: {
                date: '2020-05-21T00:11:55.887740+00:00',
                name: FilingTypes.RESTORATION,
                status: FilingStatus.DRAFT,
                filingId: 123
              },
              restoration: {
                type: test.restorationType
              }
            } as any
          },
          enabled: true,
          order: 1
        }
      ]

      rootStore.keycloakRoles = ['staff']
      rootStore.entityStatus = EntityStatus.DRAFT_APP

      const wrapper = mount(TodoList, { vuetify })
      const vm = wrapper.vm as any
      await Vue.nextTick()

      expect(vm.todoItems.length).toEqual(1)
      expect(wrapper.find('.todo-subtitle span').text()).toBe('DRAFT')

      const button = wrapper.find('.list-item__actions .v-btn')
      expect(button.find('.v-btn__content').text()).toContain('Resume')
      await button.trigger('click')

      // verify redirection
      const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
      const editUrl = `https://edit.url/${test.businessId}/${test.restorationType}?restoration-id=123`
      expect(window.location.assign).toHaveBeenCalledWith(editUrl + '&accountid=' + accountId)

      wrapper.destroy()
    })
  }
})
