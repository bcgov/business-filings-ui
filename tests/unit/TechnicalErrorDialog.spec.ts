import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import TechnicalErrorDialog from '@/components/dialogs/TechnicalErrorDialog.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

describe('TechnicalErrorDialog', () => {
  it('displays everything for normal users', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['']

    const wrapper = mount(TechnicalErrorDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.find('.v-card__title').text()).toBe('Error')
    expect(wrapper.find('.v-card__text').text())
      .toContain('We could not process your action due to a technical issue.')
    expect(wrapper.find('.v-card__text').text())
      .toContain('If this error persists, please contact BC Registries staff:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.v-card__actions').text()).toBe('Close')

    wrapper.destroy()
  })

  it('does not display contact info for staff users', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['staff']

    const wrapper = mount(TechnicalErrorDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.findComponent(ContactInfo).exists()).toBe(false)

    wrapper.destroy()
  })
})
