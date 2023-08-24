import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ContinuationOut from '@/components/Dashboard/FilingHistoryList/filings/ContinuationOut.vue'
import { createPinia, setActivePinia } from 'pinia'

// mock the console.warn function to hide "[Vuetify] The v-expansion-panel component must be used inside a
// v-expansion-panels"
console.warn = vi.fn()

Vue.use(Vuetify)
const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('Display ContinuationOut component', () => {
  it('Displays ContinuationOut panel', () => {
    const wrapper = mount(ContinuationOut, {
      vuetify,
      propsData: {
        index: 123,
        filing: {
          documentsLink: 'http://localhost/endpoint',
          displayName: 'Continuation Out',
          data: {
            continuationOut: {
              continuationOutDate: '2023-06-10',
              details: 'Line 1\nLine 2\nLine 3',
              foreignJurisdiction: {
                country: 'CA',
                region: 'AB'
              },
              legalName: 'North Shore Toys LTD.'
            }
          }
        }
      }
    })
    const vm: any = wrapper.vm

    // verify content
    expect(wrapper.find('.item-header-title').text()).toContain('Continuation Out')
    expect(wrapper.find('.continuation-out').text()).toContain('FILED AND PAID  (filed by  on [unknown])')
    expect(wrapper.find('.continuation-out').text()).toContain('EFFECTIVE as of [unknown]')
    expect(wrapper.find('.expand-btn').text()).toContain('View Documents')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)
    expect(vm.continuationOutDate).toEqual('Jun 10, 2023')
    expect(vm.legalName).toBe('North Shore Toys LTD.')
    wrapper.destroy()
  })
})
