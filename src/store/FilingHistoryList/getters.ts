import { ApiFilingIF, FilingHistoryListStateIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'

export default {
  getCurrentFiling (state: FilingHistoryListStateIF): ApiFilingIF {
    return state.currentFiling
  },

  /** The list of filings from the API. */
  getFilings (state: FilingHistoryListStateIF): ApiFilingIF[] {
    // return only the valid filings
    return state.filings.filter(filing => {
      // safety check for required fields
      if (!filing.name || !filing.displayName || !filing.effectiveDate || !filing.submittedDate || !filing.status) {
        console.log('Invalid filing =', filing) // eslint-disable-line no-console
        return false
      }
      return true
    })
  },

  /** The count of filings in the Filing History List. */
  getHistoryCount (_state: FilingHistoryListStateIF, getters: any): number {
    const filings = getters.getFilings as ApiFilingIF[]
    return filings.length
  },

  /** The index of the currently-downloading doc. */
  getLoadingOneIndex (state: FilingHistoryListStateIF): number {
    return state.loadingOneIndex
  },

  /** The currently expanded panel. */
  getPanel (state: FilingHistoryListStateIF): number {
    return state.panel
  },

  /** A pending COA filing, or undefined. */
  getPendingCoa (_state: FilingHistoryListStateIF, getters: any, _rootState: any, rootGetters: any): ApiFilingIF {
    const filings = getters.getFilings as ApiFilingIF[]
    return filings.find(filing => {
      return (
        rootGetters.isBenBcCccUlc &&
        EnumUtilities.isTypeChangeOfAddress(filing) &&
        filing.isFutureEffective &&
        EnumUtilities.isStatusPaid(filing) &&
        DateUtilities.isDateFuture(filing.effectiveDate)
      )
    })
  },

  /** Whether the Add Comment dialog should be displayed. */
  isAddCommentDialog (state: FilingHistoryListStateIF): boolean {
    return state.addCommentDialog
  },

  /** Whether the Download Error dialog should be displayed. */
  isDownloadErrorDialog (state: FilingHistoryListStateIF): boolean {
    return state.downloadErrorDialog
  },

  /** Whether the File Correction dialog should be displayed. */
  isFileCorrectionDialog (state: FilingHistoryListStateIF): boolean {
    return state.fileCorrectionDialog
  },

  /** Whether the Load Correction dialog should be displayed. */
  isLoadCorrectionDialog (state: FilingHistoryListStateIF): boolean {
    return state.loadCorrectionDialog
  },

  /** Whether all documents are downloading. */
  isLoadingAll (state: FilingHistoryListStateIF): boolean {
    return state.loadingAll
  },

  /** Whether one document is downloading. */
  isLoadingOne (state: FilingHistoryListStateIF): boolean {
    return state.loadingOne
  }
}
