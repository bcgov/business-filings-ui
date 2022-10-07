import Vue from 'vue'
import sinon from 'sinon'
import { shallowMount, Wrapper } from '@vue/test-utils'
import axios from '@/axios-auth'
import MixinTester from '@/mixin-tester.vue'

describe('Auth API Mixin', () => {
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

  it('fetches authorizations correctly', async () => {
    const AUTHORIZATIONS = {
      roles: ['edit', 'view']
    }

    // mock endpoint
    get.withArgs('entities/CP1234567/authorizations')
      .returns(new Promise(resolve => resolve({ data: AUTHORIZATIONS })))

    // call method
    const authorizations = await vm.fetchAuthorizations('CP1234567')

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
    const userInfo = await vm.fetchUserInfo()

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
    const businessInfo = await vm.fetchEntityInfo('CP1234567')

    // verify data
    expect(businessInfo).toEqual({ data: ENTITY_INFO })
  })
})
