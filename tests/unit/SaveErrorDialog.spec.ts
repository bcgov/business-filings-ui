import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import { SaveErrorDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Save Error Dialog', () => {
  it('displays generic message for normal users', async () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(SaveErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        vuetify
      })
    await Vue.nextTick()

    expect(wrapper.attributes('contentclass')).toBe('save-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Save FILING')
    expect(wrapper.find('#dialog-text').text()).toContain('We were unable to save your FILING.')
    expect(wrapper.find('#dialog-text').text()).toContain('If you exit this FILING,')
    expect(wrapper.find('#dialog-text').text()).toContain('If this error persists, please contact us:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-exit-button')).toBeDefined()
    expect(wrapper.find('#dialog-retry-button')).toBeDefined()

    wrapper.destroy()
  })

  it('displays generic message for staff', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['staff']

    const wrapper = shallowMount(SaveErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Save FILING')
    expect(wrapper.find('#dialog-text').text()).toContain('We were unable to save your FILING.')
    expect(wrapper.find('#dialog-text').text()).toContain('If you exit this FILING,')
    expect(wrapper.find('#dialog-text').text()).not.toContain('If this error persists, please contact us:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(false)
    expect(wrapper.find('#dialog-exit-button')).toBeDefined()
    expect(wrapper.find('#dialog-retry-button')).toBeDefined()

    wrapper.destroy()
  })

  it('displays errors', () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(SaveErrorDialog,
      {
        propsData: {
          dialog: true,
          errors: [{ error: 'error msg' }]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numErrors).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Save Filing')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to save your Filing due to the following errors:')
    expect(wrapper.find('#dialog-text').text()).toContain('error msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('displays warnings', () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(SaveErrorDialog,
      {
        propsData: {
          dialog: true,
          warnings: [{ warning: 'warning msg' }]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numWarnings).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Filing Saved with Warnings')
    expect(wrapper.find('#dialog-text').text()).toContain('Please note the following warnings:')
    expect(wrapper.find('#dialog-text').text()).toContain('warning msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('emits an event when Exit button is clicked', async () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = mount(SaveErrorDialog,
      {
        vuetify,
        propsData: { dialog: true }
      })

    expect(wrapper.emitted('exit')).toBeUndefined()

    // verify and click Exit button
    const exitButton = wrapper.find('#dialog-exit-button')
    expect(exitButton.text()).toBe('Return to Filing')
    await exitButton.trigger('click')
    await Vue.nextTick() // need to wait longer here

    expect(wrapper.emitted('exit').length).toBe(1)

    wrapper.destroy()
  })
})
