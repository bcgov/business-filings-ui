import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import store from '@/store/store'
import { DetailComment } from '@/components/common'
import { sleep } from '@/utils/sleep'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('DetailComment', () => {
  it('initializes correctly', () => {
    const wrapper = shallowMount(DetailComment,
      {
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.value).toBe('')
    expect(vm.label).toBe('')
    expect(vm.autofocus).toBe(false)

    // verify that there are no initial events
    expect(wrapper.emitted('input')).toBeUndefined()
    expect(wrapper.emitted('valid')).toBeUndefined()

    wrapper.destroy()
  })

  it('handles props correctly', () => {
    const wrapper = shallowMount(DetailComment,
      {
        propsData: {
          value: 'Initial comment',
          label: 'Enter Comment Here',
          autofocus: true
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.value).toBe('Initial comment')
    expect(vm.label).toBe('Enter Comment Here')
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
    expect(wrapper.emitted('valid').pop()).toEqual([true])

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
    expect(wrapper.emitted('valid').pop()).toEqual([true])
    expect(wrapper.emitted('input').pop()).toEqual(['testing 4 5 6'])

    wrapper.destroy()
  })
})
