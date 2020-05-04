import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'

// Components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import PaperFiling from '@/components/Dashboard/PaperFiling.vue'
import PendingFiling from '@/components/Dashboard/PendingFiling.vue'
import { DetailsList } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

const sampleFilings = [
  {
    'filing': {
      'header': {
        'name': 'annualReport',
        'date': '2019-06-02T19:22:59.003777+00:00',
        'paymentToken': 123,
        'certifiedBy': 'Full Name 1',
        'filingId': 321,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-06-02T19:22:59.003777+00:00'
      },
      'annualReport': {
        'annualGeneralMeetingDate': '2019-12-31',
        'annualReportDate': '2019-12-31'
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'changeOfDirectors',
        'date': '2019-03-09T19:22:59.003777+00:00',
        'paymentToken': 456,
        'certifiedBy': 'Full Name 2',
        'filingId': 654,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-03-09T19:22:59.003777+00:00'
      },
      'changeOfDirectors': {
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'changeOfAddress',
        'date': '2019-05-06T19:22:59.003777+00:00',
        'paymentToken': 789,
        'certifiedBy': 'Full Name 3',
        'filingId': 987,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-05-06T19:22:59.003777+00:00'
      },
      'changeOfAddress': {
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'annualReport',
        'date': '2019-03-02T19:22:59.003777+00:00',
        'paymentToken': 100,
        'certifiedBy': 'Full Name 1',
        'filingId': 3212,
        'availableOnPaperOnly': true,
        'effectiveDate': '2019-03-02T19:22:59.003777+00:00'
      },
      'annualReport': {
        'annualGeneralMeetingDate': '2019-01-01',
        'annualReportDate': '2019-01-01'
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'changeOfDirectors',
        'date': '2019-02-04T19:22:59.003777+00:00',
        'paymentToken': 4561,
        'certifiedBy': 'Full Name 2',
        'filingId': 6541,
        'availableOnPaperOnly': true,
        'effectiveDate': '2019-02-04T19:22:59.003777+00:00'
      },
      'changeOfDirectors': {
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'changeOfAddress',
        'date': '2019-04-06T19:22:59.003777+00:00',
        'paymentToken': 7891,
        'certifiedBy': 'Cameron',
        'filingId': 9873,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-12-13T00:00:00+00:00',
        'status': 'PAID'
      },
      'changeOfAddress': {
      }
    }
  },
  {
    'filing': {
      'header': {
        'name': 'correction',
        'date': '2019-04-06T19:22:59.003777+00:00',
        'paymentToken': 7891,
        'certifiedBy': 'Cameron',
        'filingId': 9873,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-12-13T00:00:00+00:00',
        'status': 'COMPLETE',
        'comments': [
          {
            'comment': {
              'comment': 'Correction for Annual Report (2017). Filed on 2018-01-08.',
              'filingId': 9873,
              'id': 1,
              'submitterDisplayName': 'cbIdIr1234',
              'timestamp': '2020-03-02T20:26:31.697044+00:00'
            }
          },
          {
            'comment': {
              'comment': 'This is an additional comment',
              'filingId': 9873,
              'id': 2,
              'submitterDisplayName': 'cbIdIr1234',
              'timestamp': '2020-03-03T20:26:31.697044+00:00'
            }
          }
        ]
      },
      'correction': {
        'correctedFilingType': 'annualReport',
        'correctedFilingDate': '2019-12-31'
      }
    }
  }
]

