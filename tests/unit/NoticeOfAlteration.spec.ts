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
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('Alteration documents are only available')
    expect(paragraphs.at(1).text()).toContain('To request copies of paper documents,')
    expect(paragraphs.at(2).text()).toContain('If you have questions, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
