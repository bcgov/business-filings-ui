import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ConsentContinuationOut from '@/components/Dashboard/FilingHistoryList/filings/ConsentContinuationOut.vue'
import { createPinia, setActivePinia } from 'pinia'

// mock the console.warn function to hide "[Vuetify] The v-expansion-panel component must be used inside a
// v-expansion-panels"
console.warn = jest.fn()

Vue.use(Vuetify)
const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('Display ConsentContinuationOut component', () => {
  it('Displays consentContinuationOut panel', () => {
    const wrapper = mount(ConsentContinuationOut, {
      vuetify,
      propsData: {
        index: 123,
        filing: {
          documentsLink: 'http://localhost/endpoint',
          displayName: '6-Month Consent to Continue Out'
        }
      }
    })
    const vm: any = wrapper.vm

    // verify content
    expect(wrapper.find('.item-header-title').text()).toContain('6-Month Consent to Continue Out')
    expect(wrapper.find('.consent-continuation-out').text())
      .toContain('FILED AND PAID  (filed by  on [unknown])  EFFECTIVE as of [unknown]')
    expect(wrapper.find('.expand-btn').text()).toContain('View Documents')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)
    expect(vm.expiry).toEqual('[unknown]')
    wrapper.destroy()
  })

  it('Displays consentContinuationOut with formatted expiry date', () => {
    const wrapper = mount(ConsentContinuationOut, {
      vuetify,
      propsData: {
        index: 123,
        filing: {
          documentsLink: 'http://localhost/endpoint',
          displayName: '6-Month Consent to Continue Out',
          data: {
            consentContinuationOut: {
              expiry: '2023-08-17T08:00:00.000000+00:00'
            }
          }
        }
      }
    })
    const vm: any = wrapper.vm

    // verify content
    expect(vm.expiry).toEqual('August 17, 2023')
    wrapper.destroy()
  })
})
