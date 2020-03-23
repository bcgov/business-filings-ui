import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { DetailComment } from '@/components/common'
import { sleep } from '@/utils/sleep'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()

describe('DetailComment', () => {
  it('initializes correctly', () => {
    const wrapper = shallowMount(DetailComment,
      {
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.value).toBe('')
    expect(vm.placeholder).toBe('')
    expect(vm.autofocus).toBe(false)

    // verify that v-model is not updated
    expect(wrapper.emitted('input')).toBeUndefined()

    // verify that component reports initial validity (false)
    expect(wrapper.emitted('valid').pop()[0]).toEqual(false)

    wrapper.destroy()
  })

  it('handles props correctly', () => {
    const wrapper = shallowMount(DetailComment,
      {
        propsData: {
          value: 'Initial comment',
          placeholder: 'Enter Comment Here',
          autofocus: true
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.value).toBe('Initial comment')
    expect(vm.placeholder).toBe('Enter Comment Here')
    expect(vm.autofocus).toBe(true)

    wrapper.destroy()
  })

  it('emits valid event when value prop is changed', async () => {
    const wrapper = shallowMount(DetailComment,
      {
        store,
        vuetify
      })

    // change the value
    // NB: need to wait for debounce
    wrapper.setProps({ value: 'testing 1 2 3' })
    await sleep(300)

    // verify valid event
    expect(wrapper.emitted('valid').pop()[0]).toEqual(true)

    wrapper.destroy()
  })

  it('emits events when value model is changed', async () => {
    const wrapper = shallowMount(DetailComment,
      {
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    // const element = wrapper.find('#detail-comment-textarea')
    // element.setValue('testing 4 5 6')

    // apparently you can't set a textarea's value, so do it explicitly
    // NB: need to wait for debounce
    vm.onValueChanged('testing 4 5 6')
    await sleep(300)
    vm.emitInput('testing 4 5 6')

    // verify valid and input events
    expect(wrapper.emitted('valid').pop()[0]).toEqual(true)
    expect(wrapper.emitted('input').pop()).toEqual(['testing 4 5 6'])

    wrapper.destroy()
  })
})
