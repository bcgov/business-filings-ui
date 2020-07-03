import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import NoticeOfAlteration from '@/components/Dashboard/NoticeOfAlteration.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Notice of Alteration Filing', () => {
  it('Displays expected content', () => {
    const wrapper = mount(NoticeOfAlteration, { vuetify })

    // verify content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(1)
    expect(paragraphs.at(0).text()).toContain('Notice of Alteration documents are')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