describe('Filing History List', () => {
  it('handles empty data - as a business', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('filed-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('You have no filing history')

    wrapper.destroy()
  })

  it('handles empty data - as a NR or incorp app', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('NR_NUMBER', 'NR 1234567')
    store.state.entityIncNo = 'NR 1234567'
    store.state.filings = []

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('filed-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('Complete your filing to display')

    sessionStorage.removeItem('NR_NUMBER')
    wrapper.destroy()
  })

  it('displays a Filing Pending incorporation application filing and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('NR_NUMBER', 'NR 1234567')
    store.state.entityIncNo = 'NR 1234567'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            effectiveDate: '2020-05-08T19:00:00+00:00',
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            status: 'PAID'
          },
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('filed-count')).toEqual([[1]])
    expect(wrapper.find('.list-item__subtitle').text()).toContain('FILING PENDING')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and expand details
    // NB: only this filing has a View Details button
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    // NB: only this filing has a Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(true)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // verify Incorporation Application button
    const documentBtns = wrapper.findAll('.download-document-btn')
    expect(documentBtns.at(0).text()).toBe('Incorporation Application')
    expect(documentBtns.at(0).attributes('disabled')).toBeUndefined()

    // FUTURE: verify Notice Of Articles button
    // NB: may be disabled while PAID instead of COMPLETED
    // expect(documentBtns.at(1).text()).toContain('Notice of Articles')
    // expect(documentBtns.at(1).attributes('disabled')).toBeUndefined()

    // FUTURE: verify Incorporation Certificate button
    // NB: may be disabled while PAID instead of COMPLETED
    // expect(documentBtns.at(2).text()).toContain('Incorporation Certificate')
    // expect(documentBtns.at(2).attributes('disabled')).toBeUndefined()

    // verify Receipt button
    expect(wrapper.find('.download-receipt-btn').text()).toContain('Receipt')

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')

    sessionStorage.removeItem('NR_NUMBER')
    wrapper.destroy()
  })

  it('displays the filing items pre/post bob date', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        'filing': {
          'header': {
            'name': 'annualReport',
            'date': '2019-07-02',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 123,
            'certifiedBy': 'Full Name 1',
            'filingId': 321,
            'status': 'COMPLETED',
            'availableOnPaperOnly': false
          },
          'annualReport': {
            'annualGeneralMeetingDate': '2019-12-31',
            'annualReportDate': '2019-12-31'
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'changeOfDirectors',
            'date': '2019-04-04',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 456,
            'certifiedBy': 'Full Name 2',
            'filingId': 654,
            'status': 'COMPLETED',
            'availableOnPaperOnly': false
          },
          'changeOfDirectors': {
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'changeOfAddress',
            'date': '2019-05-06',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 789,
            'certifiedBy': 'Full Name 3',
            'filingId': 987,
            'status': 'COMPLETED',
            'availableOnPaperOnly': false
          },
          'changeOfAddress': {
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'annualReport',
            'date': '2019-03-02',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 100,
            'certifiedBy': 'Full Name 1',
            'filingId': 3212,
            'status': 'COMPLETED',
            'availableOnPaperOnly': true
          },
          'annualReport': {
            'annualGeneralMeetingDate': '2019-01-01',
            'annualReportDate': '2019-01-01'
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'changeOfDirectors',
            'date': '2019-02-04',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 4561,
            'certifiedBy': 'Full Name 2',
            'filingId': 6541,
            'status': 'COMPLETED',
            'availableOnPaperOnly': true
          },
          'changeOfDirectors': {
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'changeOfAddress',
            'date': '2019-01-06',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 7891,
            'certifiedBy': 'Full Name 3',
            'filingId': 9871,
            'status': 'COMPLETED',
            'availableOnPaperOnly': true
          },
          'changeOfAddress': {
          }
        }
      }
    ]

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(6)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(6)
    expect(wrapper.emitted('filed-count')).toEqual([[6]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands the specified filing id for a pre-Bob date (paper only) filing', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        'filing': {
          'header': {
            'name': 'annualReport',
            'date': '2019-06-02',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 123,
            'certifiedBy': 'Full Name 1',
            'filingId': 321,
            'status': 'COMPLETED',
            'availableOnPaperOnly': false
          },
          'annualReport': {
            'annualGeneralMeetingDate': '2019-12-31',
            'annualReportDate': '2019-12-31'
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'changeOfDirectors',
            'date': '2019-03-09',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 456,
            'certifiedBy': 'Full Name 2',
            'filingId': 654,
            'status': 'COMPLETED',
            'availableOnPaperOnly': true
          },
          'changeOfDirectors': {
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify initial state
    expect(vm.filedItems.length).toEqual(2)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(2)
    expect(wrapper.emitted('filed-count')).toEqual([[2]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button
    const buttons = wrapper.findAll('.expand-btn')
    expect(buttons.length).toBe(2)
    expect(buttons.at(1).text()).toContain('Request a Copy')

    // expand details
    buttons.at(1).trigger('click')
    await Vue.nextTick()

    // verify Close button
    expect(wrapper.findAll('.expand-btn').at(1).text()).toContain('Close')

    // verify details
    expect(vm.panel).toBe(1) // second row is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(true)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find('.download-document-btn').exists()).toBe(false)
    expect(wrapper.find('.download-receipt-btn').exists()).toBe(false)
    expect(wrapper.find('.download-all-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands the specified filing id for a post-Bob date (regular) filing', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        'filing': {
          'header': {
            'name': 'changeOfDirectors',
            'date': '2019-03-09',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 456,
            'certifiedBy': 'Full Name 2',
            'filingId': 654,
            'status': 'COMPLETED',
            'availableOnPaperOnly': true
          },
          'changeOfDirectors': {
          }
        }
      },
      {
        'filing': {
          'header': {
            'name': 'annualReport',
            'date': '2019-06-02',
            'effectiveDate': 'Wed, 20 Nov 2019 22:17:54 GMT',
            'paymentToken': 123,
            'certifiedBy': 'Full Name 1',
            'filingId': 321,
            'status': 'COMPLETED',
            'availableOnPaperOnly': false
          },
          'annualReport': {
            'annualGeneralMeetingDate': '2019-12-31',
            'annualReportDate': '2019-12-31'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify initial state
    expect(vm.filedItems.length).toEqual(2)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(2)
    expect(wrapper.emitted('filed-count')).toEqual([[2]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button
    const buttons = wrapper.findAll('.expand-btn')
    expect(buttons.length).toBe(2)
    expect(buttons.at(1).text()).toContain('View Documents')

    // expand details
    buttons.at(1).trigger('click')
    await Vue.nextTick()

    // verify Hide Documents button
    expect(wrapper.findAll('.expand-btn').at(1).text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toBe(1) // second row is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find('.download-document-btn').exists()).toBe(true)
    expect(wrapper.find('.download-receipt-btn').exists()).toBe(true)
    expect(wrapper.find('.download-all-btn').exists()).toBe(true)

    wrapper.destroy()
  })

  it('shows the filing date in the correct format yyyy-mm-dd', async () => {
    const $route = { query: { filing_id: '654' } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = sampleFilings

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').at(0).find('.list-item__subtitle').text())
      .toContain('2019-06-02')

    wrapper.destroy()
  })

  it('displays the alert when the filing is future effective (BCOMP)', async () => {
    const $route = { query: { filing_id: '9873' } }

    // init store
    store.state.entityType = 'BC'
    store.state.entityIncNo = 'BC0007291'
    store.state.filings = sampleFilings

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').at(5).text())
      .toContain('The updated office addresses will be legally effective on 2019-12-13')

    wrapper.destroy()
  })

  it('displays a correction filing with Details Count', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityType = 'CP'
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = sampleFilings

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.filedItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(7)
    expect(wrapper.emitted('filed-count')).toEqual([[7]])

    const item = wrapper.findAll('.filing-history-item').at(6)
    expect(item.find('.list-item .filing-label').text()).toContain('Correction')
    expect(item.find('.list-item .filing-label').text()).toContain('Annual Report')
    expect(item.find('.list-item .filing-label .list-item__subtitle').text()).toContain('Details (2)')

    wrapper.destroy()
  })

  it('displays the Details List when comments are present on a correction filing', async () => {
    const $route = { query: { } }

    // init store
    store.state.filings = sampleFilings

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist until the item is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // verify detail comments button and expand
    // NB: only this filing has a detail comments button
    const button = wrapper.find('.comments-btn')
    expect(button.text()).toContain('Details (2)')
    button.trigger('click')
    await Vue.nextTick()

    // verify that Details List component is displayed after the item is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(true)

    wrapper.destroy()
  })

  it('does not display the Details List when no comments are present on a correction filing', async () => {
    const $route = { query: { filing_id: '9873' } }

    // init store
    store.state.filings = [
      {
        'filing': {
          'header': {
            'name': 'correction',
            'date': '2019-04-06T19:22:59.003777+00:00',
            'paymentToken': 7891,
            'certifiedBy': 'Cameron',
            'filingId': 9873,
            'availableOnPaperOnly': false,
            'effectiveDate': '2019-12-13T00:00:00+00:00',
            'status': 'COMPLETE'
          },
          'correction': {
            'correctedFilingType': 'annualReport',
            'correctedFilingDate': '2019-12-31'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that detail comments button does not exist
    expect(wrapper.find('.comments-btn').exists()).toBe(false)

    // verify that Details List component does not exist
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })
})
