import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)
const localVue = createLocalVue()
setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

describe('testing current account module', () => {
  it('fetches current account from session storage - PREMIUM', async () => {
    jest.isolateModules(() => async () => {
      const SbcHeader = require('sbc-common-components/src/components/SbcHeader.vue').default
      shallowMount(SbcHeader, { localVue })

      expect(authenticationStore.isPremiumAccount).toBe(true)
      expect(authenticationStore.isSbcStaff).toBe(false)
    })
  })

  it('fetches current account from session storage - SBC_STAFF', async () => {
    jest.isolateModules(() => async () => {
      const SbcHeader = require('sbc-common-components/src/components/SbcHeader.vue').default
      shallowMount(SbcHeader, { localVue })

      expect(authenticationStore.isPremiumAccount).toBe(false)
      expect(authenticationStore.isSbcStaff).toBe(true)
    })
  })
})
