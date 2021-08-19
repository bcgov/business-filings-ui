import Vue from 'vue'
import sinon from 'sinon'
import { shallowMount, Wrapper } from '@vue/test-utils'
import axios from '@/axios-auth'
import MixinTester from './mixin-tester.vue'

describe('Pay API Mixin', () => {
  let post: any
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(async () => {
    post = sinon.stub(axios, 'post')
    wrapper = shallowMount(MixinTester)
    vm = wrapper.vm
    await Vue.nextTick()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches one receipt correctly', async () => {
    // mock endpoint
    post.withArgs('payment-requests/12345/receipts')
      .returns(new Promise((resolve) => resolve({ data: 'PDF data goes here' })))

    // build receipt object
    const receipt = {
      paymentToken: '12345',
      corpName: 'ABC Corp',
      filingDateTime: '2021-06-15 20:27:00 GMT',
      filename: 'ABC Corp - Receipt - Jun 15, 2021.pdf'
    }

    // call method
    const response = await vm.fetchReceipt(receipt)

    // verify data
    expect(response).toEqual({ data: 'PDF data goes here' })
  })
})
