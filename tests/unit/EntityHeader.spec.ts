import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import mockRouter from './mockRouter'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { EntityStatus, FilingStatus, FilingTypes } from '@/enums'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const filingHistoryListStore = useFilingHistoryListStore()
const rootStore = useRootStore()

describe('Entity Header - data', () => {
  const router = mockRouter.mock()

  it('handles empty data', async () => {
    // set store properties
    businessStore.setLegalName(null)
    businessStore.setLegalType(null)
    rootStore.entityStatus = null

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').exists()).toBe(false)
    expect(wrapper.find('#app-description').exists()).toBe(false)
  })

  it('displays Business entity info properly', async () => {
    // set store properties
    businessStore.setLegalName('My Business')
    businessStore.setGoodStanding(true)
    businessStore.setLegalType(CorpTypeCd.COOP)

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: 'CP0001191', tempRegNumber: null }
    })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#entity-legal-name').text()).toBe('My Business')
    expect(wrapper.find('#app-description').exists()).toBe(false)
  })

  it('displays Draft Incorp App entity info properly - Named Company', async () => {
    // set store properties
    businessStore.setLegalName('My Named Company')
    rootStore.entityStatus = EntityStatus.DRAFT_INCORP_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('My Named Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Benefit Company Incorporation Application')
  })

  it('displays Draft Incorp App entity info properly - Numbered Company', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.DRAFT_INCORP_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Benefit Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Benefit Company Incorporation Application')
  })

  it('displays Paid (Named) Incorp App entity info properly', async () => {
    // set store properties
    businessStore.setLegalName('My Future Company')
    rootStore.entityStatus = EntityStatus.FILED_INCORP_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('My Future Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Benefit Company Incorporation Application')
  })

  it('displays draft numbered amalgamation application - Regular', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.DRAFT_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    filingHistoryListStore.setFilings([])
    rootStore.setTasks([
      {
        task: {
          filing: {
            displayName: 'BC Limited Company Amalgamation Application - Regular'
          }
        }
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Regular')
  })

  it('displays draft named amalgamation application - Regular', async () => {
    // set store properties
    businessStore.setLegalName('My Amalgamated Company')
    rootStore.entityStatus = EntityStatus.DRAFT_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    filingHistoryListStore.setFilings([])
    rootStore.setTasks([
      {
        task: {
          filing: {
            displayName: 'BC Limited Company Amalgamation Application - Regular'
          }
        }
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('My Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Regular')
  })

  it('displays filed numbered amalgamated company - Regular', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.FILED_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Regular',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Regular')
  })

  it('displays filed named amalgamated company - Regular', async () => {
    // set store properties
    businessStore.setLegalName('My Amalgamated Company')
    rootStore.entityStatus = EntityStatus.FILED_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Regular',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('My Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Regular')
  })

  it('displays numbered amalgamated company - Regular amalgamation', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = null
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Regular',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('Numbered Limited Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })

  it('displays named amalgamated company - Regular amalgamation', async () => {
    // set store properties
    businessStore.setLegalName('My Amalgamated Company')
    rootStore.entityStatus = null
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Regular',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('My Amalgamated Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })

  it('displays draft numbered amalgamation application - Horizontal', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.DRAFT_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    filingHistoryListStore.setFilings([])
    rootStore.setTasks([
      {
        task: {
          filing: {
            displayName: 'BC Limited Company Amalgamation Application - Horizontal'
          }
        }
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Horizontal')
  })

  it('displays filed numbered amalgamated company - Horizontal', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.FILED_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Horizontal',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Horizontal')
  })

  it('displays numbered amalgamated company - Horizontal amalgamation', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = null
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Horizontal',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('Numbered Limited Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })

  it('displays draft numbered amalgamation application - Vertical', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.DRAFT_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    filingHistoryListStore.setFilings([])
    rootStore.setTasks([
      {
        task: {
          filing: {
            displayName: 'BC Limited Company Amalgamation Application - Vertical'
          }
        }
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Vertical')
  })

  it('displays filed numbered amalgamated company - Vertical', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.FILED_AMALGAMATION
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Vertical',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Vertical')
  })

  it('displays numbered amalgamated company - Vertical amalgamation', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = null
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    rootStore.setTasks([])
    filingHistoryListStore.setFilings([
      {
        displayLedger: true,
        displayName: 'BC Limited Company Amalgamation Application - Vertical',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        name: FilingTypes.AMALGAMATION_APPLICATION,
        status: FilingStatus.COMPLETED,
        submittedDate: 'Sun, 02 Jun 2019 19:22:59 GMT'
      } as any
    ])

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('Numbered Limited Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })
})

describe('Entity Header - HISTORICAL badge', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      entityState: 'ACTIVE',
      exists: false
    },
    { // 1
      entityState: 'LIQUIDATION',
      exists: false
    },
    { // 2
      entityState: 'HISTORICAL',
      stateFiling: null,
      exists: true,
      text: 'Unknown Reason'
    },
    { // 3
      entityState: 'HISTORICAL',
      stateFiling: {
        header: { name: 'dissolution' },
        dissolution: {
          dissolutionDate: '2020-01-01',
          dissolutionType: 'voluntary'
        }
      },
      exists: true,
      text: 'Voluntary Dissolution – January 1, 2020'
    },
    { // 4
      entityState: 'HISTORICAL',
      stateFiling: {
        header: {
          name: 'involuntaryDissolution',
          effectiveDate: '2020-01-01T08:01:00+00:00'
        }
      },
      exists: true,
      text: 'Involuntary Dissolution – January 1, 2020 at 12:01 am Pacific time'
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays historical badge - variation #${index}`, async () => {
      // init store
      businessStore.setState(_.entityState as any)
      rootStore.setStateFiling(_.stateFiling as any || null)

      const wrapper = shallowMount(EntityHeader, {
        vuetify,
        router,
        propsData: { businessId: 'BC1234567', tempRegNumber: null }
      })
      await Vue.nextTick()

      expect(wrapper.find('#historical-chip').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#historical-chip').text()).toBe('HISTORICAL')
        expect(wrapper.find('#historical-chip + span').text()).toBe(_.text)
      }

      // cleanup
      businessStore.setState(null)
      rootStore.setStateFiling(null)
      wrapper.destroy()
    })
  })
})

