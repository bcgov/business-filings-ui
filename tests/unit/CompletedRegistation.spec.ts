import Vue from 'vue'
import { getVuexStore } from '@/store'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import CompletedRegistration from '@/components/Dashboard/FilingHistoryList/CompletedRegistration.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Complete Filing', () => {
  it('Displays expected content with entityName', () => {
    store.state.business.legalName = 'My Firm'

    const wrapper = shallowMount(CompletedRegistration, { store, vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Registration Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('My Firm has been successfully registered.')
    expect(paragraphs.at(1).text())
      .toContain('Return to My Business Registry to access your business and file changes.')
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })
})
