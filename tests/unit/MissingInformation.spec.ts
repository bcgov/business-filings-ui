import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Missing Information component', () => {
  it('Displays expansion panel closed', () => {
    const wrapper = mount(MissingInformation, { store, vuetify })

    // verify content
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('.details-btn').text()).toBe('View Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays expansion panel open', async () => {
    const wrapper = mount(MissingInformation, { store, vuetify })

    // click the button
    wrapper.find('.details-btn').trigger('click')
    await Vue.nextTick()

    // verify content
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(true)
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('BC Registries is missing')
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('If further action is required')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
