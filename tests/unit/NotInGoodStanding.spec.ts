import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import NotInGoodStanding from '@/components/Dashboard/Alerts/NotInGoodStanding.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('Not In Good Standing component', () => {
  it('Displays expansion panel closed', () => {
    const wrapper = mount(NotInGoodStanding, { vuetify })

    // verify content
    expect(wrapper.find('h3').text()).toBe('This business is not in good standing')
    expect(wrapper.find('.details-btn').text()).toBe('View Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays expansion panel open', async () => {
    const wrapper = mount(NotInGoodStanding, { vuetify })

    // click the button
    wrapper.find('.details-btn').trigger('click')
    await Vue.nextTick()

    // verify content
    expect(wrapper.find('h3').text()).toBe('This business is not in good standing')
    expect(wrapper.find('.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content').exists()).toBe(true)
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('The most common reason a')
    expect(wrapper.find('.v-expansion-panel-content__wrap').text()).toContain('If further action is required')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
