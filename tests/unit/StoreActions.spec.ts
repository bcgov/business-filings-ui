import LegalServices from '@/services/legal-services'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore, useFilingHistoryListStore } from '@/stores'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypes } from '@/enums'
import { ApiFilingIF } from '@/interfaces'

describe('Business Actions', () => {
  setActivePinia(createPinia())
  const businessStore = useBusinessStore()
  const rootStore = useRootStore()
  const filingHistoryListStore = useFilingHistoryListStore()

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

  it('loads registration filing', async () => {
    // init store properties we need
    businessStore.setStateFiling('dummy_url')
    rootStore.corpTypeCd = CorpTypeCd.SOLE_PROP
    filingHistoryListStore.setFilings([{
      availableOnPaperOnly: false,
      businessIdentifier: 'FM0001191',
      commentsCount: 2,
      commentsLink: 'businesses/FM0001191/filings/111/comments',
      filingLink: 'businesses/FM0001191/filings/111',
      displayName: 'Test',
      effectiveDate: '2023-11-32 00:00:00 GMT',
      filingId: 111,
      isFutureEffective: false,
      name: 'test',
      status: 'COMPLETED',
      submittedDate: 'Tue, 21 Nov 2023 00:00:00 GMT',
      submitter: 'Tester',
      data: {
        legalFilings: ['registration']
      }
    }] as any)

    // mock filing data and services call
    const sampleRegistrationFiling = {
      business: {
        identifier: 'FM0871273'
      },
      businessType: 'SP',
      businessTypeConfirm: true,
      contactPoint: {},
      isAutoPopulatedBusinessNumber: false,
      nameRequest: {},
      offices: {},
      parties: [
        {
          officer: {
            firstName: 'John',
            lastName: 'Doe',
            roles: ['Completing Party']
          }
        },
        {
          officer: {
            firstName: 'John',
            lastName: 'Doe',
            roles: ['Proprietor']
          }
        }
      ],
      startDate: '2021-01-01'
    }
    vi.spyOn(LegalServices, 'fetchFiling').mockImplementation((): any => {
      return Promise.resolve(sampleRegistrationFiling)
    })

    // call the action and verify the data in the store
    await filingHistoryListStore.loadRegistrationFiling()
    expect(LegalServices.fetchFiling).toHaveBeenCalled()
    expect(filingHistoryListStore.registrationFiling.business.identifier).toBe('FM0871273')
    expect(filingHistoryListStore.registrationFiling.parties.length).toBe(2)
  })
})
