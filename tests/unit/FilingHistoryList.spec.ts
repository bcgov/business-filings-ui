import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import flushPromises from 'flush-promises'
import axios from '@/axios-auth'
import sinon from 'sinon'

// Components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import ColinFiling from '@/components/Dashboard/FilingHistoryList/ColinFiling.vue'
import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/FutureEffective.vue'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/FutureEffectivePending.vue'
import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'
import PaperFiling from '@/components/Dashboard/FilingHistoryList/PaperFiling.vue'
import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import { DetailsList } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app: HTMLDivElement = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

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
        'date': '2019-12-12T19:22:59.003777+00:00', // Dec 12 at 11:22:59 am Pacific
        'paymentToken': 7891,
        'certifiedBy': 'Cameron',
        'filingId': 9873,
        'availableOnPaperOnly': false,
        // Effective Date is way in the future so it's always > now
        'effectiveDate': '2099-12-13T08:00:00+00:00', // Dec 13 at 00:00:00 am Pacific
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
        'status': 'COMPLETED',
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
    const $route = { query: {} }

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
    const $route = { query: {} }

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
    const $route = { query: {} }

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
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(true)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find('.download-document-btn').exists()).toBe(false)
    expect(wrapper.find('.download-receipt-btn').exists()).toBe(false)
    expect(wrapper.find('.download-all-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands the specified filing id for a post-Bob date (regular) filing', async () => {
    const $route = { query: {} }

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
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    store.state.entityType = 'BEN'
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
    const $route = { query: {} }

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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
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
          incorporationApplication: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('Numbered Benefit Company')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text())
      .toBe('FILED AND PENDING (filed by Full Name on 2020-05-06) | EFFECTIVE as of 2020-05-06')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays actual title for a named company IA', async () => {
    const $route = { query: {} }

    // init store
    store.state.nameRequest = null
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
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
          incorporationApplication: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text())
      .toBe('FILED AND PENDING (filed by Full Name on 2020-05-06) | EFFECTIVE as of 2020-05-06')
    expect(spans.at(2).text()).toBe('PAID')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Pending FE IA and documents', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-05-06T19:00:00+00:00',
            isFutureEffective: true,
            effectiveDate: '2020-05-06T19:00:00+00:00', // date in the past
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
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
          incorporationApplication: {}
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

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text())
      .toBe('FILED AND PENDING (filed by Full Name on 2020-05-06) | EFFECTIVE as of 2020-05-06')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            isFutureEffective: true,
            effectiveDate: '2099-12-31T23:59:59+00:00', // way in the future so it's always > now
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
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
          incorporationApplication: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text()).toBe('FUTURE EFFECTIVE INCORPORATION')
    expect(spans.at(2).text())
      .toBe('PAID (filed by Full Name on 2020-04-28) | EFFECTIVE as of 2099-12-31')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(true)
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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
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
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text())
      .toBe('FILED AND PENDING (filed by Full Name on 2020-05-06) | EFFECTIVE as of 2020-05-06')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            availableOnPaperOnly: false,
            certifiedBy: 'Full Name',
            date: '2020-04-28T19:14:45.589328+00:00',
            effectiveDate: '2099-12-31T23:59:59+00:00', // way in the future so it's always > now
            filingId: 85114,
            name: 'incorporationApplication',
            paymentToken: 1971,
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
              legalType: 'BEN'
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

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Full Name on 2020-04-28) | EFFECTIVE as of 2099-12-31')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
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
          documents: [
            {
              filename: 'T123456789 - Incorporation Application - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application',
              type: 'REPORT'
            }
          ],
          incorporationApplication: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    const spans = wrapper.findAll('.list-item__subtitle span')
    expect(spans.at(0).text())
      .toBe('FILED AND PENDING (filed by Full Name on 2020-05-06) | EFFECTIVE as of 2020-05-06')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
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
              legalType: 'BEN'
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

    expect(wrapper.find('.filing-label').text()).toContain('Benefit Company')
    expect(wrapper.find('.filing-label').text()).toContain('Incorporation Application')
    expect(wrapper.find('.filing-label').text()).toContain('ACME Benefit Inc')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Full Name on 2020-04-28) | EFFECTIVE as of 2020-05-06')
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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

