import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import { PaymentErrorDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Payment Error Dialog', () => {
  it('displays generic message for normal users', async () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        vuetify
      })
    await Vue.nextTick()

    expect(wrapper.attributes('contentclass')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.find('#dialog-text').text()).toContain('We are unable to process your payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This FILING has been')
    expect(wrapper.find('#dialog-text').text()).toContain('PayBC is normally available')
    expect(wrapper.find('#dialog-text').text()).toContain('If this error persists')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays generic message for staff', () => {
    // init store
    authenticationStore.getCurrentUser.roles = ['staff']

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          filingName: 'FILING',
          dialog: true
        },
        vuetify
      })

    expect(wrapper.attributes('contentclass')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.find('#dialog-text').text()).toContain('We are unable to process your payment')
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays errors', () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          errors: [{ message: 'error msg' }]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numErrors).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This Filing has been')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to process your payment due to the following errors:')
    expect(wrapper.find('#dialog-text').text()).toContain('error msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('displays warnings', () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          warnings: [{ message: 'warning msg' }]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numWarnings).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This Filing has been')
    expect(wrapper.find('#dialog-text').text()).toContain('Please note the following warnings:')
    expect(wrapper.find('#dialog-text').text()).toContain('warning msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    wrapper.destroy()
  })

  it('emits an event when Exit button is clicked', async () => {
    // init store
    authenticationStore.getCurrentUser.roles = []

    const wrapper = mount(PaymentErrorDialog,
      {
        vuetify,
        propsData: { dialog: true }
      })

    expect(wrapper.emitted('exit')).toBeUndefined()

    // verify and click Exit button
    const exitButton = wrapper.find('#dialog-exit-button')
    expect(exitButton.text()).toBe('Back to My Dashboard')
    await exitButton.trigger('click')
    await Vue.nextTick() // need to wait longer here

    expect(wrapper.emitted('exit').length).toBe(1)

    wrapper.destroy()
  })

  it('renders error messages correctly when they are present', () => {
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          errors: [{ message: 'error msg' }]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numErrors).toBe(1)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.find('#dialog-text').text()).toContain('This Filing has been')
    expect(wrapper.find('#dialog-text').text())
      .toContain('We were unable to process your payment due to the following errors:')
    expect(wrapper.find('#dialog-text').text()).toContain('error msg')
    expect(wrapper.find('#dialog-ok-button')).toBeDefined()

    expect(wrapper.isVisible()).toBe(true)

    expect(wrapper.findAll('p').length).toBe(3)
    expect(wrapper.findAll('p').at(0).text()).toContain('We are unable to process your payment')
    expect(wrapper.findAll('p').at(1).text()).toContain(
      'We were unable to process your payment due to the following errors:'
    )
    expect(wrapper.findAll('p').at(2).text()).toContain('If this error persists')
    expect(wrapper.findAll('li').length).toBe(0)
    expect(wrapper.findAll('span').length).toBe(2)
    expect(wrapper.findAll('span').at(1).text()).toContain('error msg')

    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('renders warning messages correctly when they are present', () => {
    authenticationStore.getCurrentUser.roles = []

    const wrapper = shallowMount(PaymentErrorDialog,
      {
        propsData: {
          dialog: true,
          warnings: [
            { message: 'Test Warning 1' },
            { message: 'Test Warning 2' }
          ]
        },
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.numWarnings).toBe(2)

    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.findAll('p').length).toBe(3)
    expect(wrapper.findAll('p').at(0).text()).toContain('We are unable to process your payment')
    expect(wrapper.findAll('p').at(1).text()).toContain('Please note the following warnings')
    expect(wrapper.findAll('li').length).toBe(0)
    expect(wrapper.findAll('span').length).toBe(4)
    expect(wrapper.findAll('span').at(1).text()).toContain('Test Warning 1')
    expect(wrapper.findAll('span').at(3).text()).toContain('Test Warning 2')
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)
    expect(wrapper.find('#dialog-okay-button').exists()).toBe(false)

    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })
})
