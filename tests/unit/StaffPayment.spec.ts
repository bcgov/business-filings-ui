import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { StaffPayment } from '@/components/common'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('StaffPayment', () => {
  it('initializes correctly with no props', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.staffPaymentData.option).toBeNaN()
    expect(vm.staffPaymentData.routingSlipNumber).toBeNull()
    expect(vm.staffPaymentData.bcolAccountNumber).toBeNull()
    expect(vm.staffPaymentData.datNumber).toBeNull()
    expect(vm.staffPaymentData.folioNumber).toBeNull()
    expect(vm.staffPaymentData.isPriority).toBe(false)

    // verify displayed elements
    expect(wrapper.find('.payment-container label').text()).toBe('Payment')

    // verify control states
    expect(wrapper.find('#fas-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#priority-checkbox').attributes('aria-checked')).toBe('false')

    // verify that component is not valid
    const valid = vm.fasFormValid || vm.bcolFormValid || (vm.staffPaymentData.option === 0)
    expect(valid).toBe(false)

    wrapper.destroy()
  })

  it('displays correctly with FAS option and Priority', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789',
          isPriority: true
        }
      }
    })
    await Vue.nextTick()

    // verify control states
    expect(wrapper.find('#fas-radio').attributes('aria-checked')).toBe('true')
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#priority-checkbox').attributes('aria-checked')).toBe('true')

    // verify displayed elements
    expect((wrapper.find('#routing-slip-number-textfield').element as HTMLInputElement).value).toBe('123456789')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('displays correctly with BCOL option, Folio Number and Priority', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 2, // BCOL
          bcolAccountNumber: '123456',
          datNumber: 'C1234567',
          folioNumber: '123ABCabc',
          isPriority: true
        }
      }
    })
    await Vue.nextTick()

    // verify control states
    expect(wrapper.find('#fas-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('true')
    expect(wrapper.find('#no-fee-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#priority-checkbox').attributes('aria-checked')).toBe('true')

    // verify displayed elements
    expect((wrapper.find('#bcol-account-number-textfield').element as HTMLInputElement).value).toBe('123456')
    expect((wrapper.find('#dat-number-textfield').element as HTMLInputElement).value).toBe('C1234567')
    expect((wrapper.find('#folio-number-textfield').element as HTMLInputElement).value).toBe('123ABCabc')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('displays correctly with No Fee option', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 0 // NO_FEE
        }
      }
    })
    await Vue.nextTick()

    // verify control states
    expect(wrapper.find('#fas-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('#no-fee-radio').attributes('aria-checked')).toBe('true')
    expect(wrapper.find('#priority-checkbox').attributes('aria-checked')).toBe('false')

    // verify that component is valid
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  // FUTURE
  // see https://vue-test-utils.vuejs.org/api/wrapper/#trigger
  xit('sets FAS radio button when Routing Slip Number input is focused', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#routing-slip-number-textfield').trigger('focus')

    // verify that radio button is checked
    expect(wrapper.find('#fas-radio').attributes('aria-checked')).toBe('true')

    wrapper.destroy()
  })

  // FUTURE
  xit('sets BCOL radio button when BC Online Account Number input is focused', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#bcol-account-number-textfield').trigger('focus')

    // verify that radio button is checked
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('true')

    wrapper.destroy()
  })

  // FUTURE
  xit('sets BCOL radio button when DAT Number input is focused', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#dat-number-textfield').trigger('focus')

    // verify that radio button is checked
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('true')

    wrapper.destroy()
  })

  // FUTURE
  xit('sets BCOL radio button when Folio Number input is focused', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#folio-number-textfield').trigger('focus')

    // verify that radio button is checked
    expect(wrapper.find('#bcol-radio').attributes('aria-checked')).toBe('true')

    wrapper.destroy()
  })

  it('sets disabled text fields when FAS radio button is clicked', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#fas-radio').trigger('click')

    // FAS text field should be enabled; BCOL text fields should be disabled
    expect(wrapper.find('#routing-slip-number-textfield').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('#bcol-account-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#dat-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#folio-number-textfield').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('sets disabled text fields when BCOL radio button is clicked', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#bcol-radio').trigger('click')

    // FAS text field should be disabled; BCOL text fields should be enabled
    expect(wrapper.find('#routing-slip-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#bcol-account-number-textfield').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('#dat-number-textfield').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('#folio-number-textfield').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('sets disabled text fields when No Fee is clicked', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await wrapper.find('#no-fee-radio').trigger('click')

    // FAS and BCOL text fields should be disabled
    expect(wrapper.find('#routing-slip-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#bcol-account-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#dat-number-textfield').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#folio-number-textfield').attributes('disabled')).toBe('disabled')

    wrapper.destroy()
  })

  it('becomes valid when Routing Slip Number is entered', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({
      staffPaymentData: {
        option: 1, // FAS
        routingSlipNumber: '123456789'
      }
    })
    await Vue.nextTick()

    // verify that component is valid
    const vm: any = wrapper.vm
    expect(vm.fasFormValid).toBe(true)
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes valid when BC Online Account Number and DAT Number are entered', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({
      staffPaymentData: {
        option: 2, // BCOL
        bcolAccountNumber: '123456',
        datNumber: 'C1234567'
      }
    })
    await Vue.nextTick()

    // verify that component is valid
    const vm: any = wrapper.vm
    expect(vm.bcolFormValid).toBe(true)
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes valid when No Fee is selected', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({
      staffPaymentData: {
        option: 0 // NO_FEE
      }
    })
    await Vue.nextTick()

    // verify that component is valid
    const vm: any = wrapper.vm
    expect(vm.staffPaymentData.option === 0).toBe(true)
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes invalid when Routing Slip Number is cleared', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789'
        }
      }
    })
    wrapper.setProps({
      staffPaymentData: {
        option: 1, // FAS
        routingSlipNumber: ''
      }
    })
    await Vue.nextTick()

    // verify that component is invalid
    const vm: any = wrapper.vm
    expect(vm.fasFormValid).toBe(false)
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('becomes invalid when BC Online Account Number is cleared', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 2, // BCOL
          bcolAccountNumber: '123456',
          datNumber: 'C1234567'
        }
      }
    })
    wrapper.setProps({
      staffPaymentData: {
        option: 2, // BCOL
        bcolAccountNumber: '',
        datNumber: 'C1234567'
      }
    })
    await Vue.nextTick()

    // verify that component is invalid
    const vm: any = wrapper.vm
    expect(vm.fasFormValid).toBe(false)
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('becomes invalid when DAT Number is cleared', async () => {
    const wrapper = mount(StaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 2, // BCOL
          bcolAccountNumber: '123456',
          datNumber: 'C1234567'
        }
      }
    })
    wrapper.setProps({
      staffPaymentData: {
        option: 2, // BCOL
        bcolAccountNumber: '123456',
        datNumber: ''
      }
    })
    await Vue.nextTick()

    // verify that component is invalid
    const vm: any = wrapper.vm
    expect(vm.fasFormValid).toBe(false)
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })
})