describe('Filing History List - alterations', () => {
  it('displays "empty" alteration', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
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
          alteration: {}
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.list-item__title').text()).toBe('Alteration - Change of Company Information')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24) | EFFECTIVE as of 2020-03-24')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a BC Limited Company to Benefit Company alteration', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
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
            legalType: 'BC' // 'from' type
          },
          alteration: {
            business: {
              legalType: 'BEN' // 'to' type
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

    expect(wrapper.find('h3.list-item__title').text())
      .toBe('Alteration - BC Limited Company to a BC Benefit Company')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24) | EFFECTIVE as of 2020-03-24')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a BC ULC Company to Benefit Company alteration', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
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
            business: {
              legalType: 'BEN' // 'to' type
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

    expect(wrapper.find('h3.list-item__title').text())
      .toBe('Alteration - BC Unlimited Liability Company to a BC Benefit Company')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-03-24) | EFFECTIVE as of 2020-03-24')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(true)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a pending future-effective alteration', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            isFutureEffective: true,
            effectiveDate: '2020-04-24T19:20:05.670859+00:00', // date in the past
            status: 'PAID',
            filingId: 85114
          },
          business: {
            legalType: 'BC' // 'from' type
          },
          alteration: {
            business: {
              legalType: 'BEN' // 'to' type
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

    expect(wrapper.find('h3.list-item__title').text())
      .toBe('Alteration - BC Limited Company to a BC Benefit Company')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PENDING (filed by Registry Staff on 2020-03-24) | EFFECTIVE as of 2020-04-24')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  it('displays a future-effective alteration', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'alteration',
            date: '2020-03-24T19:20:05.670859+00:00',
            isFutureEffective: true,
            effectiveDate: '2099-12-31T23:59:59+00:00', // way in the future so it's always > now
            status: 'PAID',
            filingId: 85114
          },
          business: {
            legalType: 'BC' // 'from' type
          },
          alteration: {
            business: {
              legalType: 'BEN' // 'to' type
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

    expect(wrapper.find('h3.list-item__title').text())
      .toBe('Alteration - BC Limited Company to a BC Benefit Company')
    expect(wrapper.findAll('.list-item__subtitle span').at(0).text())
      .toBe('FUTURE EFFECTIVE ALTERATION')
    expect(wrapper.findAll('.list-item__subtitle span').at(2).text())
      .toBe('PAID (filed by Registry Staff on 2020-03-24) | EFFECTIVE as of 2099-12-31')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(true)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(ColinFiling).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - Colin filings', () => {
  it('displays an Annual Report Colin filing', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
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
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(ColinFiling).exists()).toBe(true)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - corrections', () => {
  it('displays a correction filing with Details Count', async () => {
    const $route = { query: {} }

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
    const $route = { query: {} }

    // init store
    store.state.filings = sampleFilings

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist until the item is expanded
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
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
            'status': 'COMPLETED'
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
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })

  it('display the documents present on a correction filing', async () => {
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
            'status': 'COMPLETED'
          },
          'correction': {
            'correctedFilingType': 'annualReport',
            'correctedFilingDate': '2019-12-31'
          },
          'documents': [
            {
              filename: 'BC1234567 - Incorporation Application (Corrected) - 2020-06-02.pdf',
              filingId: 85114,
              reportType: null,
              title: 'Incorporation Application (Corrected)',
              type: 'REPORT'
            }
          ]
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify Incorporation Application button
    const documentBtns = wrapper.findAll('.download-document-btn')
    expect(documentBtns.at(0).text()).toBe('Incorporation Application (Corrected)')
    expect(documentBtns.at(0).attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })
})

describe('Filing History List - redirections', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any

    sessionStorage.setItem('KEYCLOAK_TOKEN', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3F' +
      'QbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiI0MmMzOWQzYi1iMTZkLTRiYWMtOWU1Ny1hNDYyZjQ3NWY0M2UiLCJleHAiO' +
      'jE1NzUwNzI4MTEsIm5iZiI6MCwiaWF0IjoxNTc1MDQ0MDExLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV' +
      '0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwiYWNjb3VudCJdLCJzdWIiOiI4ZTVkZDYzNS01OGRkLTQ5YzUtYmViM' +
      'S00NmE1ZDVhMTYzNWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzYmMtYXV0aC13ZWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI' +
      '5OGQ3Y2Y2Zi0xYTQ1LTQzMzUtYWU0OC02YzBiNTdlMGYwNTAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly8xOTIuMTY4L' +
      'jAuMTM6ODA4MC8iLCIxOTIuMTY4LjAuMTMiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI' +
      '6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3Vud' +
      'CI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJ' +
      'yb2xlcyI6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl0sInByZWZlcnJlZF91c2VybmFtZSI6I' +
      'mJjMDAwNzI5MSIsImxvZ2luU291cmNlIjoiUEFTU0NPREUiLCJ1c2VybmFtZSI6ImJjMDAwNzI5MSJ9.GYKmp5SQxZYTEkltSgaM3LMNcmuo_n' +
      'b88wrYb6LbRk1BtCC0wU6Uu5zij_6mwXKyJ3dQ0L2EWR0eEqDuKzjWKVkIvQujXKzc8H9PPYPhgRqwdDr2qOglJrT2lJTkGZvPPqI217J2iiVW' +
      'OutPePeAmozIQhmf5jlZBW_J8qSzx9GmkQvT41hxpNLkaMPjPYVM2Iy6vL4Pnu0Xma-wCN1GCPwvJGQXCuh3IsR_iTMoig8qcFS0a0lUTx_cCj' +
      'G-zf_goG4vDTeKn6Mk50FToRtYGXkzWdfQn1T_yeS_2zrL8Ifg1QhJe74U_w40v4ikAFl-BofYnIRjopP57H-5g9_SGg')
  })

  const mockIncorporationApplication = {
    nameRequest: {
      'legalType': 'BEN'
    },
    nameTranslations: { 'new': ['ABC Ltd.', 'Financière de l’Odet', 'Société Générale'] },
    offices: {
      'registeredOffice': {
        'deliveryAddress': {
          'streetAddress': 'delivery_address - address line one',
          'addressCity': 'delivery_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        },
        'mailingAddress': {
          'streetAddress': 'mailing_address - address line one',
          'addressCity': 'mailing_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        }
      },
      'recordsOffice': {
        'deliveryAddress': {
          'streetAddress': 'delivery_address - address line one',
          'addressCity': 'delivery_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        },
        'mailingAddress': {
          'streetAddress': 'mailing_address - address line one',
          'addressCity': 'mailing_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        }
      }
    },
    parties: [
      {
        'officer': {
          'id': 1,
          'firstName': 'Joe',
          'lastName': 'Swanson',
          'middleName': 'P',
          'email': 'joe@email.com',
          'orgName': '',
          'partyType': 'person'
        },
        'mailingAddress': {
          'streetAddress': 'mailing_address - address line one',
          'streetAddressAdditional': '',
          'addressCity': 'mailing_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        },
        'deliveryAddress': {
          'streetAddress': 'delivery_address - address line one',
          'streetAddressAdditional': '',
          'addressCity': 'delivery_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        },
        'roles': [
          {
            'roleType': 'Completing Party',
            'appointmentDate': '2018-01-01'

          },
          {
            'roleType': 'Director',
            'appointmentDate': '2018-01-01'

          }
        ]
      },
      {
        'officer': {
          'id': 2,
          'firstName': '',
          'lastName': '',
          'middleName': '',
          'orgName': 'Xyz Inc.',
          'partyType': 'org'
        },
        'mailingAddress': {
          'streetAddress': 'mailing_address - address line one',
          'streetAddressAdditional': '',
          'addressCity': 'mailing_address city',
          'addressCountry': 'CA',
          'postalCode': 'H0H0H0',
          'addressRegion': 'BC'
        },
        'roles': [
          {
            'roleType': 'Incorporator',
            'appointmentDate': '2018-01-01'
          }
        ]
      }
    ],
    shareStructure: {
      'shareClasses': [
        {
          'id': 1,
          'name': 'Share Class 1',
          'priority': 1,
          'hasMaximumShares': true,
          'maxNumberOfShares': 100,
          'hasParValue': true,
          'parValue': 10,
          'currency': 'CAD',
          'hasRightsOrRestrictions': true,
          'series': [
            {
              'id': 1,
              'name': 'Share Series 1',
              'priority': 1,
              'hasMaximumShares': true,
              'maxNumberOfShares': 50,
              'hasRightsOrRestrictions': true
            },
            {
              'id': 2,
              'name': 'Share Series 2',
              'priority': 2,
              'hasMaximumShares': true,
              'maxNumberOfShares': 100,
              'hasRightsOrRestrictions': true
            }
          ]
        },
        {
          'id': 2,
          'name': 'Share Class 2',
          'priority': 1,
          'hasMaximumShares': true,
          'maxNumberOfShares': null,
          'hasParValue': true,
          'parValue': null,
          'currency': null,
          'hasRightsOrRestrictions': true,
          'series': []
        }
      ]
    },
    contactPoint: {
      'email': 'no_one@never.get',
      'phone': '123-456-7890'
    },
    incorporationAgreement: {
      'agreementType': 'sample'
    }
  }

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    const get = sinon.stub(axios, 'get')
    const post = sinon.stub(axios, 'post')

    // GET original IA
    get.withArgs('businesses/BC1234567/filings/85114')
      .returns(new Promise((resolve) => resolve({
        data:
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
            business: {
              'identifier': 'BC1234567',
              'legalName': 'legal name - BC1234567',
              'legalType': 'BEN'
            },
            incorporationApplication: mockIncorporationApplication
          }
        }
      })))

    post.withArgs('businesses/BC1234567/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            filing: {
              header: {
                availableOnPaperOnly: false,
                certifiedBy: 'Full Name',
                date: '2020-04-28T19:14:45.589328+00:00',
                filingId: 110514,
                name: 'correction',
                paymentToken: 1971,
                status: 'DRAFT'
              },
              business: {
                identifier: 'BC1234567',
                legalName: 'legal name - BC1234567',
                legalType: 'BEN'
              },
              correction: {
                correctedFilingId: 85114,
                correctedFilingType: 'incorporationApplication',
                correctedFilingDate: '2020-05-07',
                comment: null
              },
              incorporationApplication: mockIncorporationApplication
            }
          }
      })))
  })

  it('redirects to Edit URL when filing an IA correction', async () => {
    // init data
    sessionStorage.setItem('EDIT_URL', `${process.env.VUE_APP_PATH}/edit/`)
    store.state.keycloakRoles = ['staff']
    store.state.entityIncNo = 'BC1234567'
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
          incorporationApplication: {}
        }
      }
    ]

    const $route = { query: {} }
    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // sanity check
    expect(vm.historyItems.length).toEqual(1)

    // find and click the drop-down menu button
    const menuButton = wrapper.find('.menu-btn')
    expect(menuButton).toBeDefined()
    menuButton.trigger('click')
    await flushPromises()

    // find and click the "File a Correction" menu item
    const fileCorrectionItem = wrapper.find('.file-correction-item')
    expect(fileCorrectionItem).toBeDefined()
    fileCorrectionItem.trigger('click')
    await flushPromises()

    // verify redirection
    const createUrl = 'business/edit/BC1234567/correction?correction-id=110514'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })
})

