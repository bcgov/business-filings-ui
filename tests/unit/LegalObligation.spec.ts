import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { ConfigJson } from '@/resources'
import { CorpTypeCd } from '@/enums'

// Components
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

const newIncorporationFiling = [
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

const newRegistrationFiling = [
  {
    availableOnPaperOnly: false,
    displayName: 'Registration',
    effectiveDate: new Date('2019-06-02T19:22:59.003777+00:00'),
    filingId: 123,
    isFutureEffective: false,
    name: 'registration',
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

const obligationTestCases = [
  {
    entityType: CorpTypeCd.BENEFIT_COMPANY,
    identifier: 'BC1232134',
    displaysObligations: true,
    configKey: 0,
    filingBody: newIncorporationFiling
  },
  {
    entityType: CorpTypeCd.COOP,
    identifier: 'CP1232134',
    displaysObligations: false,
    configKey: 1,
    filingBody: newIncorporationFiling
  },
  {
    entityType: CorpTypeCd.SOLE_PROP,
    identifier: 'BC1232134',
    displaysObligations: true,
    configKey: 2,
    filingBody: newRegistrationFiling
  },
  {
    entityType: CorpTypeCd.PARTNERSHIP,
    identifier: 'BC1232134',
    displaysObligations: true,
    configKey: 3,
    filingBody: newRegistrationFiling
  }
]

for (const test of obligationTestCases) {
  describe(`Legal Obligation for ${test.entityType}`, () => {
    beforeAll(() => {
      sessionStorage.setItem('BUSINESS_ID', test.identifier)
      store.commit('setLegalType', test.entityType)
      store.commit('setIdentifier', test.identifier)
      store.state.configObject = ConfigJson[test.configKey]
    })

    afterAll(() => {
      sessionStorage.removeItem('BUSINESS_ID')
      store.commit('setLegalType', null)
      store.commit('setIdentifier', null)
      store.state.tasks = []
    })

    it('do not show the legal obligation section if there are no filings', async () => {
      store.state.filings = []

      const wrapper = mount(LegalObligation, { store, vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })

    it('shows the legal obligation section if it is a new business with no maintenance filing', async () => {
      store.state.filings = test.filingBody

      const wrapper = mount(LegalObligation, { store, vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(test.displaysObligations)

      wrapper.destroy()
    })

    it('do not show the legal obligation section if the business has maintenance filings', async () => {
      store.state.filings = businessWithMaintenanceFiling

      const wrapper = mount(LegalObligation, { store, vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })

    it('hides the legal obligation section on clicking dismiss button', async () => {
      store.state.filings = test.filingBody

      const wrapper = mount(LegalObligation, { store, vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(test.displaysObligations)

      if (test.displaysObligations) {
        await wrapper.find('#dismiss-btn').trigger('click')
        expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
      }

      wrapper.destroy()
    })

    it('hides the legal obligation section if there is a task', async () => {
      store.state.filings = test.filingBody
      store.state.tasks = taskList

      const wrapper = mount(LegalObligation, { store, vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })
  })
}

describe('Legal Obligation - temp reg number', () => {
  it('hides the legal obligation section for temp reg number', async () => {
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    store.state.filings = newIncorporationFiling

    const wrapper = mount(LegalObligation, { store, vuetify })
    await Vue.nextTick()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })
})
