/* eslint max-len: 0 */
import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ActionRequired from '@/components/Dashboard/TodoList/ActionRequired.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('ActionRequired', () => {
  it('Displays ActionRequired', () => {
    const wrapper = mount(ActionRequired, {
      vuetify

    })

    // verify content
    expect(wrapper.find('h3').text()).toBe('Action Required')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(1)
    expect(paragraphs.at(0).text()).toContain('BC Registries is missing information about your business')

    wrapper.destroy()
  })

  it('Displays contact information on button click', async () => {
    const wrapper = mount(ActionRequired, {
      vuetify

    })
    const paragraphs1 = wrapper.findAll('p')
    expect(paragraphs1.length).toBe(1)
    expect(wrapper.find(ContactInfo).exists()).toBe(false)

    // click the view button
    await wrapper.find('.details-btn').trigger('click')
    await Vue.nextTick()

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(1).text()).toContain('BC Registries Contact Information')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
