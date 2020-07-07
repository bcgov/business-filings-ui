import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import flushPromises from 'flush-promises'

// Components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import ColinFiling from '@/components/Dashboard/ColinFiling.vue'
import CompletedIa from '@/components/Dashboard/CompletedIa.vue'
import FutureEffectiveIa from '@/components/Dashboard/FutureEffectiveIa.vue'
import FutureEffectiveIaPending from '@/components/Dashboard/FutureEffectiveIaPending.vue'
import NoticeOfAlteration from '@/components/Dashboard/NoticeOfAlteration.vue'
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
        'date': '2019-12-12T19:22:59.003777+00:00', // filed Dec 12 at 11:22:59 AM
        'paymentToken': 7891,
        'certifiedBy': 'Cameron',
        'filingId': 9873,
        'availableOnPaperOnly': false,
        // Effective Date is way in the future so it's always > now
        'effectiveDate': '2099-12-13T08:00:00+00:00', // in UTC (Dec 13 at 00:00:00 AM Pacific)
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

describe('Filing History List - regular filings', () => {
  it('handles empty data', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('history-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('You have no filing history')

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

    expect(vm.historyItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').at(0).find('.list-item__subtitle').text())
      .toContain('2019-06-02')

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

    expect(vm.historyItems.length).toEqual(6)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(6)
    expect(wrapper.emitted('history-count')).toEqual([[6]])
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
    expect(vm.historyItems.length).toEqual(2)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(2)
    expect(wrapper.emitted('history-count')).toEqual([[2]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button
    const buttons = wrapper.findAll('.expand-btn')
    expect(buttons.length).toBe(2)
    expect(buttons.at(1).text()).toContain('Request a Copy')

    // expand details
    buttons.at(1).trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.findAll('.expand-btn').at(1).text()).toContain('Close')

    // verify details
    expect(vm.panel).toBe(1) // second row is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
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
          'documents': [
            {
              'filename': 'BC1111111 - Director Change - 2020-06-01.pdf',
              'filingId': 654,
              'reportType': null,
              'title': 'Director Change',
              'type': 'REPORT'
            }
          ],
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
          'documents': [
            {
              'filename': 'BC1111111 - Annual Report - 2020-06-01.pdf',
              'filingId': 321,
              'reportType': null,
              'title': 'Annual Report',
              'type': 'REPORT'
            }
          ],
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
    expect(vm.historyItems.length).toEqual(2)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(2)
    expect(wrapper.emitted('history-count')).toEqual([[2]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button
    const buttons = wrapper.findAll('.expand-btn')
    expect(buttons.length).toBe(2)
    expect(buttons.at(1).text()).toContain('View Documents')

    // expand details
    buttons.at(1).trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.findAll('.expand-btn').at(1).text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toBe(1) // second row is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find('.download-document-btn').exists()).toBe(true)
    expect(wrapper.find('.download-receipt-btn').exists()).toBe(true)
    expect(wrapper.find('.download-all-btn').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays the tooltip when the filing is a BCOMP Future Effective COA', async () => {
    const $route = { query: { filing_id: '9873' } }

    // init store
    store.state.entityType = 'BC'
    store.state.entityIncNo = 'BC0007291'
    store.state.filings = sampleFilings

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(7)
    const item = wrapper.findAll('.filing-history-item').at(5)
    expect(item.find('.list-item__subtitle').text())
      .toContain('FILED AND PENDING (filed by Cameron on 2019-12-12')
    expect(item.find('.list-item__subtitle').text())
      .toContain('The updated office addresses will be legally effective')

    expect(item.text()).toContain('The updated office addresses will be legally effective on 2099-12-13')

    wrapper.destroy()
  })
})

describe('Filing History List - incorporation applications', () => {
  it('handles empty data', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.filings = []

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('history-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('Complete your filing to display')

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays default title for a numbered company IA', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BC'
    store.state.entityName = null
    store.state.nameRequest = null
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            status: 'PAID'
          },
          documents: [],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('Numbered Benefit Company')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FILED AND PENDING (filed by Full Name on 2020-05-06)')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays actual title for a named company IA', async () => {
    const $route = { query: { } }

    // init store
    store.state.nameRequest = null
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            status: 'PAID'
          },
          documents: [],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FILED AND PENDING (filed by Full Name on 2020-05-06)')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Pending FE IA and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            isFutureEffective: true,
            status: 'PAID'
          },
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify panel h
    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FILED AND PENDING (filed by Full Name on 2020-05-06)')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(true)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
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
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a FE IA and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            effectiveDate: '2099-05-08T19:00:00+00:00', // way in the future so it's always > now
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            isFutureEffective: true,
            status: 'PAID'
          },
          documents: [
            {
              filename: 'T123456789 - Incorporation Application (Future Effective) - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application - Future Effective Incorporation',
              type: 'REPORT'
            }
          ],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FUTURE EFFECTIVE INCORPORATION')
    expect(spans.at(2).text()).toBe('PAID (filed by Full Name on 2020-04-28)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(true)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // verify Incorporation Application button
    const documentBtns = wrapper.findAll('.download-document-btn')
    expect(documentBtns.at(0).text()).toBe('Incorporation Application - Future Effective Incorporation')
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
    expect(wrapper.find('.download-receipt-btn').text()).toBe('Receipt - Future Effective Incorporation')
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Paid IA (incorp app mode) and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            isFutureEffective: false,
            status: 'PAID'
          },
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FILED AND PENDING (filed by Full Name on 2020-05-06)')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(true)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
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
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Completed IA (incorp app mode) and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            effectiveDate: '2099-05-08T19:00:00+00:00', // way in the future so it's always > now
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            isFutureEffective: false,
            status: 'COMPLETED'
          },
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: {
            nameRequest: {
              legalType: 'BC'
            }
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Full Name on 2020-04-28)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(true)
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
    expect(wrapper.find('.download-receipt-btn').text()).toBe('Receipt')
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Paid IA (business mode) and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            isFutureEffective: false,
            status: 'PAID'
          },
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: { }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FILED AND PENDING (filed by Full Name on 2020-05-06)')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(true)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
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
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Completed IA (business mode) and documents', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
            status: 'COMPLETED'
          },
          documents: [
            {
              filename: 'BC1234567 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: {
            nameRequest: {
              legalType: 'BC'
            }
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('BC Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Full Name on 2020-04-28)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify there is no Details button
    expect(wrapper.find('.details-btn').exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
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
    expect(wrapper.find('.download-receipt-btn').text()).toBe('Receipt')
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - Alteration Notices', () => {
  it('displays a Corp Type alteration (BC ULC to BCOMP)', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 85114
          },
          business: {
            legalType: 'ULC' // 'from' type
          },
          alteration: {
            alterCorpType: {
              corpType: 'BC' // 'to' type
            }
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration Notice')
    expect(wrapper.find('h4.list-item__title').text())
      .toContain('BC Unlimited Liability Company to BC Benefit Company')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a Corp Type alteration (BC COMP to BCOMP)', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 85114
          },
          business: {
            legalType: 'BCC' // 'from' type
          },
          alteration: {
            alterCorpType: {
              corpType: 'BC' // 'to' type
            }
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration Notice')
    expect(wrapper.find('h4.list-item__title').text()).toContain('BC Company to BC Benefit Company')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a Company Name alteration', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 85114
          },
          business: {},
          alteration: {
            alterCorpName: {}
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration Notice')
    expect(wrapper.find('h4.list-item__title').text()).toContain('Company Name')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a Company Name Translation alteration', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 85114
          },
          business: {},
          alteration: {
            alterNameTranslations: {}
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration Notice')
    expect(wrapper.find('h4.list-item__title').text()).toContain('Company Name Translation')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a Share Structure alteration', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 85114
          },
          business: {},
          alteration: {
            alterShareStructure: {}
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration Notice')
    expect(wrapper.find('h4.list-item__title').text()).toContain('Share Structure')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - Colin filings', () => {
  it('displays an Annual Report Colin filing', async () => {
    const $route = { query: { } }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BC'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'annualReport',
            date: '2020-03-24T19:20:05.670859+00:00',
            availableInColinOnly: true,
            status: 'COMPLETED',
            filingId: 85114
          },
          annualReport: {
            annualReportDate: '2018-06-10'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.list-item__title').text()).toBe('Annual Report (2018)')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed on 2020-03-24)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify expand button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify updated expand button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectiveIaPending).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(NoticeOfAlteration).exists()).toBe(false)
    expect(wrapper.find(ColinFiling).exists()).toBe(true)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - corrections', () => {
  it('displays a correction filing with Details Count', async () => {
    const $route = { query: { } }

    // init store
    store.state.entityType = 'CP'
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = sampleFilings

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(7)
    expect(wrapper.emitted('history-count')).toEqual([[7]])

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
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // verify detail comments button and expand
    // NB: only this filing has a detail comments button
    const button = wrapper.find('.comments-btn')
    expect(button.text()).toContain('Details (2)')
    button.trigger('click')
    await flushPromises()

    // verify that Details List component is displayed after the item is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
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
    expect(wrapper.find(FutureEffectiveIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })
})
