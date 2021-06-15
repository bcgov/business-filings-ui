// Libraries
import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'
import axios from '@/axios-auth'

/**
 * Mixin that provides integration with the Legal API.
 */
@Component({
  computed: {
    ...mapState(['entityIncNo'])
  }
})
export default class LegalApiMixin extends Vue {
  readonly entityIncNo!: string

  /** Fetches entity info for the specified business ID. */
  async fetchEntityInfo (businessId: string): Promise<any> {
    const url = `businesses/${businessId}`
    return axios.get(url)
  }

  /** Fetches tasks list for the specified business ID. */
  fetchTasks (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/tasks`
    return axios.get(url)
  }

  /**
   * Fetches filings list for the specified business ID.
   */
  async fetchFilings (businessId: string): Promise<any> {
    // TODO: revert before final commit
    const config = { baseURL: 'https://legal-api-7195.apps.silver.devops.gov.bc.ca/api/v1/' }
    const url = `businesses/${businessId}/filings`
    return axios.get(url, config)
  }

  /** Fetches addresses for the specified business ID. */
  async fetchAddresses (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/addresses`
    return axios.get(url)
  }

  /** Fetches directors list for the specified business ID. */
  async fetchDirectors (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/directors`
    return axios.get(url)
  }

  /**
   * Fetches the Incorp App filing for the specified temporary registration number.
   * This assumes a single filing is returned.
   */
  async fetchIncorpApp (tempRegNumber: string): Promise<any> {
    const url = `businesses/${tempRegNumber}/filings`
    return axios.get(url)
      // workaround because data is at "response.data.data"
      .then(response => Promise.resolve(response.data))
  }

  /** Fetches Name Request data for the specified NR number. */
  async fetchNameRequest (nrNumber: string): Promise<any> {
    const url = `nameRequests/${nrNumber}`
    return axios.get(url)
      // workaround because data is at "response.data.data"
      .then(response => Promise.resolve(response.data))
  }

  /**
   * Fetches a filing.
   * @param businessId the business identifier (aka entity inc no)
   * @param filingId the filing identifier
   * @returns a promise to return the filing from the response
   */
  async fetchFiling (businessId: string, filingId: number): Promise<any> {
    const url = `businesses/${businessId}/filings/${filingId}`
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
   * Fetches a filing's comments list.
   * @param url the full URL to fetch the comments
   * @returns a promise to return the comments from the response
   */
  async fetchComments (url: string): Promise<any> {
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
   * Fetches a filing's documents list.
   * @param url the full URL to fetch the documents
   * @returns a promise to return the documents from the response
   */
  async fetchDocuments (url: string): Promise<any> {
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
   * Fetches one document and prompts browser to open/save it.
   * See also PayApiMixin::fetchOneReceipt().
   * @param document the document info object
   */
  async fetchOneDocument (document: any): Promise<void> {
    // safety checks
    if (!document.filingId || !document.filename) return

    let url = `businesses/${this.entityIncNo}/filings/${document.filingId}`

    // add report type if we have it (ie, for Notice of Articles or Certificate)
    if (document.reportType) {
      url += `?type=${document.reportType}`
    }

    const config = {
      headers: { 'Accept': 'application/pdf' },
      responseType: 'blob' as 'json'
    }

    return axios.get(url, config).then(response => {
      if (response) throw new Error('Null response')

      /* solution from https://github.com/axios/axios/issues/1392 */

      // it is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const blob = new Blob([response.data], { type: 'application/pdf' })

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, document.filename)
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
