import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AgmLocation from '@/components/AgmLocationChange/AgmLocation.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('AgmLocation', () => {
  /** Array of validations rules for AGM location to be passed as a prop. */
  const rules = [] as Array<(val) => boolean | string>
  rules.push(val => !!val || 'AGM location is required.')
  rules.push(val => (val.length <= 400) || 'Must be 400 characters or less.')

  it('initializes correctly', () => {
    const wrapper = mount(AgmLocation,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })
    const vm: any = wrapper.vm

    expect(vm.agmLocation).toBe('')
    expect(wrapper.emitted('update:agmLocation')).toBeUndefined()
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct validation when initial location value is passed', async () => {
    const wrapper = mount(AgmLocation,
      {
        vuetify,
        propsData: {
          rules: rules,
          locationValue: 'Toronto, Ontario, Canada'
        }
      })

    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when a valid agm location is the input', async () => {
    const wrapper = mount(AgmLocation,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const input = wrapper.find('#agm-location')
    await input.setValue('Toronto, Ontario, Canada')

    expect(wrapper.emitted('update:agmLocation').pop()[0]).toBe('Toronto, Ontario, Canada')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when an invalid agm location (empty string) is the input', async () => {
    const wrapper = mount(AgmLocation,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const input = wrapper.find('#agm-location')
    await input.setValue('')

    expect(wrapper.emitted('update:agmLocation').pop()[0]).toBe('')
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct events when an invalid agm location (over 100 chars) is the input', async () => {
    const wrapper = mount(AgmLocation,
      {
        vuetify,
        propsData: {
          rules: rules
        }
      })

    const input = wrapper.find('#agm-location')
    const a401 = 'a'.repeat(401)
    await input.setValue(a401)

    expect(wrapper.emitted('update:agmLocation').pop()[0]).toBe(a401)
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })
})
