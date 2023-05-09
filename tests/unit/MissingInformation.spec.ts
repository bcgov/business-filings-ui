import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import { ContactInfo } from '@/components/common'
import flushPromises from 'flush-promises'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('Missing Information component', () => {
  it('Displays expansion panel closed', () => {
    const wrapper = mount(MissingInformation, { vuetify })

    // verify content
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('.details-btn').text()).toBe('View Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays expansion panel open', async () => {
    const wrapper = mount(MissingInformation, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')
    await flushPromises() // wait for expansion transition

    // verify content
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(true)
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('BC Registries is missing')
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('If further action is required')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
