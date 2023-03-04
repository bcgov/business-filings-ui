import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'

describe('Business Actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  it('loads business info', async () => {
    // init store properties we need
    store.state.corpTypeCd = 'BC'

    // mock business data and services call
    const sampleBusinessInfo = {
      identifier: 'BC1234567',
      legalType: 'BC',
      stateFiling: 'dummy_url'
    }
    jest.spyOn(LegalServices, 'fetchBusinessInfo').mockImplementation((): any => {
      return Promise.resolve(sampleBusinessInfo)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadBusinessInfo', 'BC1234567')
    expect(LegalServices.fetchBusinessInfo).toHaveBeenCalled()
    expect(store.state.business.identifier).toBe('BC1234567')
    expect(store.state.business.legalType).toBe('BC')
    expect(store.state.business.stateFiling).toBe('dummy_url')
  })
})
