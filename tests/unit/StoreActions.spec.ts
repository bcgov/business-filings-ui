import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'

describe('Business Actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  it('loads dissolution state filing', async () => {
    // init store properties we need
    store.commit('setStateFiling', 'dummy_url')
    store.state.corpTypeCd = 'BEN'

    // mock filing data and services call
    const sampleStateFiling = {
      business: {
        identifier: 'BC0871273'
      },
      dissolution: {
        dissolutionDate: '2023-01-13'
      },
      header: {
        name: 'dissolution'
      }
    }
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadStateFiling')
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(store.state.stateFiling.business.identifier).toBe('BC0871273')
    expect(store.state.stateFiling.dissolution.dissolutionDate).toBe('2023-01-13')
    expect(store.state.stateFiling.header.name).toBe('dissolution')
  })

  it('loads consent to continuation out state filing', async () => {
    // init store properties we need
    store.commit('setStateFiling', 'dummy_url')
    store.state.corpTypeCd = 'BEN'

    // mock filing data and services call
    const sampleStateFiling = {
      business: {
        identifier: 'BC0871273'
      },
      consentContinuationOut: {
        expiry: '2023-12-31'
      },
      header: {
        name: 'consentContinuationOut'
      }
    }
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await store.dispatch('loadStateFiling')
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(store.state.stateFiling.business.identifier).toBe('BC0871273')
    expect(store.state.stateFiling.consentContinuationOut.expiry).toBe('2023-12-31')
    expect(store.state.stateFiling.header.name).toBe('consentContinuationOut')
  })
})
