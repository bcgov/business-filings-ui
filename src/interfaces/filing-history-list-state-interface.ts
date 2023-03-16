import { ApiFilingIF } from '@/interfaces'

/** The Filing History List module state interface. */
export interface FilingHistoryListStateIF {
  addCommentDialog: boolean
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
