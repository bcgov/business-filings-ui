import Vue from 'vue'
import Vuetify from 'vuetify'
import { Wrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import { FilingStatus, FilingTypes } from '@/enums'
import AmalgamationFiling from '@/components/Dashboard/FilingHistoryList/filings/AmalgamationFiling.vue'

// mock the console.warn function to hide "[Vuetify] The v-expansion-panel component must be used inside a
// v-expansion-panels"
console.warn = vi.fn()

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Amalgamation Filing', () => {
  let wrapper: Wrapper<AmalgamationFiling>

  beforeAll(() => {
    // init store
    businessStore.setLegalName('MY COMPANY')

    wrapper = mount(AmalgamationFiling, {
      vuetify,
      propsData: {
        filing: {
          comments: [],
          commentsCount: 0,
          commentsLink: null,
          displayName: 'Amalgamation Application - Regular',
          documents: [],
          documentsLink: 'dummy_link',
          data: {},
          effectiveDate: new Date('2021-01-01 08:00:00 GMT'),
          name: FilingTypes.AMALGAMATION_APPLICATION,
          status: FilingStatus.COMPLETED,
          submittedDate: new Date('2021-01-01 08:00:00 GMT'),
          submitter: 'John Doe'
        },
        index: 0
      }
    })
  })

  afterAll(() => {
    wrapper.destroy()
  })

  it('Displays expected content with a valid filing', () => {
    // verify content
    expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Regular')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by John Doe on Jan 1, 2021)')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Jan 1, 2021')

    // FUTURE: expand the panel and verify content
  })
})
