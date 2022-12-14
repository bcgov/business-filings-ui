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

  it('fetches authorizations correctly', async () => {
    const AUTHORIZATIONS = {
      roles: ['edit', 'view']
    }

    // mock endpoint
    get.withArgs('entities/CP1234567/authorizations')
      .returns(new Promise(resolve => resolve({ data: AUTHORIZATIONS })))

    // call method
    const authorizations = await AuthServices.fetchAuthorizations('CP1234567')

    // verify data
    expect(authorizations).toEqual({ data: AUTHORIZATIONS })
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
    const userInfo = await AuthServices.fetchUserInfo()

    // verify data
    expect(userInfo).toEqual(USER_INFO)
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
    const businessInfo = await AuthServices.fetchEntityInfo('CP1234567')

    // verify data
    expect(businessInfo).toEqual({ data: ENTITY_INFO })
  })
})
