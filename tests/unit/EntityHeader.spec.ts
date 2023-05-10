import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import mockRouter from './mockRouter'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Entity Header - data', () => {
  const router = mockRouter.mock()

  it('handles empty data', async () => {
    // set store properties
    store.commit('setLegalName', null)
    store.commit('setLegalType', null)
    store.state.entityStatus = null

    const wrapper = shallowMount(EntityHeader, {
      store,
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
    store.commit('setLegalName', 'My Business')
    store.commit('setGoodStanding', true)
    store.commit('setLegalType', 'CP')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityHeader, {
      store,
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
    store.commit('setLegalName', 'My Named Company')
    store.state.entityStatus = 'DRAFT_APP'
    store.commit('setLegalType', 'BEN')

    const wrapper = shallowMount(EntityHeader, {
      store,
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
    store.commit('setLegalName', null)
    store.state.entityStatus = 'DRAFT_APP'
    store.commit('setLegalType', 'BEN')

    const wrapper = shallowMount(EntityHeader, {
      store,
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
    store.commit('setLegalName', 'My Future Company')
    store.state.entityStatus = 'FILED_APP'
    store.commit('setLegalType', 'BEN')

    const wrapper = shallowMount(EntityHeader, {
      store,
      vuetify,
      router,
      propsData: { businessId: null, tempRegNumber: 'T123456789' }
    })
    await Vue.nextTick()

    expect(wrapper.find('#ia-reg-name').text()).toBe('My Future Company')
    expect(wrapper.find('#ia-reg-description').text()).toBe('BC Benefit Company Incorporation Application')
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
      store.state.stateFiling = _.stateFiling

      const wrapper = shallowMount(EntityHeader, {
        store,
        vuetify,
        router,
        propsData: { businessId: 'BC1234567', tempRegNumber: null }
      })
      await Vue.nextTick()

      expect(wrapper.find('#limited-restoration').exists()).toBe(_.exists)
      if (_.exists) {
        expect(wrapper.find('#limited-restoration').text()).toContain('Active until')
        expect(wrapper.find('#limited-restoration').text()).toContain('LIMITED RESTORATION')
      }

      // cleanup
      store.state.stateFiling = null
      wrapper.destroy()
    })
  })
})

describe('Entity Header - AUTHORIZED TO CONTINUE OUT badge', () => {
  const router = mockRouter.mock()

  const variations = [
    {
      currentDate: '2023-11-09',
      filing: {
        data: {
          consentContinuationOut: {
            expiry: '2023-11-09T08:00:00+00:00'
          }
        }
      },
      exists: true
    },
    {
      currentDate: '2023-05-09',
      filing: {
        data: {
          consentContinuationOut: {
            expiry: '2023-11-09T08:00:00+00:00'
          }
        }
      },
      exists: true
    },
    {
      currentDate: '2023-05-09',
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
      store.state.currentDate = _.currentDate
      store.state.filingHistoryList.filings.push(_.filing)

      const wrapper = shallowMount(EntityHeader, {
        store,
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
      store.state.currentDate = null
      store.state.filingHistoryList.filings.pop()
      wrapper.destroy()
    })
  })
})
