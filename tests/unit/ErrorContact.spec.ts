import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ErrorContact from '@/components/common/ErrorContact.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Error Contact', () => {
  it('Displays expected content', () => {
    const wrapper = mount(ErrorContact, { vuetify })

    // verify content
    const listItems = wrapper.findAll('.contact-container')
    expect(listItems.length).toBe(3)
    expect(listItems.at(0).find('.contact-key').text()).toContain('Canada')
    expect(listItems.at(0).find('.contact-value').text()).toBe('1-877-526-1526')
    expect(listItems.at(1).find('.contact-key').text()).toContain('Victoria')
    expect(listItems.at(1).find('.contact-value').text()).toBe('250-952-0568')
    expect(listItems.at(2).find('.contact-key').text()).toContain('BC Registries')
    expect(listItems.at(2).find('.contact-value').text()).toBe('BCRegistries@gov.bc.ca')

    wrapper.destroy()
  })
})
