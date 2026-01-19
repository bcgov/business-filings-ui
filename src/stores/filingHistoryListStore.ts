import { ApiFilingIF, CommentIF, DocumentIF, FilingHistoryListStateIF } from '@/interfaces'
import { BusinessServices, DateUtilities, EnumUtilities } from '@/services'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { defineStore } from 'pinia'
import { useBusinessStore } from './businessStore'
import { IsAuthorized } from '@/utils'
import { AuthorizedActions } from '@/enums'

export const useFilingHistoryListStore = defineStore('filingHistoryList', {
  state: (): FilingHistoryListStateIF => ({
    currentFiling: null,
    downloadErrorDialog: false,
    fileCorrectionDialog: false,
    filings: [],
    loadingAll: false,
    loadCorrectionDialog: false,
    loadingOne: false,
    loadingOneIndex: -1,
    panel: null
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

    /** The count of filings in the Filing History List. */
    getHistoryCount (): number {
      return this.getFilings.length
    },

    /** The index of the currently-downloading doc. */
    getLoadingOneIndex (state: FilingHistoryListStateIF): number {
      return state.loadingOneIndex
    },

    /** A pending COA filing, or undefined. */
    getPendingCoa (): ApiFilingIF {
      const businessStore = useBusinessStore()
      const filings = this.getFilings as ApiFilingIF[]
      return filings.find(filing => {
        return (
          businessStore.isBaseCompany &&
          EnumUtilities.isTypeChangeOfAddress(filing) &&
          filing.isFutureEffective &&
          EnumUtilities.isStatusPaid(filing) &&
          DateUtilities.isDateFuture(filing.effectiveDate)
        )
      })
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
    setCurrentFiling (val: ApiFilingIF) {
      this.currentFiling = val
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
    },

    /** Loads the comments for this history item. */
    async loadComments (filing: ApiFilingIF): Promise<void> {
      try {
        // fetch comments array from API
        const comments = await BusinessServices.fetchComments(filing.commentsLink)
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
      try {
        // fetch documents object from API
        const documents = await BusinessServices.fetchDocuments(filing.documentsLink)
        // load each type of document
        filing.documents = []
        // Get identifier and if current user is staff then store in local variables
        const identifier = businessStore.getIdentifier
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
          } else if (prop === 'staticDocuments' && Array.isArray(documents.staticDocuments)) {
            // iterate over staticDocuments array
            for (const document of documents.staticDocuments) {
              const title = document.name
              const filename = title
              const link = document.url
              pushDocument(title, filename, link)
            }
          } else if (prop === 'uploadedCourtOrder') {
            const fileNumber = filing.data?.order?.fileNumber || '[unknown]'
            const title = IsAuthorized(AuthorizedActions.STAFF_FILINGS)
              ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
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
    }
  }
})
