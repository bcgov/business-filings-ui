import { createPinia, setActivePinia } from 'pinia'
import { getVuexStore, useAuthenticationStore } from '@/stores'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)
const localVue = createLocalVue()
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

xdescribe('testing current account module', () => {
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

      // store.commit('account/setCurrentAccount', dummyAccount('PREMIUM'), { root: true })
      expect(authenticationStore.isPremiumAccount).toBe(true)
      expect(authenticationStore.isSbcStaff).toBe(false)
    })
  })

  it('fetches current account from session storage - SBC_STAFF', async () => {
    jest.isolateModules(() => async () => {
      const SbcHeader = require('sbc-common-components/src/components/SbcHeader.vue').default
      const store = await getVuexStore() as any // remove typings for unit tests
      shallowMount(SbcHeader, { store, localVue })

      // store.commit('account/setCurrentAccount', dummyAccount('SBC_STAFF'), { root: true })
      expect(authenticationStore.isPremiumAccount).toBe(false)
      expect(authenticationStore.isSbcStaff).toBe(true)
    })
  })
})