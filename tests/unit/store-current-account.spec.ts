import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'
import Vue from "vue";

describe('testing current account module', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  beforeAll(() => {
    // clear store
    store.state.tasks = []
    store.state.filings = []

    sessionStorage.clear()
  })

  it('fetches current account from session storage - PREMIUM', async () => {
    sessionStorage.setItem('CURRENT_ACCOUNT', '{"accountType": "PREMIUM", "id": "123", "label": "ABC", "type": "ACCT"}')
    await store.dispatch('loadCurrentAccount')
      .then(() => {
        expect(store.getters.isPremiumAccount).toBe(true)
        expect(store.getters.isSbcStaff).toBe(false)
      })
  })

  it('fetches current account from session storage - SBC_STAFF', async () => {
    sessionStorage.setItem('CURRENT_ACCOUNT', '{"accountType": "SBC_STAFF", "id": "123", "label": "ABC", "type": "ACCT"}')
    await store.dispatch('loadCurrentAccount')
      .then(() => {
        expect(store.getters.isPremiumAccount).toBe(false)
        expect(store.getters.isSbcStaff).toBe(true)
      })
  })
})
