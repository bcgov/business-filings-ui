import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { StaffPaymentDialog } from '@/components/dialogs'
import { StaffPayment } from '@bcrs-shared-components/staff-payment'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('StaffPaymentDialog', () => {
  it('initializes correctly', async () => {
    const wrapper = mount(StaffPaymentDialog, {
      vuetify,
      propsData: {
        dialog: true
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.v-card__title div').text()).toBe('Staff Payment')
    expect(wrapper.find(StaffPayment).exists()).toBe(true)
    expect(wrapper.find('#dialog-close-button').text()).toBe('Exit Payment')
    expect(wrapper.find('#dialog-submit-button').text()).toBe('Submit')

    // verify states
    const vm = wrapper.vm as any
    expect(vm.validate).toBe(false)
    expect(vm.staffPaymentFormValid).toBe(true) // no errors yet

    wrapper.destroy()
  })

  it('handles Exit button correctly', async () => {
    const wrapper = mount(StaffPaymentDialog, {
      vuetify,
      propsData: {
        dialog: true,
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789',
          isPriority: true
        }
      },
      // NB: stub the Staff Payment component to avoid nested event errors
      stubs: { StaffPayment: true }
    })
    await Vue.nextTick()

    // set form valid since the Staff Payment component is stubbed
    wrapper.setData({ staffPaymentFormValid: true })

    // click the Exit button
    await wrapper.find('#dialog-close-button').trigger('click')

    // verify emitted event
    expect(wrapper.emitted('exit').pop()).toEqual([])

    wrapper.destroy()
  })

  it('handles Submit button correctly', async () => {
    const wrapper = mount(StaffPaymentDialog, {
      vuetify,
      propsData: {
        dialog: true,
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789',
          isPriority: true
        }
      },
      // NB: stub the Staff Payment component to avoid nested event errors
      stubs: { StaffPayment: true }
    })
    await Vue.nextTick()

    // set form valid since the Staff Payment component is stubbed
    wrapper.setData({ staffPaymentFormValid: true })

    // click the Submit button
    await wrapper.find('#dialog-submit-button').trigger('click')

    // wait for validation
    await Vue.nextTick()

    // verify emitted event
    expect(wrapper.emitted('submit').pop()).toEqual([])

    wrapper.destroy()
  })
})
