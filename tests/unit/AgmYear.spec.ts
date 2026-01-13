import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AgmYear from '@/components/AgmLocationChange/AgmYear.vue'
import { Sleep } from '@/utils'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('AgmYear', () => {
  /** Array of validations rules for AGM Year with min and max AGM year. */
  const today = new Date()
  const minAgmYear = today.getFullYear() - 2
  const maxAgmYear = today.getFullYear() + 1
  const rules = [] as Array<(val) => boolean | string>
  rules.push(val => !!val || 'AGM year is required.')
  rules.push(val => (val && +val <= maxAgmYear) || 'Must be on or before ' + maxAgmYear)
  rules.push(val => (val && +val >= minAgmYear) || 'Must be on or after ' + minAgmYear)

  it('initializes correctly', () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })
    const vm: any = wrapper.vm

    expect(vm.agmYear).toBe('')
    expect(wrapper.emitted('input')).toBeUndefined()
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct validation when valid agm year is passed', async () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules,
          value: today.getFullYear()
        }
      })

    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when a valid agm year is the input', async () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const vm: any = wrapper.vm
    vm.onValueChanged(today.getFullYear())
    const input = wrapper.find('#year-txt')
    await input.setValue(today.getFullYear())
    await Sleep(300) // need to wait for debounce

    expect(wrapper.emitted('input').pop()[0]).toBe(today.getFullYear().toString())
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when an invalid agm year (empty string) is the input', async () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const vm: any = wrapper.vm
    vm.onValueChanged('')
    const input = wrapper.find('#year-txt')
    await input.setValue('')
    await Sleep(300) // need to wait for debounce

    expect(wrapper.emitted('input').pop()[0]).toBe('')
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct events when an invalid agm year (less than min) is the input', async () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const vm: any = wrapper.vm
    vm.onValueChanged(today.getFullYear() - 3)
    const input = wrapper.find('#year-txt')
    await input.setValue(today.getFullYear() - 3)
    await Sleep(300) // need to wait for debounce

    expect(wrapper.emitted('input').pop()[0]).toBe((today.getFullYear() - 3).toString())
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct events when an invalid agm year (more than max) is the input', async () => {
    const wrapper = mount(AgmYear,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const vm: any = wrapper.vm
    vm.onValueChanged(today.getFullYear() + 2)
    const input = wrapper.find('#year-txt')
    await input.setValue(today.getFullYear() + 2)
    await Sleep(300) // need to wait for debounce

    expect(wrapper.emitted('input').pop()[0]).toBe((today.getFullYear() + 2).toString())
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })
})
