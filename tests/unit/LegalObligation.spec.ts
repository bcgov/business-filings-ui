import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import flushPromises from 'flush-promises'

// Components
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

const newBusinessFiling = [
  {
    'filing': {
      'header': {
        'name': 'incorporationApplication',
        'date': '2019-06-02T19:22:59.003777+00:00',
        'paymentToken': 123,
        'certifiedBy': 'Full Name 1',
        'filingId': 321,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-06-02T19:22:59.003777+00:00'
      },
      'incorporationApplication': {
        'annualGeneralMeetingDate': '2019-12-31',
        'annualReportDate': '2019-12-31'
      }
    }
  }
]

const businessWithMaintenanceFiling = [
  {
    'filing': {
      'header': {
        'name': 'incorporationApplication',
        'date': '2019-06-02T19:22:59.003777+00:00',
        'paymentToken': 123,
        'certifiedBy': 'Full Name 1',
        'filingId': 321,
        'availableOnPaperOnly': false,
        'effectiveDate': '2019-06-02T19:22:59.003777+00:00'
      },
      'incorporationApplication': {
      }
    }
  },
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
  }
]

const taskList = [
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

async function waitForUpdate () {
  await Vue.nextTick()
  await flushPromises()
  await Vue.nextTick()
}

describe('Legal Obligation', () => {
  it('do not show the legal obligation section if there are no filings', async () => {
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
    wrapper.destroy()
  })

  it('shows the legal obligation section if it is a new business with no maintenance filing', async () => {
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = newBusinessFiling

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(true)
    wrapper.destroy()
  })

  it('do not show the legal obligation section if the business has maintenance filings', async () => {
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = businessWithMaintenanceFiling

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
    wrapper.destroy()
  })

  it('hides the legal obligation section on clicking dismiss button', async () => {
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = newBusinessFiling

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()
    expect(wrapper.find('.legal-obligation-container').exists()).toBe(true)

    wrapper.find('#dismiss-btn').trigger('click')
    await waitForUpdate()
    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
    wrapper.destroy()
  })

  it('hides the legal obligation section if there is a task', async () => {
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = newBusinessFiling
    store.state.tasks = taskList

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
    wrapper.destroy()
  })

  it('hides the legal obligation section for temp reg number', async () => {
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    store.state.filings = newBusinessFiling

    const wrapper = mount(LegalObligation, { store, vuetify })
    await waitForUpdate()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
    wrapper.destroy()
  })
})
