import { ApiFilingIF, FilingHistoryListStateIF } from '@/interfaces'
import { BusinessServices, DateUtilities } from '@/services'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { defineStore } from 'pinia'

export const useFilingHistoryListStore = defineStore('filingHistoryList', {
  state: (): FilingHistoryListStateIF => ({
    filings: []
  }),

  getters: {
    /** The list of filings from the API. */
    getFilings (state: FilingHistoryListStateIF): ApiFilingIF[] {
      // return only the valid filings
      return state.filings.filter(filing => {
        // safety check for required fields
        if (!filing.name || !filing.displayName || !filing.effectiveDate || !filing.submittedDate || !filing.status) {
          // eslint-disable-next-line no-console
          console.log('Invalid filing =', filing)
          return false
        } else if (filing.displayLedger === false) {
          // eslint-disable-next-line no-console
          console.log('Not shown filing on the ledger =', filing)
          return false
        }
        return true
      })
    },

    /** The function to compute total AGM extension duration. Requires argument for AGM Year. */
    getTotalAgmExtensionDuration (state: FilingHistoryListStateIF): (year: number) => number {
      return (year: number) => {
        return state.filings.reduce((totalMonths, filing) => {
          // Skip if not AGM_EXTENSION
          if (filing.name !== FilingTypes.AGM_EXTENSION) {
            return totalMonths
          }
          const filingExtension = filing.data?.agmExtension
          // Skip if extension data is missing
          if (!filingExtension) {
            return totalMonths
          }
          // Cast year as number
          // Skip if years don't match
          if (Number(filingExtension.year) !== year) {
            return totalMonths
          }
          // Add total months for the specific AGM year
          totalMonths += filingExtension.extensionDuration || 0
          return totalMonths
        }, 0)
      }
    },

    /** Whether the business is authorized to continue out, i.e. true if cco expiry date is present or in the future. */
    isAuthorizedToContinueOut (state: FilingHistoryListStateIF): boolean {
      const ccoFiling = state.filings.find(val => {
        const exp = val.data?.consentContinuationOut?.expiry
        if (exp) {
          return true
        }
        return false
      })
      if (ccoFiling) {
        const exp = ccoFiling.data?.consentContinuationOut?.expiry
        const ccoExpiryDate = DateUtilities.apiToDate(exp)
        return ccoExpiryDate >= new Date()
      }
      return false
    },

    /** Whether the business is authorized to amalgamate out,
     * i.e. true if cao expiry date is present or in the future. */
    isAuthorizedToAmalgamateOut (state: FilingHistoryListStateIF): boolean {
      const caoFiling = state.filings.find(val => {
        const exp = val.data?.consentAmalgamationOut?.expiry
        if (exp) {
          return true
        }
        return false
      })
      if (caoFiling) {
        const exp = caoFiling.data?.consentAmalgamationOut?.expiry
        const caoExpiryDate = DateUtilities.apiToDate(exp)
        return caoExpiryDate >= new Date()
      }
      return false
    }
  },

  actions: {
    /**
     * Fetches the filings list for the specified id from the Legal API and,
     * if successful, saves it in the store.
     * @param context the Vuex context (passed in automatically)
     * @param id a business id or temporary registration number
     */
    loadFilings (id: string): Promise<any> {
      // need to return a promise
      return new Promise((resolve, reject) => {
        BusinessServices.fetchFilings(id)
          .then(filings => {
            this.setFilings(filings)
            // return the filings list
            resolve(filings)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    setFilings (val: ApiFilingIF[]): void {
      // add some properties to each filing
      // so they're not null (and therefore non-reactive)
      const filings = val.map(filing => {
        return {
          ...filing,
          comments: filing.comments || null,
          documents: filing.documents || null
        }
      })
      this.filings = filings
    }
  }
})
