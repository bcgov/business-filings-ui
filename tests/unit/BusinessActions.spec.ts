import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'

describe('Business Actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  it('loads business info', async () => {
    // set session storage we need
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')

    // init store properties we need
    store.state.corpTypeCd = 'BC'

    // mock business data and services call
    const sampleBusinessInfo = {
      identifier: 'BC1234567',
      legalType: 'BC',
      stateFiling: 'dummy_url'
    }
    jest.spyOn(LegalServices, 'fetchBusiness').mockImplementation((): any => {
      return Promise.resolve(sampleBusinessInfo)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadBusinessInfo')
    expect(LegalServices.fetchBusiness).toHaveBeenCalled()
    expect(store.getters.getIdentifier).toBe('BC1234567')
    expect(store.getters.getLegalType).toBe('BC')
    expect(store.getters.getStateFilingUrl).toBe('dummy_url')
  })
})
