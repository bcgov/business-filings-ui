import LegalServices from '@/services/legal-services'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { vi } from 'vitest'

describe('Business Actions', () => {
  setActivePinia(createPinia())
  const businessStore = useBusinessStore()
  const rootStore = useRootStore()

  it('loads business info', async () => {
    // set session storage we need
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')

    // init store properties we need
    rootStore.corpTypeCd = CorpTypeCd.BC_COMPANY

    // mock business data and services call
    const sampleBusinessInfo = {
      identifier: 'BC1234567',
      legalType: 'BC',
      stateFiling: 'dummy_url'
    }
    vi.spyOn(LegalServices, 'fetchBusiness').mockImplementation((): any => {
      return Promise.resolve(sampleBusinessInfo)
    })

    // call the action and verify the data in the store
    await businessStore.loadBusinessInfo()
    expect(LegalServices.fetchBusiness).toHaveBeenCalled()
    expect(businessStore.getIdentifier).toBe('BC1234567')
    expect(businessStore.getLegalType).toBe('BC')
    expect(businessStore.getStateFilingUrl).toBe('dummy_url')
  })
})
