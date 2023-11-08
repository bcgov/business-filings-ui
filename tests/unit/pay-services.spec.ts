import sinon from 'sinon'
import axios from '@/axios-auth'
import PayServices from '@/services/pay-services'

describe('Pay Services', () => {
  let get: any

  beforeEach(() => {
    get = sinon.stub(axios, 'get')
  })

  afterEach(() => {
    sinon.restore()
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
    const response = await PayServices.getPayErrorObj('', '123')

    // verify data
    expect(response).toEqual({ ...paymentErrorObj })
  })

  it('fetches cfs account number correctly', async () => {
    get.withArgs(`accounts/123`)
      .returns(new Promise(resolve => resolve({
        data: {
          cfsAccount: {
            cfsAccountNumber: '99'
          }
        }
      })))

    const response = await PayServices.fetchCfsAccountId('', 123)

    sinon.assert.called(get)
    // verify data
    expect(response).toEqual('99')
  })
})
