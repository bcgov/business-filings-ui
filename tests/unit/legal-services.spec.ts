import sinon from 'sinon'
import axios from '@/axios-auth'
import LegalServices from '@/services/legal-services'

// mock some window.URL functions that are not defined in Jest
window.URL.createObjectURL = jest.fn()
window.URL.revokeObjectURL = jest.fn()

describe('Legal Services', () => {
  let get: any
  let post: any
  let put: any

  beforeEach(() => {
    get = sinon.stub(axios, 'get')
    post = sinon.stub(axios, 'post')
    put = sinon.stub(axios, 'put')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches business info correctly', async () => {
    const BUSINESS_INFO = {
      identifier: 'CP1234567',
      legalType: 'CP'
    }

    // mock endpoint
    get.withArgs('businesses/CP1234567')
      .returns(new Promise(resolve => resolve({ data: { business: BUSINESS_INFO } })))

    // call method
    const entityInfo = await LegalServices.fetchBusiness('CP1234567')

    // verify data
    expect(entityInfo).toEqual(BUSINESS_INFO)
  })

  it('fetches tasks correctly', async () => {
    const TASKS = [
      { name: 'task1' },
      { name: 'task2' },
      { name: 'task3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/tasks')
      .returns(new Promise(resolve => resolve({ data: { tasks: TASKS } })))

    // call method
    const tasks = await LegalServices.fetchTasks('CP1234567')

    // verify data
    expect(tasks).toEqual({ data: { tasks: TASKS } })
  })

  it('fetches filings correctly', async () => {
    const FILINGS = [
      { name: 'filing1' },
      { name: 'filing2' },
      { name: 'filing3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/filings')
      .returns(new Promise(resolve => resolve({ data: { filings: FILINGS } })))

    // call method
    const filings = await LegalServices.fetchFilings('CP1234567')

    // verify data
    expect(filings).toEqual(FILINGS)
  })

  it('fetches addresses correctly', async () => {
    const ADDRESSES = {
      registeredOffice: {
        deliveryAddress: 'Registered Delivery Address',
        mailingAddress: 'Registered Mailing Address'
      },
      recordsOffice: {
        deliveryAddress: 'Records Delivery Address',
        mailingAddress: 'Records Mailing Address'
      }
    }

    // mock endpoint
    get.withArgs('businesses/CP1234567/addresses')
      .returns(new Promise(resolve => resolve({ data: ADDRESSES })))

    // call method
    const addresses = await LegalServices.fetchAddresses('CP1234567')

    // verify data
    expect(addresses).toEqual({ data: ADDRESSES })
  })

  it('fetches directors correctly', async () => {
    const DIRECTORS = [
      { name: 'director1' },
      { name: 'director2' },
      { name: 'director3' }
    ]

    // mock endpoint
    get.withArgs('businesses/CP1234567/parties?role=Director')
      .returns(new Promise(resolve => resolve({ data: DIRECTORS })))

    // call method
    const directors = await LegalServices.fetchParties('CP1234567', 'Director' as any)

    // verify data
    expect(directors).toEqual({ data: DIRECTORS })
  })

  it('fetches incorp app correctly', async () => {
    const IA = {
      foo: 'bar'
    }

    // mock endpoint
    get.withArgs('businesses/T1234567/filings')
      .returns(new Promise(resolve => resolve({ data: IA })))

    // call method
    const ia = await LegalServices.fetchDraftApp('T1234567')

    // verify data
    expect(ia).toEqual(IA)
  })

  it('fetches name request correctly', async () => {
    const NR = {
      foo: 'bar'
    }

    // mock endpoint
    get.withArgs('nameRequests/NR1234567')
      .returns(new Promise(resolve => resolve({ data: NR })))

    // call method
    const nr = await LegalServices.fetchNameRequest('NR1234567')

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
      .returns(new Promise(resolve => resolve({ data: { filing: FILING } })))

    // call method
    const filing = await LegalServices.fetchFiling(endpoint)

    // verify data
    expect(filing).toEqual(FILING)
  })

  it('creates a filing correctly', async () => {
    const FILING = {
      foo: 'bar'
    }

    // mock endpoint
    post.withArgs('businesses/CP1234567/filings?draft=true')
      .returns(new Promise(resolve => resolve({ data: { filing: FILING } })))

    // call method
    const response = await LegalServices.createFiling('CP1234567', FILING, true)

    // verify data
    expect(response).toEqual(FILING)
  })

  it('updates a filing correctly', async () => {
    const FILING = {
      foo: 'bar'
    }

    // mock endpoint
    put.withArgs('businesses/CP1234567/filings/1234?draft=true')
      .returns(new Promise(resolve => resolve({ data: { filing: FILING } })))

    // call method
    const response = await LegalServices.updateFiling('CP1234567', FILING, 1234, true)

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
      .returns(new Promise(resolve => resolve({ data: { comments: COMMENTS } })))

    // call method
    const comments = await LegalServices.fetchComments('COMMENTS_URL')

    // verify data
    expect(comments).toEqual(COMMENTS)
  })

  it('fetches documents correctly', async () => {
    const URL = 'businesses/CP0000840/filings/112758/documents'

    const DOCUMENTS = {
      legalFilings: [
        { specialResolution: 'link_to_special_resolution' }
      ],
      primary: 'link_to_special_resolution',
      receipt: 'link_to_receipt'
    }

    // mock endpoint
    get.withArgs(URL)
      .returns(new Promise(resolve => resolve({ data: { documents: DOCUMENTS } })))

    // call method
    const comments = await LegalServices.fetchDocuments(URL)

    // verify data
    expect(comments).toEqual(DOCUMENTS)
  })

  it('fetches one document correctly', async () => {
    const URL = 'businesses/CP1234567/filings/1234/documents/sample'
    const PDF = 'PDF data goes here'

    // mock endpoint
    get.withArgs(URL)
      .returns(new Promise(resolve => resolve({ data: PDF })))

    // build document object
    const document = {
      title: 'Sample PDF',
      filename: 'Sample PDF - Jun 15, 2021.pdf',
      link: URL
    }

    // call method
    const response = await LegalServices.fetchDocument(document)

    // verify data
    expect(response).toEqual({ data: PDF })
  })
})
