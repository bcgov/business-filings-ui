// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { CommonMixin } from '@/mixins'
import { ApiDocumentsIF, CommentIF, DocumentIF } from '@/interfaces'
import { Roles } from '@/enums'

/**
 * Mixin that provides integration with the Legal API.
 */
@Component({})
export default class LegalApiMixin extends Mixins(CommonMixin) {
  /**
   * Fetches business info.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the info from the response
   */
  async fetchBusinessInfo (businessId: string): Promise<any> {
    const url = `businesses/${businessId}`
    return axios.get(url)
  }

  /**
   * Fetches tasks list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the tasks from the response
   */
  async fetchTasks (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/tasks`
    return axios.get(url)
  }

  /**
   * Fetches filings list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the filings from the response
   */
  async fetchFilings (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/filings`
    return axios.get(url)
  }

  /**
   * Fetches addresses.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the addresses from the response
   */
  async fetchAddresses (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/addresses`
    return axios.get(url)
  }

  /**
   * Fetches parties list.
   * @param businessId the business identifier (aka entity inc no)
   * @param role optional role to filter parties response
   * @returns a promise to return the parties from the response
   */
  async fetchParties (businessId: string, role: Roles = null): Promise<any> {
    let url = `businesses/${businessId}/parties`
    if (role) url += `?role=${role}`
    return axios.get(url)
  }

  /**
   * Fetches the Incorp App filing.
   * This is a unique request using the temp reg number.
   * This assumes a single filing is returned.
   * @param tempRegNumber the temporary registration number
   * @returns a promise to return the filing from the response
   */
  async fetchIncorpApp (tempRegNumber: string): Promise<any> {
    const url = `businesses/${tempRegNumber}/filings`
    return axios.get(url)
      // workaround because data is at "response.data.data"
      .then(response => response?.data)
  }

  /**
   * Fetches a Name Request.
   * @param filingId the NR number
   * @returns a promise to return the NR data from the response
   */
  async fetchNameRequest (nrNumber: string): Promise<any> {
    const url = `nameRequests/${nrNumber}`
    return axios.get(url)
      // workaround because data is at "response.data.data"
      .then(response => response?.data)
  }

  /**
   * Fetches a filing.
   * @param url the full URL to fetch the filing
   * @returns a promise to return the filing from the response
   */
  async fetchFiling (url: string): Promise<any> {
    return axios.get(url)
      .then(response => {
        const filing = response?.data?.filing
        if (!filing) {
          // eslint-disable-next-line no-console
          console.log('fetchFiling() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
        return filing
      })
  }

  /**
   * Creates (posts) a filing.
   * @param businessId the business identifier (aka entity inc no)
   * @param filing the object body of the request
   * @param isDraft whether this is a draft or whether to also file this filing
   * @returns a promise to return the filing from the response
   */
  async createFiling (businessId: string, filing: any, isDraft: boolean): Promise<any> {
    let url = `businesses/${businessId}/filings`
    if (isDraft) {
      url += '?draft=true'
    }
    return axios.post(url, { filing })
      .then(response => {
        const filing = response?.data?.filing
        if (!filing) {
          // eslint-disable-next-line no-console
          console.log('createFiling() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
        return filing
      })
  }

  /**
   * Updates (puts) a filing.
   * @param businessId the business identifier (aka entity inc no)
   * @param filing the object body of the request
   * @param filingId the filing identifier
   * @param isDraft whether this is a draft or whether to also file this filing
   * @returns a promise to return the filing from the response
   */
  async updateFiling (businessId: string, filing: any, filingId: number, isDraft: boolean): Promise<any> {
    let url = `businesses/${businessId}/filings/${filingId}`
    if (isDraft) {
      url += '?draft=true'
    }
    return axios.put(url, { filing })
      .then(response => {
        const filing = response?.data?.filing
        if (!filing) {
          // eslint-disable-next-line no-console
          console.log('updateFiling() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
        return filing
      })
  }

  /**
   * Fetches comments array.
   * @param url the full URL to fetch the comments
   * @returns a promise to return the comments array from the response
   */
  async fetchComments (url: string): Promise<CommentIF[]> {
    return axios.get(url)
      .then(response => {
        const comments = response?.data?.comments
        if (!comments) {
          // eslint-disable-next-line no-console
          console.log('fetchComments() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
        return comments
      })
  }

  /**
   * Fetches documents object.
   * @param url the full URL to fetch the documents
   * @returns a promise to return the documents object from the response
   */
  async fetchDocuments (url: string): Promise<ApiDocumentsIF> {
    return axios.get(url)
      .then(response => {
        const documents = response?.data?.documents
        if (!documents) {
          // eslint-disable-next-line no-console
          console.log('fetchDocuments() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
        return documents
      })
  }

  /**
   * Fetches a document and prompts browser to open/save it.
   * @param document the document info object
   */
  async fetchDocument (document: DocumentIF): Promise<any> {
    // safety checks
    if (!document?.link || !document?.filename) {
      throw new Error('Invalid parameters')
    }

    const config = {
      headers: { 'Accept': 'application/pdf' },
      responseType: 'blob' as 'json'
    }

    return axios.get(document.link, config).then(response => {
      if (!response) throw new Error('Null response')

      if (this.isJestRunning) return response

      /* solution from https://github.com/axios/axios/issues/1392 */

      // it is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const blob = new Blob([response.data], { type: 'application/pdf' })

      // use Navigator.msSaveOrOpenBlob if available (possibly IE)
      // warning: this is now deprecated
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/msSaveOrOpenBlob
      if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
        window.navigator['msSaveOrOpenBlob'](blob, document.filename)
      } else {
        // for other browsers, create a link pointing to the ObjectURL containing the blob
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        window.document.body.appendChild(a)
        a.setAttribute('style', 'display: none')
        a.href = url
        a.download = document.filename
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
    })
  }
}
