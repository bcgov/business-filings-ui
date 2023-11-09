import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import AgmExtensionHelp from '@/components/AgmExtension/AgmExtensionHelp.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('AgmExtensionHelp', () => {
  it('displays normally', () => {
    const wrapper = shallowMount(AgmExtensionHelp, { vuetify })

    expect(wrapper.find('.agm-extension-help').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toBe('AGM Extension Help')

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.at(0).text()).toContain('A company must have an')
    expect(paragraphs.at(1).text()).toContain('Shareholders entitled to')
    expect(paragraphs.at(2).text()).toContain('If a company does not')

    wrapper.destroy()
  })
})
