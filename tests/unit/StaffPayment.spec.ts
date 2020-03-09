import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { StaffPayment } from '@/components/common'

Vue.use(Vuetify)
// suppress "avoid mutating a prop directly" warnings
// https://vue-test-utils.vuejs.org/api/config.html#silent
Vue.config.silent = true

const vuetify = new Vuetify({})

const PAYMENT_RECEIVED = 0
const NO_FEE = 1

describe('StaffPayment', () => {
  it('initializes correctly with no props', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBeFalsy()
    expect(vm.paymentOption).toBe(PAYMENT_RECEIVED)

    // verify displayed text
    expect(wrapper.find('.payment-container').text()).toContain('Payment')

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('false')

    // verify that component is invalid
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('initializes correctly with Routing Slip Number prop', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { routingSlipNumber: '123456789', isPriority: true }
      })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('123456789')
    expect(vm.isPriority).toBe(true)
    expect(vm.isWaiveFees).toBeFalsy()
    expect(vm.paymentOption).toBe(PAYMENT_RECEIVED)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('false')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('initializes correctly with Is Waive Fees prop', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { isWaiveFees: true }
      })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBe(true)
    expect(vm.paymentOption).toBe(NO_FEE)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('true')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes valid when Routing Slip Number prop becomes valid', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({ routingSlipNumber: '123456789' })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('123456789')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBeFalsy()
    expect(vm.paymentOption).toBe(PAYMENT_RECEIVED)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('false')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes valid when Is Waive Fees prop becomes valid', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({ isWaiveFees: true })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBe(true)
    expect(vm.paymentOption).toBe(NO_FEE)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('true')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes invalid when Routing Slip Number prop becomes invalid', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { routingSlipNumber: '123456789' }
      })

    wrapper.setProps({ routingSlipNumber: '' })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBeFalsy()
    expect(vm.paymentOption).toBe(PAYMENT_RECEIVED)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('false')

    // NB: can't verify error message because Vuetify renders it outside this component

    // verify that component is invalid
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('becomes invalid when Is Waive Fees prop becomes invalid', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { isWaiveFees: true }
      })

    wrapper.setProps({ isWaiveFees: false })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBe(false)
    expect(vm.paymentOption).toBe(PAYMENT_RECEIVED)

    // verify control states
    expect(wrapper.find('#payment-received-radio').attributes()['aria-checked']).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes()['aria-checked']).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes()['aria-checked']).toBe('false')

    // NB: can't verify error message because Vuetify renders it outside this component

    // verify that component is invalid
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })
})
