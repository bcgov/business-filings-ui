import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import { EffectiveDate } from '@/components/common'

Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

setActivePinia(createPinia())
const rootStore = useRootStore()

describe('EffectiveDate', () => {
  beforeEach(() => {
    rootStore.currentDate = '2023-06-12'
  })

  it('initializes correctly', () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.date).toEqual('')
    expect(vm.dateFormatted).toEqual('')
    expect(vm.menu).toEqual(false)
    expect(vm.maxDate).toEqual('2023-06-12')
  })

  it('initializes correctly with draft effective date', () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify,
        propsData: {
          initialEffectiveDate: '2023-06-01'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.dateFormatted).toEqual('2023/06/01')
    expect(vm.menu).toEqual(false)
  })

  it('emit correct events when a new date is selected', async () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify,
        propsData: {
          initialEffectiveDate: '2023-06-01'
        }
      })
    const vm: any = wrapper.vm

    await wrapper.setData({ dateFormatted: '2023/05/01' })

    expect(vm.date).toEqual('2023-05-01')
    expect(vm.dateFormatted).toEqual('2023/05/01')
    expect(wrapper.emitted('update:effectiveDate').pop()[0]).toBe('2023-05-01')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
  })

  it('correct validations when an invalid format of date is input', async () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify,
        propsData: {
          initialEffectiveDate: '2023-06-01'
        }
      })

    const input = wrapper.find('#date-text-field')
    await input.setValue('2023-06-05')

    expect(wrapper.vm.$v.dateFormatted.isNotNull).toBe(true)
    expect(wrapper.vm.$v.dateFormatted.isValidFormat).toBe(false)
    expect(wrapper.vm.$v.dateFormatted.isValidEffectiveDate).toBe(true)
  })

  it('correct validations when an input date is after today', async () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify,
        propsData: {
          initialEffectiveDate: '2023-06-01'
        }
      })

    const input = wrapper.find('#date-text-field')
    await input.setValue('2023/07/01')

    expect(wrapper.vm.$v.dateFormatted.isNotNull).toBe(true)
    expect(wrapper.vm.$v.dateFormatted.isValidFormat).toBe(true)
    expect(wrapper.vm.$v.dateFormatted.isValidEffectiveDate).toBe(false)
  })

  it('correct validations when an input date is empty', async () => {
    const wrapper = mount(EffectiveDate,
      {
        vuetify,
        propsData: {
          initialEffectiveDate: '2023-06-01'
        }
      })

    const input = wrapper.find('#date-text-field')
    await input.setValue('')

    expect(wrapper.vm.$v.dateFormatted.isNotNull).toBe(false)
    expect(wrapper.vm.$v.dateFormatted.isValidFormat).toBe(false)
    expect(wrapper.vm.$v.dateFormatted.isValidEffectiveDate).toBe(false)
  })
})
