import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'

describe('Business Actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  it('loads dissolution state filing', async () => {
    // init store properties we need
    store.state.corpTypeCd = 'BEN'

    // mock filing data and services call
    const sampleStateFiling = {
      business: {},
      dissolution: {},
      header: {
        name: 'dissolution'
      }
    }
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadStateFiling', 'dummy_url')
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(store.state.stateFiling).toHaveProperty('business')
    expect(store.state.stateFiling).toHaveProperty('dissolution')
    expect(store.state.stateFiling).toHaveProperty('header')
  })

  it('loads consent to continuation out state filing', async () => {
    // init store properties we need
    store.state.corpTypeCd = 'BEN'

    // mock filing data and services call
    const sampleStateFiling = {
      business: {},
      consentContinuationOut: {},
      header: {
        name: 'consentContinuationOut'
      }
    }
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadStateFiling', 'dummy_url')
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(store.state.stateFiling).toHaveProperty('business')
    expect(store.state.stateFiling).toHaveProperty('consentContinuationOut')
    expect(store.state.stateFiling).toHaveProperty('header')
  })
})
