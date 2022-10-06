import Vue from 'vue'
import sinon from 'sinon'
import { shallowMount, Wrapper } from '@vue/test-utils'
import axios from '@/axios-auth'
import MixinTester from '@/mixin-tester.vue'

describe('Pay API Mixin', () => {
  let get: any
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(async () => {
    get = sinon.stub(axios, 'get')
    wrapper = shallowMount(MixinTester)
    vm = wrapper.vm
    await Vue.nextTick()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches pay error object correctly', async () => {
    const paymentErrorObj = {
      detail: 'Detail',
      title: 'Title',
      type: 'Type'
    }

    // mock endpoint
    get.withArgs('codes/errors/123')
      .returns(new Promise(resolve => resolve({
        data: { ...paymentErrorObj }
      })))

    // call method
    const response = await vm.getPayErrorObj('123')

    // verify data
    expect(response).toEqual({ ...paymentErrorObj })
  })
})
