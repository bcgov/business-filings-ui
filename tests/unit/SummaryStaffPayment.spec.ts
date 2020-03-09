import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { SummaryStaffPayment } from '@/components/common'

Vue.use(Vuetify)
// suppress "avoid mutating a prop directly" warnings
// https://vue-test-utils.vuejs.org/api/config.html#silent
Vue.config.silent = true

const vuetify = new Vuetify({})

describe('SummaryStaffPayment', () => {
  it('initializes correctly with no props', async () => {
    const wrapper = mount(SummaryStaffPayment, { vuetify })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBeFalsy()

    // verify displayed text
    expect(wrapper.find('.payment-container').text()).toBe('Payment')
    expect(wrapper.find('.value.payment-received').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    wrapper.destroy()
  })

  it('initializes correctly with Routing Slip Number prop', async () => {
    const wrapper = mount(SummaryStaffPayment,
      {
        vuetify,
        propsData: {
          routingSlipNumber: '123456789'
        }
      })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('123456789')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBeFalsy()

    // verify displayed text
    expect(wrapper.find('.value.payment-received').text()).toBe('Routing Slip Number: 123456789')
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    wrapper.destroy()
  })

  it('initializes correctly with Routing Slip Number and Priority props', async () => {
    const wrapper = mount(SummaryStaffPayment,
      {
        vuetify,
        propsData: {
          routingSlipNumber: '123456789',
          isPriority: true
        }
      })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('123456789')
    expect(vm.isPriority).toBe(true)
    expect(vm.isWaiveFees).toBeFalsy()

    // verify displayed text
    expect(wrapper.find('.value.payment-received').text()).toBe('Routing Slip Number: 123456789 Priority')
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    wrapper.destroy()
  })

  it('initializes correctly with Is Waive Fees prop', async () => {
    const wrapper = mount(SummaryStaffPayment,
      {
        vuetify,
        propsData: {
          isWaiveFees: true
        }
      })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.routingSlipNumber).toBe('')
    expect(vm.isPriority).toBeFalsy()
    expect(vm.isWaiveFees).toBe(true)

    // verify displayed text
    expect(wrapper.find('.value.payment-received').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').text()).toBe('No Fee')

    wrapper.destroy()
  })
})
