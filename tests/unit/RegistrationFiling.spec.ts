import Vue from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores/businessStore'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import RegistrationFiling from '@/components/Dashboard/FilingHistoryList/filings/RegistrationFiling.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

xdescribe('Registration Filing', () => {
  it('Displays expected content with entityName', () => {
    businessStore.setLegalName('My Firm')

    const wrapper = shallowMount(RegistrationFiling, { vuetify })

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