describe('Entity Header - LIMITED RESTORATION badge', () => {
  const router = mockRouter.mock()

  const variations = [
    { // 0
      stateFiling: null,
      exists: false
    },
    { // 1
      stateFiling: { restoration: { type: 'limitedRestoration' } },
      exists: true
    },
    { // 2
      stateFiling: { restoration: { type: 'limitedRestorationExtension' } },
      exists: true
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays limited restoration badge - variation #${index}`, async () => {
      // init store
      rootStore.setStateFiling(_.stateFiling)

      const wrapper = shallowMount(EntityHeader, {
        vuetify,
        router,
        propsData: { businessId: 'BC1234567', tempRegNumber: null }
      })
      await Vue.nextTick()

      expect(wrapper.find('#limited-restoration').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#active-util').text()).toContain('Active until')
        expect(wrapper.find('#limited-restoration').text()).toContain('LIMITED RESTORATION')
      }

      // cleanup
      rootStore.setStateFiling(null)
      wrapper.destroy()
    })
  })
})

describe('Entity Header - AUTHORIZED TO CONTINUE OUT badge', () => {
  const router = mockRouter.mock()

  const variations = [
    {
      filing: {
        data: {
          consentContinuationOut: {
            expiry: '2223-11-09T08:00:00+00:00'
          }
        }
      },
      exists: true
    },
    {
      filing: {
        data: {
          consentContinuationOut: {
            expiry: '2022-11-09T08:00:00+00:00'
          }
        }
      },
      exists: false
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays continue out badge - variation #${index}`, async () => {
      // init store
      filingHistoryListStore.filings.push(_.filing as any)

      const wrapper = shallowMount(EntityHeader, {
        vuetify,
        router,
        propsData: { businessId: 'BC1234567', tempRegNumber: null }
      })
      await Vue.nextTick()

      expect(wrapper.find('#authorized-to-continue-out').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#authorized-to-continue-out').text()).toBe('AUTHORIZED TO CONTINUE OUT')
      }

      // cleanup
      filingHistoryListStore.filings.pop()
      wrapper.destroy()
    })
  })
})
