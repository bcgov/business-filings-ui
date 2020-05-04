import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaperFiling from '@/components/Dashboard/PaperFiling.vue'
import ErrorContact from '@/components/common/ErrorContact.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Paper Filing', () => {
  it('Displays expected content', () => {
    const wrapper = mount(PaperFiling, { vuetify })

    // verify content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('Filings completed')
    expect(paragraphs.at(1).text()).toContain('To request copies')
    expect(wrapper.find(ErrorContact).exists()).toBe(true)

    wrapper.destroy()
  })
})
