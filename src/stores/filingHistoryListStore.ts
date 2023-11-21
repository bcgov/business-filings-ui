import { ApiFilingIF, CommentIF, DocumentIF, FilingHistoryListStateIF } from '@/interfaces'
import { DateUtilities, EnumUtilities, LegalServices } from '@/services'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { defineStore } from 'pinia'
import { useBusinessStore } from './businessStore'
import { useRootStore } from './rootStore'

export const useFilingHistoryListStore = defineStore('filingHistoryList', {
  state: (): FilingHistoryListStateIF => ({
    addCommentDialog: false,
    currentFiling: null,
    downloadErrorDialog: false,
    fileCorrectionDialog: false,
    filings: [],
    loadingAll: false,
    loadCorrectionDialog: false,
    loadingOne: false,
    loadingOneIndex: -1,
    panel: null,
    registrationFiling: null
  }),

  getters: {
    getCurrentFiling (state: FilingHistoryListStateIF): ApiFilingIF {
      return state.currentFiling
    },

    /** The list of filings from the API. */
    getFilings (state: FilingHistoryListStateIF): ApiFilingIF[] {
      // return only the valid filings
      return state.filings.filter(filing => {
        // safety check for required fields
        if (!filing.name || !filing.displayName || !filing.effectiveDate || !filing.submittedDate || !filing.status) {
          // eslint-disable-next-line no-console
          console.log('Invalid filing =', filing)
          return false
        }
        return true
      })
    },

    /** The count of filings in the Filing History List. */
    getHistoryCount (): number {
      const filings = this.getFilings as ApiFilingIF[]
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
    getPendingCoa (): ApiFilingIF {
      const businessStore = useBusinessStore()
      const filings = this.getFilings as ApiFilingIF[]
      return filings.find(filing => {
        return (
          businessStore.isBenBcCccUlc &&
          EnumUtilities.isTypeChangeOfAddress(filing) &&
          filing.isFutureEffective &&
          EnumUtilities.isStatusPaid(filing) &&
          DateUtilities.isDateFuture(filing.effectiveDate)
        )
      })
    },

    getRegistrationFiling (state: FilingHistoryListStateIF): any | undefined {
      return state.registrationFiling
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
    }
  },

  actions: {
    setCurrentFiling (val: ApiFilingIF) {
      this.currentFiling = val
    },

    setDownloadErrorDialog (val: boolean) {
      this.downloadErrorDialog = val
    },

    setFileCorrectionDialog (val: boolean) {
      this.fileCorrectionDialog = val
    },

    setLoadingAll (val: boolean) {
      this.loadingAll = val
    },

    setLoadCorrectionDialog (val: boolean) {
      this.loadCorrectionDialog = val
    },

    setLoadingOne (val: boolean) {
      this.loadingOne = val
    },

    setLoadingOneIndex (val: number) {
      this.loadingOneIndex = val
    },

    setPanel (val: number) {
      this.panel = val
    },

    /**
     * Fetches the filings list for the specified id from the Legal API and,
     * if successful, saves it in the store.
     * @param context the Vuex context (passed in automatically)
     * @param id a business id or temporary registration number
     */
    async loadFilings (id: string): Promise<ApiFilingIF[]> {
      try {
        const filings = await LegalServices.fetchFilings(id)
        this.setFilings(filings)
        return filings
      } catch (error) {
        console.log('loadFilings() error =', error)
      }
    },

    /**
     * Loads a specific filing from the Legal API and,
     * if successful, saves it in the store.
     * @param context the Vuex context (passed in automatically)
     */
    async loadRegistrationFiling (): Promise<ApiFilingIF> {
      try {
        const registration = this.getFilings.find((filing: ApiFilingIF) =>
          filing.data?.legalFilings?.includes(FilingTypes.REGISTRATION))
        const filing = await LegalServices.fetchFiling(registration.filingLink)
        this.setRegistrationFiling(filing)
        return filing
      } catch (error) {
        console.log('loadRegistrationFiling() error =', error)
      }
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
    },

    setRegistrationFiling (val: ApiFilingIF): void {
      // add some properties to each filing
      // so they're not null (and therefore non-reactive)
      const filing = {
        ...val,
        comments: val?.comments || null,
        documents: val?.documents || null
      }
      this.registrationFiling = filing
    },

    /** Closes current panel or opens new panel and loads comments and documents. */
    async toggleFilingHistoryItem (index: number): Promise<void> {
      const rootStore = useRootStore()
      try {
        const isCurrentPanel = (this.getPanel === index)

        // check if we're opening a new panel
        if (!isCurrentPanel) {
        // get a reference to the filing so we can update it right in the main list
          const filing = this.getFilings[index]

          // check if we're missing comments or documents
          const promises: Array<Promise<void>> = []
          if (filing.commentsLink && !filing.comments) promises.push(this.loadComments(filing))
          if (filing.documentsLink && !filing.documents) promises.push(this.loadDocuments(filing))

          if (promises.length > 0) {
            rootStore.setFetchingDataSpinner(true)

            // NB: errors are handled in loadComments() and loadDocuments()
            await Promise.all(promises)

            // leave busy spinner displayed another 250ms
            // (to mitigate flashing when the promises are resolved quickly)
            setTimeout(() => { rootStore.setFetchingDataSpinner(false) }, 250)
          }
        }

        this.setPanel(isCurrentPanel ? null : index)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('toggleFilingHistoryItem() error =', error)
      }
    },

    /** Loads the comments for this history item. */
    async loadComments (filing: ApiFilingIF): Promise<void> {
      try {
        // fetch comments array from API
        const comments = await LegalServices.fetchComments(filing.commentsLink)
        // flatten and sort the comments
        filing.comments = flattenAndSortComments(comments)
      } catch (error) {
        // set property to null to retry next time
        filing.comments = null
        // eslint-disable-next-line no-console
        console.log('loadComments() error =', error)
        // FUTURE: enable some error dialog?
      }
      // update comments count
      filing.commentsCount = filing.comments?.length || 0

      /** Flattens and sorts an array of comments. */
      function flattenAndSortComments (comments: Array<CommentIF>): Array<CommentIF> {
        if (comments && comments.length > 0) {
          // first use map to change comment.comment to comment
          const temp: Array<any> = comments.map(c => c.comment)
          // then sort newest to oldest
          // NB: these `new Date()` are safe because we're comparing like units
          temp.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1)
          return temp
        }
        return []
      }
    },

    /** Loads the documents for this history item. */
    async loadDocuments (filing: ApiFilingIF): Promise<void> {
      const businessStore = useBusinessStore()
      const rootStore = useRootStore()
      try {
        // fetch documents object from API
        const documents = await LegalServices.fetchDocuments(filing.documentsLink)
        // load each type of document
        filing.documents = []
        // Get identifier and if current user is staff then store in local variables
        const identifier = businessStore.getIdentifier
        const isStaff = rootStore.isRoleStaff
        // iterate over documents properties
        for (const prop in documents) {
          if (prop === 'legalFilings' && Array.isArray(documents.legalFilings)) {
          // iterate over legalFilings array
            for (const legalFiling of documents.legalFilings) {
            // iterate over legalFiling properties
              for (const prop in legalFiling) {
              // this is a legal filing output
                let title: string
                // use display name for primary document's title
                if (prop === filing.name) title = filing.displayName
                else title = EnumUtilities.filingTypeToName(prop as FilingTypes, null)

                const date = DateUtilities.dateToYyyyMmDd(new Date(filing.submittedDate))
                const filename = `${identifier} ${title} - ${date}.pdf`
                const link = legalFiling[prop]
                pushDocument(title, filename, link)
              }
            }
          } else if (prop === 'uploadedCourtOrder') {
            const fileNumber = filing.data?.order?.fileNumber || '[unknown]'
            const title = isStaff ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
            const filename = title
            const link = documents[prop] as string
            pushDocument(title, filename, link)
          } else {
            // this is a submission level output
            const title = EnumUtilities.camelCaseToWords(prop)
            const date = DateUtilities.dateToYyyyMmDd(new Date(filing.submittedDate))
            const filename = `${businessStore.getIdentifier} ${title} - ${date}.pdf`
            const link = documents[prop] as string
            pushDocument(title, filename, link)
          }
        }
      } catch (error) {
        // set property to null to retry next time
        filing.documents = null
        // eslint-disable-next-line no-console
        console.log('loadDocuments() error =', error)
        // FUTURE: enable some error dialog?
      }

      function pushDocument (title: string, filename: string, link: string) {
        if (title && filename && link) {
          filing.documents.push({ title, filename, link } as DocumentIF)
        } else {
          // eslint-disable-next-line no-console
          console.log(`invalid document = ${title} | ${filename} | ${link}`)
        }
      }
    },

    showCommentDialog (filing: ApiFilingIF): void {
      this.currentFiling = filing
      this.addCommentDialog = true
    },

    async hideCommentDialog (needReload: boolean): Promise<void> {
      const rootStore = useRootStore()
      try {
        this.addCommentDialog = false

        // if needed, reload comments for current filing
        if (needReload) {
          if (this.getCurrentFiling?.commentsLink) { // safety check
            rootStore.setFetchingDataSpinner(true)
            await this.loadComments(this.getCurrentFiling)
            setTimeout(() => { rootStore.setFetchingDataSpinner(false) }, 250)
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('hideCommentDialog() error =', error)
      }
    }
  }
})
