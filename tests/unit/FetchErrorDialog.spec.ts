import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import { FetchErrorDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const rootStore = useRootStore()

describe('FetchErrorDialog', () => {
  it('displays everything for normal users', () => {
    // init store
    rootStore.keycloakRoles = ['']

    const wrapper = shallowMount(FetchErrorDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Fetch Data')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to fetch some data needed for your filing.')
    expect(wrapper.find('#dialog-text').text())
      .toContain('You can return to the Business Dashboard and try again.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-actions').text()).toBe('Return to dashboard')

    wrapper.destroy()
  })

  it('does not display contact info for staff users', () => {
    // init store
    rootStore.keycloakRoles = ['staff']

    const wrapper = shallowMount(FetchErrorDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.findComponent(ContactInfo).exists()).toBe(false)

    wrapper.destroy()
  })
})
