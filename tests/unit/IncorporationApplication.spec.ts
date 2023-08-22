import Vue from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import IncorporationApplication from '@/components/Dashboard/FilingHistoryList/filings/IncorporationApplication.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe.skip('Incorporation Application Filing', () => {
  it('Displays expected content with entityName', () => {
    businessStore.setLegalName('My Business')
    businessStore.setIdentifier(null)

    const wrapper = shallowMount(IncorporationApplication, { vuetify })

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
    businessStore.setLegalName(null)
    businessStore.setIdentifier('BC1234567')

    const wrapper = shallowMount(IncorporationApplication, { vuetify })

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
