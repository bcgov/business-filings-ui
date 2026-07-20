import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { BusinessNameForeign } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('BusinessNameForeign', () => {
  it('initializes correctly', () => {
    const wrapper = mount(BusinessNameForeign,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.businessName).toBeUndefined()
    expect(wrapper.emitted('update:businessName').pop()[0]).toBeUndefined()
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('draft business name', async () => {
    const wrapper = mount(BusinessNameForeign,
      {
        vuetify,
        propsData: {
          draftBusinessName: 'North Shore Toys LTD.'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.businessName).toEqual('North Shore Toys LTD.')
    expect(wrapper.emitted('update:businessName').pop()[0]).toBe('North Shore Toys LTD.')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when business name is changed', async () => {
    const wrapper = mount(BusinessNameForeign,
      {
        vuetify,
        propsData: {
          draftBusinessName: 'North Shore Toys LTD.'
        }
      })

    const input = wrapper.find('#business-name-text-field')
    await input.setValue('South Shore Toys LTD.')

    expect(wrapper.emitted('update:businessName').pop()[0]).toBe('South Shore Toys LTD.')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('correctly trim the business name', async () => {
    const wrapper = mount(BusinessNameForeign,
      {
        vuetify
      })

    const input = wrapper.find('#business-name-text-field')
    await input.setValue('    South Shore Toys LTD.')

    expect(wrapper.emitted('update:businessName').pop()[0]).toBe('South Shore Toys LTD.')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('clears the error once a valid business name is entered after validation has been triggered', async () => {
    const wrapper = mount(BusinessNameForeign,
      {
        vuetify,
        propsData: {
          draftBusinessName: ''
        }
      })
    const vm: any = wrapper.vm

    await wrapper.setProps({ validateForm: true })
    await Vue.nextTick()

    expect(vm.$refs.textarea.error).toBe(true)

    const input = wrapper.find('#business-name-text-field')
    await input.setValue('South Shore Toys LTD.')
    await Vue.nextTick()

    expect(vm.$refs.textarea.error).toBe(false)
    wrapper.destroy()
  })
})
