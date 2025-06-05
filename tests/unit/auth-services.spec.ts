import sinon from 'sinon'
import axios from '@/axios-auth'
import AuthServices from '@/services/auth-services'

describe('Auth Services', () => {
  let get: any

  beforeEach(() => {
    get = sinon.stub(axios, 'get')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('fetches user info correctly', async () => {
    const USER_INFO = {
      username: 'test/username',
      contacts: [
        { email: 'first.last@email.com' }
      ],
      firstname: 'First',
      lastname: 'Last',
      roles: '{one,two,three}'
    }

    // mock endpoint
    get.withArgs('users/@me')
      .returns(new Promise(resolve => resolve({ data: USER_INFO })))

    // call method
    const response = await AuthServices.fetchUserInfo('')

    // verify data
    expect(response).toEqual(USER_INFO)
  })

  it('fetches entity info correctly', async () => {
    const ENTITY_INFO = {
      contacts: [
        {
          email: 'name@mail.com',
          phone: '(111)-222-3333',
          phoneExtension: '444'
        }
      ]
    }

    // mock endpoint
    get.withArgs('entities/CP1234567')
      .returns(new Promise(resolve => resolve({ data: ENTITY_INFO })))

    // call method
    const response = await AuthServices.fetchEntityInfo('', 'CP1234567')

    // verify data
    expect(response).toEqual({ data: ENTITY_INFO })
  })
})
