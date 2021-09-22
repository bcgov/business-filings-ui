import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount, mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { PaymentErrorDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Payment Error Dialog', () => {
  it('displays generic message for normal users', () => {
    // init store
    store.state.keycloakRoles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        store,
        vuetify
      })

    expect(wrapper.attributes('content-class')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to process payment')
    expect(wrapper.find('#dialog-text').text()).toContain('We are unable to process your payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This FILING has been')
    expect(wrapper.find('#dialog-text').text()).toContain('PayBC is normally available')
    expect(wrapper.find('#dialog-text').text()).toContain('If this error persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays generic message for staff', () => {
    // init store
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        store,
        vuetify
      })

    expect(wrapper.attributes('content-class')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to process payment')
    expect(wrapper.find('#dialog-text').text()).toContain('We are unable to process your payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This FILING has been')
    expect(wrapper.find('#dialog-text').text()).not.toContain('PayBC is normally available')
    expect(wrapper.find('#dialog-text').text()).not.toContain('If this error persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(false)
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays errors', () => {
    // init store
    store.state.keycloakRoles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          errors: [{ message: 'error msg' }]
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numErrors).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to process payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This Filing has been')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to process your payment due to the following errors:')
    expect(wrapper.find('#dialog-text').text()).toContain('error msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('displays warnings', () => {
    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          warnings: [{ message: 'warning msg' }]
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numWarnings).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to process payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This Filing has been')
    expect(wrapper.find('#dialog-text').text()).toContain('Please note the following warnings:')
    expect(wrapper.find('#dialog-text').text()).toContain('warning msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('emits an event when Exit button is clicked', async () => {
    // init store
    store.state.keycloakRoles = []

    const wrapper = mount(PaymentErrorDialog,
      {
        vuetify,
        store,
        propsData: { dialog: true }
      })

    expect(wrapper.emitted('exit')).toBeUndefined()

    // verify and click Exit button
    const exitButton = wrapper.find('#dialog-exit-button')
    expect(exitButton.text()).toBe('Back to My Dashboard')
    exitButton.trigger('click')
    await Vue.nextTick()

    expect(wrapper.emitted('exit').length).toBe(1)

    wrapper.destroy()
  })
})
