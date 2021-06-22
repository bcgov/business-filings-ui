import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { DateTooltip } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Date Tooltip', () => {
  it('displays expected content with a null date', () => {
    const wrapper = mount(DateTooltip, {
      vuetify
    })
    const vm: any = wrapper.vm

    // verify content
    expect(wrapper.find('span').text()).toBe('Unknown')
    expect(vm.dateTimeString).toBe('Unknown')

    wrapper.destroy()
  })

  it('displays expected content with a valid date', () => {
    const wrapper = mount(DateTooltip, {
      vuetify,
      propsData: { date: new Date('2020-05-15 19:00:00 GMT') }
    })
    const vm: any = wrapper.vm

    // verify content
    expect(wrapper.find('span').text()).toBe('May 15, 2020')
    expect(vm.dateTimeString).toBe('May 15, 2020 at 12:00 pm Pacific time')

    wrapper.destroy()
  })
})
