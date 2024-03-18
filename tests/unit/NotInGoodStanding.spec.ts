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

describe('Not In Good Standing alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = false
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('not-in-good-standing-panel')
    expect(wrapper.find('h3').text()).toBe('This business is not in good standing')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('not-in-good-standing-panel')
    expect(wrapper.find('h3').text()).toBe('This business is not in good standing')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(0).text()).toContain('The most common reason a')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(1).text()).toContain('If further action is required')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
