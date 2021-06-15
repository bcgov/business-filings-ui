import Vue from 'vue'
import sinon from 'sinon'
import { shallowMount, Wrapper } from '@vue/test-utils'
import axios from '@/axios-auth'
import MixinTester from './mixin-tester.vue'

describe('Legal API Mixin', () => {
  let get: any
  let post: any
  let put: any
  let wrapper: Wrapper<Vue>
  let vm: any

  beforeEach(async () => {
    get = sinon.stub(axios, 'get')
    post = sinon.stub(axios, 'post')
    put = sinon.stub(axios, 'put')
    wrapper = shallowMount(MixinTester)
    vm = wrapper.vm
    await Vue.nextTick()
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  xit('fetches entity info correctly', async () => {
    // TODO: mock endpoint
    const authorizations = await vm.fetchEntityInfo('CP1234567')
    // TODO: verify data
  })

  xit('fetches tasks correctly', async () => {
    // TODO: mock endpoint
    const tasks = await vm.fetchTasks()
    // TODO: verify data
  })

  xit('fetches filings correctly', async () => {
    // TODO: mock endpoint
    const filings = await vm.fetchFilings('CP1234567')
    // TODO: verify data
  })

  xit('fetches addresses correctly', async () => {
    // TODO: mock endpoint
    const addresses = await vm.fetchAddresses('CP1234567')
    // TODO: verify data
  })

  xit('fetches directors correctly', async () => {
    // TODO: mock endpoint
    const directors = await vm.fetchDirectors('CP1234567')
    // TODO: verify data
  })

  xit('fetches incorp app correctly', async () => {
    // TODO: mock endpoint
    const incorpApp = await vm.fetchIncorpApp('T1234567')
    // TODO: verify data
  })

  xit('fetches name request correctly', async () => {
    // TODO: mock endpoint
    const nameRequest = await vm.fetchNameRequest('NR1234567')
    // TODO: verify data
  })

  xit('fetches a filing correctly', async () => {
    // TODO: mock endpoint
    const filing = await vm.fetchFiling('CP1234567', 1234)
    // TODO: verify data
  })

  xit('creates a filing correctly', async () => {
    // TODO: mock endpoint
    const filing = {}
    const response = await vm.createFiling('CP1234567', filing, false)
    // TODO: verify data
  })

  xit('fetches a filing correctly', async () => {
    // TODO: mock endpoint
    const filing = {}
    const response = await vm.updateFiling('CP1234567', filing, 1234, false)
    // TODO: verify data
  })

  it('fetches comments correctly', async () => {
    const COMMENTS = [
      { name: 'comment1' },
      { name: 'comment2' },
      { name: 'comment3' }
    ]

    // mock endpoint
    get.withArgs('COMMENTS_URL')
      .returns(new Promise((resolve) => resolve({ data: COMMENTS })))

    // call method
    const comments = await vm.fetchComments('COMMENTS_URL')

    // verify data
    expect(comments).toEqual(COMMENTS)
  })

  it('fetches documents correctly', async () => {
    const DOCUMENTS = [
      { name: 'document1' },
      { name: 'document2' },
      { name: 'document3' }
    ]

    // mock endpoint
    get.withArgs('DOCUMENTS_URL')
      .returns(new Promise((resolve) => resolve({ data: DOCUMENTS })))

    // call method
    const comments = await vm.fetchDocuments('DOCUMENTS_URL')

    // verify data
    expect(comments).toEqual(DOCUMENTS)
  })

  // TODO: fix
  xit('fetches one document correctly', async () => {
    // mock endpoint
    get.withArgs('businesses/CP1234567/filings/12345?type=REPORT')
      .returns(new Promise((resolve) => resolve({ data: 'PDF data goes here' })))

    // build receipt meta object
    const meta = {
      filingId: 12345,
      filename: 'ABC Corp - Jun 15, 2021.pdf',
      reportType: 'REPORT'
    }

    // call method
    const response = await vm.fetchOneDocument('CP1234567', meta)

    // verify data
    expect(response).toEqual({ data: 'PDF data goes here' })
  })
})
