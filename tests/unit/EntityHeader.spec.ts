import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import mockRouter from './mockRouter'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { EntityStatus } from '@/enums'

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
    expect(wrapper.find('#ia-reg-description').exists()).toBe(false)
  })

  it('displays Business entity info properly', async () => {
    // set store properties
    businessStore.setLegalName('My Business')
    businessStore.setOperatingName('My Business')
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
    expect(wrapper.find('#ia-reg-description').exists()).toBe(false)
  })

  it('displays Draft Incorp App entity info properly - Named Company', async () => {
    // set store properties
    businessStore.setLegalName('My Named Company')
    rootStore.entityStatus = EntityStatus.DRAFT_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#ia-reg-name').text()).toBe('My Named Company')
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
  })

  it('displays Draft Incorp App entity info properly - Numbered Company', async () => {
    // set store properties
    businessStore.setLegalName(null)
    rootStore.entityStatus = EntityStatus.DRAFT_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#ia-reg-name').text()).toBe('Numbered Benefit Company')
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
  })

  it('displays Paid (Named) Incorp App entity info properly', async () => {
    // set store properties
    businessStore.setLegalName('My Future Company')
    rootStore.entityStatus = EntityStatus.FILED_APP
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)

    const wrapper = shallowMount(EntityHeader, {
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#ia-reg-name').text()).toBe('My Future Company')
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
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
