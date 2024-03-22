import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { EntityState, EntityStatus, FilingStatus, FilingSubTypes, FilingTypes } from '@/enums'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const filingHistoryListStore = useFilingHistoryListStore()
const rootStore = useRootStore()

describe('Entity Header - data', () => {
  it('handles empty data', async () => {
    // set store properties
    businessStore.setLegalName(null)
    businessStore.setLegalType(null)
    rootStore.entityStatus = null

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
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
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('My Amalgamated Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })

  // Unit test assertions for Vertical amalgamation are pretty much the same except 'displayName'
  // Reducing it to one as both tests are quite similar
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
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Horizontal')
  })

  // Unit test assertions for Vertical amalgamation are pretty much the same except 'displayName'
  // Reducing it to one as both tests are quite similar
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
      propsData: { businessId: null, tempRegNumber: 'T1234567' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#app-name').text()).toBe('Numbered Amalgamated Company')
    expect(wrapper.find('#app-description').text()).toBe('BC Limited Company Amalgamation Application - Horizontal')
  })

  // Unit test assertions for Vertical amalgamation are pretty much the same except 'displayName'
  // Reducing it to one as both tests are quite similar
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
      propsData: { businessId: 'BC1234567', tempRegNumber: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-legal-name').text()).toBe('Numbered Limited Company')
    expect(wrapper.find('#business-description').text()).toBe('BC Limited Company')
  })
})

describe('Entity Header - HISTORICAL badge', () => {
  const variations = [
    { // variation 0 - active business
      businessState: EntityState.ACTIVE,
      exists: false
    },
    { // variation 1 - business in liquidation
      businessState: EntityState.LIQUIDATION,
      exists: false
    },
    { // variation 2 - historical busines due to unknown reason
      businessState: EntityState.HISTORICAL,
      stateFiling: null,
      exists: true,
      text: 'Unknown Reason'
    },
    { // variation 3 - historical business due to voluntary dissolution
      businessState: EntityState.HISTORICAL,
      stateFiling: {
        header: { name: FilingTypes.DISSOLUTION },
        dissolution: {
          dissolutionDate: '2020-01-01',
          dissolutionType: FilingSubTypes.DISSOLUTION_VOLUNTARY
        }
      },
      exists: true,
      text: 'Voluntary Dissolution – January 1, 2020'
    },
    { // variation 4 - historical company due to involuntary dissolution
      businessState: EntityState.HISTORICAL,
      stateFiling: {
        header: { name: FilingTypes.DISSOLUTION },
        dissolution: {
          dissolutionDate: '2020-01-01',
          dissolutionType: FilingSubTypes.DISSOLUTION_INVOLUNTARY
        }
      },
      exists: true,
      text: 'Involuntary Dissolution – January 1, 2020'
    },
    { // variation 5 - historical company due to amalgamation
      businessState: EntityState.HISTORICAL,
      businessInfo: {
        amalgamatedInto: {
          amalgamationDate: '2024-02-08T00:08:04.188642+00:00',
          identifier: 'BC0871584'
        }
      },
      exists: true,
      text: 'Amalgamation – February 7, 2024 – BC0871584'
    }
  ]

  variations.forEach((_, index) => {
    it(`conditionally displays historical badge - variation #${index}`, async () => {
      // init store
      businessStore.setState(_.businessState as any)
      _.stateFiling && rootStore.setStateFiling(_.stateFiling as any)
      _.businessInfo && businessStore.setBusinessInfo({ ...businessStore.businessInfo, ..._.businessInfo } as any)

      const wrapper = shallowMount(EntityHeader, {
        vuetify,
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
      _.businessInfo && businessStore.setBusinessInfo({ ...businessStore.businessInfo, amalgamatedInto: null })
      wrapper.destroy()
    })
  })
})

describe('Entity Header - LIMITED RESTORATION badge', () => {
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
