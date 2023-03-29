import { FilingTypes } from '@bcrs-shared-components/enums'
import { ApiFilingIF, CommentIF, DocumentIF } from '@/interfaces'
import { DateUtilities, EnumUtilities, LegalServices } from '@/services/'

export default {
  /**
   * Fetches the filings list from the Legal API and, if successful, triggers some mutations.
   * @param context the Vuex context (passed in automatically)
   */
  loadFilings ({ dispatch }): Promise<any> {
    // need to return a promise because action is called via dispatch
    return new Promise((resolve, reject) => {
      const businessId = sessionStorage.getItem('BUSINESS_ID')
      const tempRegNumber = sessionStorage.getItem('TEMP_REG_NUMBER')

      // if there is no business id, return error
      if (!businessId && !tempRegNumber) {
        reject(new Error('Missing business id or temp reg number'))
        return
      }

      LegalServices.fetchFilings(businessId || tempRegNumber)
        .then(filings => {
          dispatch('setFilings', filings)
          // return the filings list
          resolve(filings)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  setFilings ({ commit }, val: ApiFilingIF[]): void {
    // add some properties to each filing
    // so they're not null (and therefore non-reactive)
    const filings = val.map(filing => {
      return {
        ...filing,
        comments: filing.comments || null,
        documents: filing.documents || null
      }
    })
    commit('mutateFilings', filings)
  },

  /** Closes current panel or opens new panel and loads comments and documents. */
  toggleFilingHistoryItem ({ commit, dispatch, getters }, index: number): Promise<void> {
    // need to return a promise because action is called via dispatch
    return new Promise(async resolve => {
      const isCurrentPanel = (getters.getPanel === index)

      // check if we're opening a new panel
      if (!isCurrentPanel) {
        // get a reference to the filing so we can update it right in the main list
        const filing = getters.getFilings[index]

        // check if we're missing comments or documents
        const promises: Array<Promise<void>> = []
        if (filing.commentsLink && !filing.comments) promises.push(dispatch('loadComments', filing))
        if (filing.documentsLink && !filing.documents) promises.push(dispatch('loadDocuments', filing))

        if (promises.length > 0) {
          commit('mutateFetchingDataSpinner', true)

          // NB: errors are handled in loadComments() and loadDocuments()
          await Promise.all(promises)

          // leave busy spinner displayed another 250ms
          // (to mitigate flashing when the promises are resolved quickly)
          setTimeout(() => { commit('mutateFetchingDataSpinner', false) }, 250)
        }
      }

      commit('mutatePanel', isCurrentPanel ? null : index)
      resolve()
    })
  },

  /** Loads the comments for this history item. */
  async loadComments ({ commit }, filing: ApiFilingIF): Promise<void> {
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
  async loadDocuments ({ getters }, filing: ApiFilingIF): Promise<void> {
    try {
      // fetch documents object from API
      const documents = await LegalServices.fetchDocuments(filing.documentsLink)
      // load each type of document
      filing.documents = []
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
              const filename = `${getters.getIdentifier} ${title} - ${date}.pdf`
              const link = legalFiling[prop]
              pushDocument(title, filename, link)
            }
          }
        } else if (prop === 'uploadedCourtOrder') {
          const fileNumber = filing.data?.order?.fileNumber || '[unknown]'
          const title = getters.isRoleStaff ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
          const filename = title
          const link = documents[prop] as string
          pushDocument(title, filename, link)
        } else {
          // this is a submission level output
          const title = EnumUtilities.camelCaseToWords(prop)
          const date = DateUtilities.dateToYyyyMmDd(new Date(filing.submittedDate))
          const filename = `${getters.getIdentifier} ${title} - ${date}.pdf`
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

  showCommentDialog ({ commit }, filing: ApiFilingIF): void {
    commit('mutateCurrentFiling', filing)
    commit('mutateAddCommentDialog', true)
  },

  hideCommentDialog ({ commit, dispatch, getters }, needReload: boolean): Promise<void> {
    // need to return a promise because action is called via dispatch
    return new Promise(resolve => {
      commit('mutateAddCommentDialog', false)

      // if needed, reload comments for current filing
      if (needReload) {
        if (getters.getCurrentFiling?.commentsLink) { // safety check
          commit('mutateFetchingDataSpinner', true)
          dispatch('loadComments', getters.getCurrentFiling)
            .finally(() => {
              // leave busy spinner displayed another 250ms
              // (to mitigate flashing when the promises are resolved quickly)
              setTimeout(() => { commit('mutateFetchingDataSpinner', false) }, 250)
            })
        }
      }
      resolve()
    })
  }
}
