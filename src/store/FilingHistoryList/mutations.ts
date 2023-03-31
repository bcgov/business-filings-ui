import { ApiFilingIF, FilingHistoryListStateIF } from '@/interfaces'

export default {
  mutateAddCommentDialog (state: FilingHistoryListStateIF, val: boolean) {
    state.addCommentDialog = val
  },

  mutateCurrentFiling (state: FilingHistoryListStateIF, val: ApiFilingIF) {
    state.currentFiling = val
  },

  mutateDownloadErrorDialog (state: FilingHistoryListStateIF, val: boolean) {
    state.downloadErrorDialog = val
  },

  mutateFileCorrectionDialog (state: FilingHistoryListStateIF, val: boolean) {
    state.fileCorrectionDialog = val
  },

  mutateFilings (state: FilingHistoryListStateIF, val: ApiFilingIF[]) {
    state.filings = val
  },

  mutateLoadingAll (state: FilingHistoryListStateIF, val: boolean) {
    state.loadingAll = val
  },

  mutateLoadCorrectionDialog (state: FilingHistoryListStateIF, val: boolean) {
    state.loadCorrectionDialog = val
  },

  mutateLoadingOne (state: FilingHistoryListStateIF, val: boolean) {
    state.loadingOne = val
  },

  mutateLoadingOneIndex (state: FilingHistoryListStateIF, val: number) {
    state.loadingOneIndex = val
  },

  mutatePanel (state: FilingHistoryListStateIF, val: number) {
    state.panel = val
  }
}
