import { ApiFilingIF } from '@/interfaces'

/** The state model interface for the Filing History List Store. */
export interface FilingHistoryListStateIF {
  currentFiling: ApiFilingIF
  downloadErrorDialog: boolean
  fileCorrectionDialog: boolean
  filings: ApiFilingIF[]
  loadingAll: boolean
  loadCorrectionDialog: boolean
  loadingOne: boolean
  loadingOneIndex: number
  panel: number
}
