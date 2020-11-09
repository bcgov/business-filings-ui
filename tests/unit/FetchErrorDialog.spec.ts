import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { FetchErrorDialog } from '@/components/dialogs'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const store = getVuexStore()

describe('FetchErrorDialog', () => {
  it('displays everything for normal users', () => {
    // init store
    store.state.keycloakRoles = ['']

    const wrapper = shallowMount(FetchErrorDialog, { propsData: { dialog: true }, store, vuetify })

    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Fetch Data')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to fetch some data needed for your filing.')
    expect(wrapper.find('#dialog-text').text())
      .toContain('You can return to the Business Dashboard and try again.')
    expect(wrapper.find('#dialog-contact').exists()).toBe(true)
    expect(wrapper.find('#dialog-actions').text()).toBe('Return to dashboard')

    wrapper.destroy()
  })

  it('does not display contact info for staff users', () => {
    // init store
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(FetchErrorDialog, { propsData: { dialog: true }, store, vuetify })

    expect(wrapper.find('#dialog-contact').exists()).toBe(false)

    wrapper.destroy()
  })
})
