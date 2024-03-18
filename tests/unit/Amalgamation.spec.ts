import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import Alerts from '@/components/Dashboard/Alerts.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Amalgamation alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = true
    businessStore.$state.businessInfo.warnings = [
      {
        code: null,
        message: null,
        warningType: 'FUTURE_EFFECTIVE_AMALGAMATION',
        data: { amalgamationDate: '2024-01-31T08:00:00+00:00' }
      }
    ]
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('amalgamation-panel')
    expect(wrapper.find('h3').text()).toContain('This corporation is part of an amalgamation')
    expect(wrapper.find('h3').text()).toContain('historical on January 31, 2024')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('amalgamation-panel')
    expect(wrapper.find('h3').text()).toContain('This corporation is part of an amalgamation')
    expect(wrapper.find('h3').text()).toContain('historical on January 31, 2024')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content p').text()).toContain('If you have any questions')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
