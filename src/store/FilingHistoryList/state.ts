import { FilingHistoryListStateIF } from '@/interfaces'

export const state: FilingHistoryListStateIF = {
  addCommentDialog: false,
  currentFiling: null,
  downloadErrorDialog: false,
  fileCorrectionDialog: false,
  filings: [],
  loadingAll: false,
  loadCorrectionDialog: false,
  loadingOne: false,
  loadingOneIndex: -1,
  panel: null
}
