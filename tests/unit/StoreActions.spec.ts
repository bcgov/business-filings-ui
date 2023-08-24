import LegalServices from '@/services/legal-services'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import { useRootStore } from '@/stores/rootStore'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

describe('Business Actions', () => {
  setActivePinia(createPinia())
  const businessStore = useBusinessStore()
  const rootStore = useRootStore()

  it('loads dissolution state filing', async () => {
    // init store properties we need
    businessStore.setStateFiling('dummy_url')
    rootStore.corpTypeCd = CorpTypeCd.BENEFIT_COMPANY

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
    vi.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await rootStore.loadStateFiling()
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(rootStore.stateFiling.business.identifier).toBe('BC0871273')
    expect(rootStore.stateFiling.dissolution.dissolutionDate).toBe('2023-01-13')
    expect(rootStore.stateFiling.header.name).toBe('dissolution')
  })

  it('loads consent to continuation out state filing', async () => {
    // init store properties we need
    businessStore.setStateFiling('dummy_url')
    rootStore.corpTypeCd = CorpTypeCd.BENEFIT_COMPANY

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
    vi.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleStateFiling)
    })

    // call the action and verify the data in the store
    await rootStore.loadStateFiling()
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(rootStore.stateFiling.business.identifier).toBe('BC0871273')
    expect(rootStore.stateFiling.consentContinuationOut.expiry).toBe('2023-12-31')
    expect(rootStore.stateFiling.header.name).toBe('consentContinuationOut')
  })
})
