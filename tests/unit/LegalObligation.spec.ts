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
const store = getVuexStore() as any // remove typings for unit tests

const newBusinessFiling = [
  {
    availableOnPaperOnly: false,
    displayName: 'Incorporation Application',
    effectiveDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    filingId: 123,
    isFutureEffective: false,
    name: 'incorporationApplication',
    status: 'PAID',
    submittedDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    submitter: 'Full Name 1'
  }
]

const businessWithMaintenanceFiling = [
  {
    availableOnPaperOnly: false,
    displayName: 'Incorporation Application',
    effectiveDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    filingId: 123,
    isFutureEffective: false,
    name: 'incorporationApplication',
    status: 'PAID',
    submittedDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    submitter: 'Full Name 1'
  },
  {
    availableOnPaperOnly: false,
    displayName: 'Annual Report (2019)',
    effectiveDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    filingId: 456,
    isFutureEffective: false,
    name: 'annualReport',
    status: 'PAID',
    submittedDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    submitter: 'Full Name 1'
  }
]

const taskList = [
  {
    task: {
      filing: {
        header: {
          name: 'annualReport',
          ARFilingYear: 2019,
          status: 'ERROR',
          filingId: 789
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

async function waitForUpdate () {
  await Vue.nextTick()
  await flushPromises()
  await Vue.nextTick()
}

describe('Legal Obligation', () => {
  beforeAll(() => {
    store.state.entityType = 'BEN'
  })

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