describe('Filing History List - transition filing', () => {
  it('displays a Transition Filing', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
    store.state.entityName = 'ACME Benefit Inc'
    store.state.filings = [
      {
        filing: {
          header: {
            name: 'transition',
            date: '2020-11-01T19:20:05.670859+00:00',
            status: 'COMPLETED',
            filingId: 1234,
            paymentToken: 111
          },
          documents: [
            {
              'filename': 'BC1234567 - Transition Application - 2020-11-01.pdf',
              'filingId': 1234,
              'reportType': null,
              'title': 'Transition Application',
              'type': 'REPORT'
            }
          ],
          business: {
            legalType: 'BEN'
          },
          transition: {
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

    expect(wrapper.find('h3.list-item__title').text()).toBe('Transition Application')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Registry Staff on 2020-11-01) | EFFECTIVE as of 2020-11-01')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
    expect(wrapper.find('.download-document-btn').exists()).toBe(true)
    expect(wrapper.find('.download-receipt-btn').exists()).toBe(true)
    expect(wrapper.find('.download-all-btn').exists()).toBe(true)

    sessionStorage.removeItem('BUSINESS_ID')

    wrapper.destroy()
  })
})

describe('Filing History List - registrars notation', () => {
  it('displays a Registrars Notation Filing', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1230072')
    store.state.entityType = 'BEN'
    store.state.entityName = '1230072 B.C. LTD.'
    store.state.filings = [
      {
        filing: {
          registrarsNotation: {
            fileNumber: '#1234-5678/90',
            orderDate: '2021-01-30T09:56:01+08:00',
            effectOfOrder: 'planOfArrangement',
            orderDetails: 'A note about order'
          },
          business: {
            foundingDate: '2021-01-13T21:37:19.844203+00:00',
            identifier: 'BC1230072',
            legalName: '1230072 B.C. LTD.',
            legalType: 'BEN'
          },
          documents: [],
          header: {
            name: 'registrarsNotation',
            date: '2021-05-06',
            certifiedBy: 'Cameron',
            email: 'no_one@never.get',
            filingId: 112040,
            effectiveDate: '2021-05-05T20:37:44.613716+00:00'
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

    expect(wrapper.find('h3.list-item__title').text()).toBe('Registrars Notation')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Cameron on 2021-05-05)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')

    wrapper.destroy()
  })
})

describe('Filing History List - registrars order', () => {
  it('displays a Registrars Order Filing', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1230072')
    store.state.entityType = 'BEN'
    store.state.entityName = '1230072 B.C. LTD.'
    store.state.filings = [
      {
        filing: {
          registrarsOrder: {
            fileNumber: '#1234-5678/90',
            orderDate: '2021-01-30T09:56:01+08:00',
            effectOfOrder: 'planOfArrangement',
            orderDetails: 'A note about order'
          },
          business: {
            foundingDate: '2021-01-13T21:37:19.844203+00:00',
            identifier: 'BC1230072',
            legalName: '1230072 B.C. LTD.',
            legalType: 'BEN'
          },
          documents: [],
          header: {
            name: 'registrarsOrder',
            date: '2021-05-06',
            certifiedBy: 'Cameron',
            email: 'no_one@never.get',
            filingId: 112040,
            effectiveDate: '2021-05-05T20:37:44.613716+00:00'
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

    expect(wrapper.find('h3.list-item__title').text()).toBe('Registrars Order')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Cameron on 2021-05-05)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')

    wrapper.destroy()
  })
})

describe('Filing History List - Court Order', () => {
  it('displays a Court Order Filing', async () => {
    const $route = { query: {} }

    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1230072')
    store.state.entityType = 'BEN'
    store.state.entityName = '1230072 B.C. LTD.'
    store.state.filings = [
      {
        filing: {
          courtOrder: {
            fileNumber: '#1234-5678/90',
            orderDate: '2021-01-30T09:56:01+08:00',
            effectOfOrder: 'planOfArrangement',
            orderDetails: 'A note about order'
          },
          business: {
            foundingDate: '2021-01-13T21:37:19.844203+00:00',
            identifier: 'BC1230072',
            legalName: '1230072 B.C. LTD.',
            legalType: 'BEN'
          },
          documents: [],
          header: {
            name: 'courtOrder',
            date: '2021-05-06',
            certifiedBy: 'Cameron',
            email: 'no_one@never.get',
            filingId: 112040,
            effectiveDate: '2021-05-05T20:37:44.613716+00:00'
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

    expect(wrapper.find('h3.list-item__title').text()).toBe('Court Order')
    expect(wrapper.find('.list-item__subtitle span').text())
      .toBe('FILED AND PAID (filed by Cameron on 2021-05-05)')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')

    wrapper.destroy()
  })
})
