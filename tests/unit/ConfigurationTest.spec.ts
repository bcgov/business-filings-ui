import sinon from 'sinon'
import axios from '@/axios-auth'
import { setBaseRouteAndBusinessId } from '@/utils'
import { getVuexStore } from '@/store'

describe('Test new promise catch vs relying on axios promise', () => {
  // init environment variable
  process.env.BASE_URL = '/business/'

  const store = getVuexStore() as any // remove typings for unit tests
  const applicationUrl = 'http://localhost/business/'
  setBaseRouteAndBusinessId('CP1234567', '/business/', window.location.origin)

  beforeEach(() => {
    delete window.location
    window.location = {
      origin: 'http://localhost',
      pathname: '/business/CP1234567',
      search: '?accountid=2288'
    } as any

    sinon.stub(axios, 'get')
      .withArgs('http://localhost/business/config/configuration.json')
      .returns(Promise.resolve('the server is down'))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('try calling alternativeFetchConfiguration() action with bad data', async () => {
    await store.dispatch('alternativeFetchConfiguration', applicationUrl)
      .then((response) => {
        // this passes when it shouldn't. Instead, we want the error to appear in
        // the catch block
        expect(response).toEqual(new Error('Invalid configuration.json'))
      })
      .catch((error) => {
        // this block should be called because the server is returning bad data, but isn't
      })
  })

  it('try calling fetchConfiguration() action with bad data', async () => {
    await store.dispatch('fetchConfiguration', applicationUrl)
      .then((response) => {
        // this block shouldn't be called because the server is returning bad data
      })
      .catch((error) => {
        // this passes which I think is the way we want it
        expect(error).toEqual(new Error('Invalid configuration.json'))
      })
  })

})
