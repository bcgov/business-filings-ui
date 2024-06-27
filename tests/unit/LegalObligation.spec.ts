import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import { ConfigJson } from '@/resources'
import { CorpTypeCd, EntityState } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

// Components
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const filingHistoryListStore = useFilingHistoryListStore()
const rootStore = useRootStore()

const newIncorporationFiling = [
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'Incorporation Application',
    effectiveDate: '2024-02-21 12:00:00 GMT',
    filingId: 123,
    isFutureEffective: false,
    name: FilingTypes.AMALGAMATION_APPLICATION,
    status: 'PAID',
    submittedDate: '2024-02-21 12:00:00 GMT',
    submitter: 'Full Name 1'
  }
]

const newAmalgamationFiling = [
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'Amalgamation Application (Regular)',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 123,
    isFutureEffective: false,
    name: FilingTypes.INCORPORATION_APPLICATION,
    status: 'PAID',
    submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT',
    submitter: 'Full Name 1'
  }
]

const newContinuationFiling = [
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'BC Benefit Company Continuation Application',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 123,
    isFutureEffective: false,
    name: FilingTypes.CONTINUATION_IN,
    status: 'PAID',
    submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT',
    submitter: 'Full Name 1'
  }
]

const newRegistrationFiling = [
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'Registration',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 123,
    isFutureEffective: false,
    name: FilingTypes.REGISTRATION,
    status: 'PAID',
    submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT',
    submitter: 'Full Name 1'
  }
]

const businessWithMaintenanceFiling = [
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'Incorporation Application',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 123,
    isFutureEffective: false,
    name: FilingTypes.INCORPORATION_APPLICATION,
    status: 'PAID',
    submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT',
    submitter: 'Full Name 1'
  },
  {
    availableOnPaperOnly: false,
    displayLedger: true,
    displayName: 'Annual Report (2019)',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 456,
    isFutureEffective: false,
    name: FilingTypes.ANNUAL_REPORT,
    status: 'PAID',
    submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT',
    submitter: 'Full Name 1'
  }
]

const taskList = [
  {
    task: {
      filing: {
        header: {
          name: FilingTypes.ANNUAL_REPORT,
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
    filingBody: newIncorporationFiling
  },
  {
    entityType: CorpTypeCd.BENEFIT_COMPANY,
    identifier: 'BC1232134',
    displaysObligations: true,
    filingBody: newAmalgamationFiling
  },
  {
    entityType: CorpTypeCd.BEN_CONTINUE_IN,
    identifier: 'BC1232134',
    displaysObligations: true,
    filingBody: newContinuationFiling
  },
  {
    entityType: CorpTypeCd.COOP,
    identifier: 'CP1232134',
    displaysObligations: false,
    filingBody: newIncorporationFiling
  },
  {
    entityType: CorpTypeCd.SOLE_PROP,
    identifier: 'BC1232134',
    displaysObligations: true,
    filingBody: newRegistrationFiling
  },
  {
    entityType: CorpTypeCd.PARTNERSHIP,
    identifier: 'BC1232134',
    displaysObligations: true,
    filingBody: newRegistrationFiling
  }
]

for (const test of obligationTestCases) {
  describe(`Legal Obligation for ${test.entityType}`, () => {
    beforeAll(() => {
      sessionStorage.setItem('BUSINESS_ID', test.identifier)
      businessStore.setLegalType(test.entityType)
      businessStore.setIdentifier(test.identifier)
      businessStore.setState(EntityState.ACTIVE)
      rootStore.configObject = ConfigJson.find(x => x.entityType === test.entityType)
    })

    afterAll(() => {
      sessionStorage.removeItem('BUSINESS_ID')
      businessStore.setLegalType(null)
      businessStore.setIdentifier(null)
      rootStore.tasks = []
    })

    it('do not show the legal obligation section if there are no filings', async () => {
      filingHistoryListStore.setFilings([])

      const wrapper = mount(LegalObligation, { vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })

    it('shows the legal obligation section if it is a new business with no maintenance filing', async () => {
      filingHistoryListStore.setFilings(test.filingBody as any)

      const wrapper = mount(LegalObligation, { vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(test.displaysObligations)

      wrapper.destroy()
    })

    it('do not show the legal obligation section if the business has maintenance filings', async () => {
      filingHistoryListStore.setFilings(businessWithMaintenanceFiling as any)

      const wrapper = mount(LegalObligation, { vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })

    it('hides the legal obligation section on clicking dismiss button', async () => {
      filingHistoryListStore.setFilings(test.filingBody as any)

      const wrapper = mount(LegalObligation, { vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(test.displaysObligations)

      if (test.displaysObligations) {
        await wrapper.find('#dismiss-btn').trigger('click')
        expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)
      }

      wrapper.destroy()
    })

    it('hides the legal obligation section if there is a task', async () => {
      filingHistoryListStore.setFilings(test.filingBody as any)
      rootStore.setTasks(taskList as any)

      const wrapper = mount(LegalObligation, { vuetify })
      await Vue.nextTick()

      expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

      wrapper.destroy()
    })
  })
}

describe('Legal Obligation - temp reg number', () => {
  it('hides the legal obligation section for temp reg number', async () => {
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    filingHistoryListStore.setFilings(newIncorporationFiling as any)

    const wrapper = mount(LegalObligation, { vuetify })
    await Vue.nextTick()

    expect(wrapper.find('.legal-obligation-container').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })
})
