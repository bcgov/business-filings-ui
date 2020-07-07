import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ColinFiling from '@/components/Dashboard/ColinFiling.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Colin Filing', () => {
  it('Displays expected content', () => {
    const wrapper = mount(ColinFiling, { vuetify })

    // verify content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('Documents for this filing are')
    expect(paragraphs.at(1).text()).toContain('If you do not have access to')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
