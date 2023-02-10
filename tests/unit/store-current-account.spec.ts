import { getVuexStore } from '@/store'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vue, { nextTick } from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('testing current account module', () => {
  const dummyAccount = (accountType: string) => {
    return {
      accountStatus: 'string',
      accountType: accountType,
      additionalLabel: 'string',
      id: 1234,
      label: 'string',
      productSettings: 'string',
      type: 'string',
      urlorigin: 'string',
      urlpath: 'string'
    }
  }

  it('fetches current account from session storage - PREMIUM', async () => {
    jest.isolateModules(() => async () => {
      const SbcHeader = require('sbc-common-components/src/components/SbcHeader.vue').default
      const store = await getVuexStore() as any // remove typings for unit tests
      shallowMount(SbcHeader, { store, localVue })

      store.commit('account/setCurrentAccount', dummyAccount('PREMIUM'), { root: true })
      expect(store.getters.isPremiumAccount).toBe(true)
      expect(store.getters.isSbcStaff).toBe(false)
    })
  })

  it('fetches current account from session storage - SBC_STAFF', async () => {
    jest.isolateModules(() => async () => {
      const SbcHeader = require('sbc-common-components/src/components/SbcHeader.vue').default
      const store = await getVuexStore() as any // remove typings for unit tests
      shallowMount(SbcHeader, { store, localVue })

      store.commit('account/setCurrentAccount', dummyAccount('SBC_STAFF'), { root: true })
      expect(store.getters.isPremiumAccount).toBe(false)
      expect(store.getters.isSbcStaff).toBe(true)
    })
  })
})
