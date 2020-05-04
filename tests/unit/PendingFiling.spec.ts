import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PendingFiling from '@/components/Dashboard/PendingFiling.vue'
import ErrorContact from '@/components/common/ErrorContact.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Pending Filing', () => {
  it('Displays expected content with no filing', () => {
    const wrapper = mount(PendingFiling, { vuetify })

    // verify content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This filing is paid')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ErrorContact).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PendingFiling, { vuetify,
      propsData: { title: 'Incorporation Application' }
    })

    // verify content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This Incorporation Application is')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ErrorContact).exists()).toBe(true)

    wrapper.destroy()
  })
})
