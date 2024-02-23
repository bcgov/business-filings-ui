import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import { NotEligibleExtensionDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

describe('NotEligibleExtensionDialog', () => {
  it('displays everything for normal users', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['']

    const wrapper = mount(NotEligibleExtensionDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.find('#dialog-title').text()).toBe('Not Eligible for Extension')
    expect(wrapper.find('.v-card__text').text()).toContain('Based on the information provided')
    expect(wrapper.find('.v-card__text').text()).toContain('If you have any questions about')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-ok-btn').text()).toBe('OK')

    wrapper.destroy()
  })

  it('does not display contact info for staff users', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['staff']

    const wrapper = mount(NotEligibleExtensionDialog, { propsData: { dialog: true }, vuetify })

    expect(wrapper.findComponent(ContactInfo).exists()).toBe(false)

    wrapper.destroy()
  })
})
