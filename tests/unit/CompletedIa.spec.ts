import Vue from 'vue'
import { getVuexStore } from '@/store'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Complete Filing', () => {
  it('Displays expected content with entityName', () => {
    store.state.entityName = 'My Business'
    store.state.identifier = null

    const wrapper = shallowMount(CompletedIa, { store, vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('My Business has been successfully incorporated.')
    expect(paragraphs.at(1).text())
      .toContain('Return to My Business Registry to access your business and file changes.')
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with businessId', () => {
    store.state.entityName = null
    store.state.identifier = 'BC1234567'

    const wrapper = shallowMount(CompletedIa, { store, vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('A Numbered Benefit Company has been successfully incorporated.')
    expect(paragraphs.at(1).text())
      .toContain('Return to My Business Registry to access your business and file changes.')
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })
})
