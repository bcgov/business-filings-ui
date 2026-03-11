import { ApiFilingIF } from '@/interfaces'

/** The state model interface for the Filing History List Store. */
export interface FilingHistoryListStateIF {
  currentFiling: ApiFilingIF
  filings: ApiFilingIF[]
  loadingAll: boolean
  loadingOne: boolean
  loadingOneIndex: number
  panel: number
}
