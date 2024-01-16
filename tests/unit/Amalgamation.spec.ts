import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import Amalgamation from '@/components/Dashboard/Alerts/Amalgamation.vue'
import { ContactInfo } from '@/components/common'
import flushPromises from 'flush-promises'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Amalgamation component', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.warnings = [
      {
        code: 'AMALGAMATING_BUSINESS',
        message: 'This business is part of a future effective amalgamation.',
        warningType: 'FUTURE_EFFECTIVE_AMALGAMATION',
        data: {
          amalgamationDate: '2024-01-31T08:00:00+00:00'
        }
      }
    ]
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Amalgamation, { vuetify })

    // verify content
    expect(wrapper.find('h3').text()).toContain('This corporation is part of an amalgamation')
    expect(wrapper.find('h3').text()).toContain('January 31, 2024')
    expect(wrapper.find('.details-btn').text()).toBe('View Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays expansion panel open', async () => {
    const wrapper = mount(Amalgamation, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')
    await flushPromises() // wait for expansion transition

    // verify content
    expect(wrapper.find('h3').text()).toContain('This corporation is part of an amalgamation')
    expect(wrapper.find('h3').text()).toContain('January 31, 2024')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(true)
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('If you have any questions')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  // FUTURE: add a text to verify hidePhoneNumbers()
})
