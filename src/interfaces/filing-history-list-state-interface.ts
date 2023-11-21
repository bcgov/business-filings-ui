import { ApiFilingIF } from '@/interfaces'
import { FilingRegistraionIF } from './filing-registration-interface'

/** The state model interface for the Filing History List Store. */
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
  panel: number,
  registrationFiling: FilingRegistraionIF
}
