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

describe('Regular amalgamation Filing', () => {
  let wrapper: Wrapper<AmalgamationFiling>

  beforeAll(() => {
    // init store
    businessStore.setLegalName('MY COMPANY')

    // ensure tempRegNumber doesn't exist
    sessionStorage.setItem('TEMP_REG_NUMBER', null)

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

  it('Displays expected content with a valid filing', async () => {
    // verify content
    expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Regular')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by John Doe on Jan 1, 2021)')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Jan 1, 2021')
    expect(wrapper.find('.view-details').text()).toBe('View Documents')
    expect(wrapper.find('.hide-details').text()).toBe('Hide Documents')

    await wrapper.find('.view-details').trigger('click')
    expect(wrapper.find('.completed-amalgamation-details').exists()).toBe(true)
    expect(wrapper.find('h4').text()).toBe('Amalgamation Complete')
    expect(wrapper.find('p').text()).toBe('MY COMPANY has been successfully amalgamated.')

    wrapper.destroy()
  })
})

// Unit test assertions for Vertical amalgamation are pretty much the same except 'displayName'
// Reducing it to one as both tests are quite similar
describe('Horizontal amalgamation Filing', () => {
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
          displayName: 'Amalgamation Application - Horizontal',
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

  it('Displays expected content with a valid filing', async () => {
    // verify content
    expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Horizontal')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by John Doe on Jan 1, 2021)')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Jan 1, 2021')
    expect(wrapper.find('.view-details').text()).toBe('View Documents')
    expect(wrapper.find('.hide-details').text()).toBe('Hide Documents')

    await wrapper.find('.view-details').trigger('click')
    expect(wrapper.find('.completed-amalgamation-details').exists()).toBe(true)
    expect(wrapper.find('h4').text()).toBe('Amalgamation Complete')
    expect(wrapper.find('p').text()).toBe('MY COMPANY has been successfully amalgamated.')

    wrapper.destroy()
  })
})
