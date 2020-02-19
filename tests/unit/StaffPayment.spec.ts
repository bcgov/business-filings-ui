import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import StaffPayment from '@/components/AnnualReport/StaffPayment.vue'

Vue.use(Vuetify)
// suppress "avoid mutating a prop directly" warnings
// https://vue-test-utils.vuejs.org/api/config.html#silent
Vue.config.silent = true

const vuetify = new Vuetify({})

describe('StaffPayment', () => {
  it('initializes correctly with no prop', async () => {
    const wrapper = mount(StaffPayment, { vuetify })
    await Vue.nextTick()

    // check that:
    // 1. routingSlipNumber is null
    // 2. component is invalid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual([null])
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('initializes correctly with prop', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { routingSlipNumber: '123456789' }
      })
    await Vue.nextTick()

    // check that:
    // 1. routingSlipNumber is set
    // 2. component is valid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual(['123456789'])
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes valid when prop becomes valid', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setProps({ routingSlipNumber: '123456789' })
    await Vue.nextTick()

    // check that:
    // 1. routingSlipNumber is set
    // 2. component is valid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual(['123456789'])
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes invalid when prop becomes invalid', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { routingSlipNumber: '123456789' }
      })

    wrapper.setProps({ routingSlipNumber: null })
    await Vue.nextTick()

    // check that:
    // 1. routingSlipNumber is null
    // 2. component is invalid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual([null])
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('becomes valid when input becomes valid', async () => {
    const wrapper = mount(StaffPayment, { vuetify })

    wrapper.setData({ routingSlipNumber: '123456789' })
    await Vue.nextTick()

    // check that:
    // 1. routingSlipNumber is set
    // 2. component is valid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual(['123456789'])
    expect(wrapper.emitted('valid').pop()).toEqual([true])

    wrapper.destroy()
  })

  it('becomes invalid when input becomes invalid', async () => {
    const wrapper = mount(StaffPayment,
      {
        vuetify,
        propsData: { routingSlipNumber: '123456789' }
      })

    wrapper.setData({ routingSlipNumber: null })
    await Vue.nextTick()

    // NB: can't check error message because Vuetify renders it outside this component

    // check that:
    // 1. routingSlipNumber is null
    // 2. component is invalid
    expect(wrapper.emitted('update:routingSlipNumber').pop()).toEqual([null])
    expect(wrapper.emitted('valid').pop()).toEqual([false])

    wrapper.destroy()
  })
})
