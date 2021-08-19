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

  // *** TODO: revert before final commit
  xit('fetches entity info correctly', async () => {
    const ENTITY_INFO = {
      business: {
        identifier: 'CP1234567',
        legalType: 'CP'
      }
    }

    // mock endpoint
    get.withArgs('businesses/CP1234567')
      .returns(new Promise((resolve) => resolve({ data: ENTITY_INFO })))

    // call method
    const entityInfo = await vm.fetchBusinessInfo('CP1234567')

    // verify data
    expect(entityInfo).toEqual({ data: ENTITY_INFO })
  })

  it('fetches tasks correctly', async () => {
    const TASKS = [
      { name: 'task1' },
      { name: 'task2' },
      { name: 'task3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/tasks')
      .returns(new Promise((resolve) => resolve({ data: TASKS })))

    // call method
    const tasks = await vm.fetchTasks('CP1234567')

    // verify data
    expect(tasks).toEqual({ data: TASKS })
  })

  // *** TODO: revert before final commit
  xit('fetches filings correctly', async () => {
    const FILINGS = [
      { name: 'filing1' },
      { name: 'filing2' },
      { name: 'filing3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/filings')
      .returns(new Promise((resolve) => resolve({ data: FILINGS })))

    // call method
    const filings = await vm.fetchFilings('CP1234567')

    // verify data
    expect(filings).toEqual({ data: FILINGS })
  })

  // *** TODO: revert before final commit
  xit('fetches addresses correctly', async () => {
    const ADDRESSES = [
      { name: 'address1' },
      { name: 'address2' },
      { name: 'address3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/addresses')
      .returns(new Promise((resolve) => resolve({ data: ADDRESSES })))

    // call method
    const addresses = await vm.fetchAddresses('CP1234567')

    // verify data
    expect(addresses).toEqual({ data: ADDRESSES })
  })

  // *** TODO: revert before final commit
  xit('fetches directors correctly', async () => {
    const DIRECTORS = [
      { name: 'director1' },
      { name: 'director2' },
      { name: 'director3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/directors')
      .returns(new Promise((resolve) => resolve({ data: DIRECTORS })))

    // call method
    const directors = await vm.fetchDirectors('CP1234567')

    // verify data
    expect(directors).toEqual({ data: DIRECTORS })
  })

  // *** TODO: revert before final commit
  xit('fetches incorp app correctly', async () => {
    const IA = {
      foo: 'bar'
    }

    // mock endpoint
    get.withArgs('businesses/T1234567/filings')
      .returns(new Promise((resolve) => resolve({ data: IA })))

    // call method
    const ia = await vm.fetchIncorpApp('T1234567')

    // verify data
    expect(ia).toEqual(IA)
  })

  it('fetches name request correctly', async () => {
    const NR = {
      foo: 'bar'
    }

    // mock endpoint
    get.withArgs('nameRequests/NR1234567')
      .returns(new Promise((resolve) => resolve({ data: NR })))

    // call method
    const nr = await vm.fetchNameRequest('NR1234567')

    // verify data
    expect(nr).toEqual(NR)
  })

  it('fetches a filing correctly', async () => {
    const FILING = {
      foo: 'bar'
    }
    const endpoint = 'businesses/CP1234567/filings/1234'

    // mock endpoint
    get.withArgs(endpoint)
      .returns(new Promise((resolve) => resolve({ data: { filing: FILING } })))

    // call method
    const filing = await vm.fetchFiling(endpoint)

    // verify data
    expect(filing).toEqual(FILING)
  })

  it('creates a filing correctly', async () => {
    const FILING = {
      foo: 'bar'
    }

    // mock endpoint
    post.withArgs('businesses/CP1234567/filings?draft=true')
      .returns(new Promise((resolve) => resolve({ data: { filing: FILING } })))

    // call method
    const response = await vm.createFiling('CP1234567', FILING, true)

    // verify data
    expect(response).toEqual(FILING)
  })

  it('updates a filing correctly', async () => {
    const FILING = {
      foo: 'bar'
    }

    // mock endpoint
    put.withArgs('businesses/CP1234567/filings/1234?draft=true')
      .returns(new Promise((resolve) => resolve({ data: { filing: FILING } })))

    // call method
    const response = await vm.updateFiling('CP1234567', FILING, 1234, true)

    // verify data
    expect(response).toEqual(FILING)
  })

  it('fetches comments correctly', async () => {
    const COMMENTS = [
      { name: 'comment1' },
      { name: 'comment2' },
      { name: 'comment3' }
    ]

    // mock endpoint
    get.withArgs('COMMENTS_URL')
      .returns(new Promise((resolve) => resolve({ data: { comments: COMMENTS } })))

    // call method
    const comments = await vm.fetchComments('COMMENTS_URL')

    // verify data
    expect(comments).toEqual(COMMENTS)
  })

  // *** TODO: revert before final commit
  xit('fetches documents correctly', async () => {
    const DOCUMENTS = [
      { type: 'REPORT', title: 'document1', filename: 'document1.pdf', link: null },
      { type: 'REPORT', title: 'document2', filename: 'document2.pdf', link: null },
      { type: 'RECEIPT', title: 'receipt', filename: 'receipt.pdf', link: null }
    ]

    // mock endpoint
    get.withArgs('DOCUMENTS_URL')
      .returns(new Promise((resolve) => resolve({ data: DOCUMENTS })))

    // call method
    const comments = await vm.fetchDocuments('DOCUMENTS_URL')

    // verify data
    expect(comments).toEqual(DOCUMENTS)
  })

  it('fetches one document correctly', async () => {
    const PDF = 'PDF data goes here'

    // mock endpoint
    get.withArgs('businesses/CP1234567/filings/1234?type=REPORT')
      .returns(new Promise((resolve) => resolve({ data: PDF })))

    // build receipt meta object
    const meta = {
      filingId: 1234,
      filename: 'ABC Corp - Jun 15, 2021.pdf',
      reportType: 'REPORT'
    }

    // call method
    const response = await vm.fetchDocument('CP1234567', meta)

    // verify data
    expect(response).toEqual({ data: PDF })
  })
})
