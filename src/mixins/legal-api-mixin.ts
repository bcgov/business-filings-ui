// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { CommonMixin } from '@/mixins'
import { CommentIF, DocumentIF } from '@/interfaces'

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
    // *** TODO: revert before final commit
    // return axios.get(url)
    return {
      data: {
        business: {
          arMaxDate: '2021-09-09',
          arMinDate: '2021-01-01',
          fiscalYearEndDate: '2020-09-01',
          foundingDate: '1970-10-14T00:00:00+00:00',
          goodStanding: true,
          hasRestrictions: false,
          identifier: businessId,
          lastAnnualGeneralMeetingDate: '2020-11-17',
          lastAnnualReport: '2020-11-17',
          lastLedgerTimestamp: '2019-07-16T00:00:00+00:00',
          lastModified: '2020-09-01T20:45:54.805676+00:00',
          legalName: 'THE WATERFRONT CONSUMER\'S CO-OPERATIVE',
          legalType: 'CP',
          nextAnnualReport: '2021-11-17T08:00:00+00:00'
        }
      }
    }
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
    // *** TODO: revert before final commit
    // const url = `businesses/${businessId}/filings`
    const url = `https://legal-api-dev-pr.apps.silver.devops.gov.bc.ca/api/v1/businesses/${businessId}/filings`
    return axios.get(url)
  }

  /**
   * Fetches addresses.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the addresses from the response
   */
  async fetchAddresses (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/addresses`
    // *** TODO: revert before final commit
    // return axios.get(url)
    return {
      data: {
        registeredOffice: {
          deliveryAddress: {
            addressCity: 'Victoria',
            addressCountry: 'CA',
            addressRegion: 'BC',
            addressType: 'delivery',
            deliveryInstructions: 'go to 1000X',
            postalCode: '1000',
            streetAddress: '1000 Douglas St',
            streetAddressAdditional: 'Suite 1000X'
          },
          mailingAddress: {
            addressCity: 'Victoria',
            addressCountry: 'CA',
            addressRegion: 'BC',
            addressType: 'mailing',
            deliveryInstructions: 'go to 2000X',
            postalCode: '2000',
            streetAddress: '2000 Douglas St',
            streetAddressAdditional: 'Suite 2000X'
          }
        }
      }
    }
  }

  /**
   * Fetches directors list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns a promise to return the directors from the response
   */
  async fetchDirectors (businessId: string): Promise<any> {
    const url = `businesses/${businessId}/directors`
    // *** TODO: revert before final commit
    // return axios.get(url)
    return {
      data: {
        directors: [
          {
            appointmentDate: '2020-11-15',
            cessationDate: null,
            deliveryAddress: {
              addressCity: 'Victoria',
              addressCountry: 'CA',
              addressRegion: 'BC',
              deliveryInstructions: 'go to 2000X',
              postalCode: 'V9A 7G1',
              streetAddress: '1318 Treebank Rd W',
              streetAddressAdditional: 'Suite 2000X'
            },
            officer: {
              firstName: 'EILEEN',
              lastName: 'BEAUVAIS'
            },
            role: 'director'
          },
          {
            appointmentDate: '2020-11-15',
            cessationDate: null,
            deliveryAddress: {
              addressCity: 'Victoria',
              addressCountry: 'CA',
              addressRegion: 'BC',
              deliveryInstructions: 'go to 1000X',
              postalCode: 'V9A 7G1',
              streetAddress: '1318 Treebank Rd W',
              streetAddressAdditional: 'Suite 1000X'
            },
            officer: {
              firstName: 'SEVERIN',
              lastName: 'BEAUVAIS'
            },
            role: 'director'
          }
        ]
      }
    }
  }

  /**
   * Fetches the Incorp App filing.
   * This assumes a single filing is returned.
   * @param tempRegNumber the temporary registration number
   * @returns a promise to return the filing from the response
   */
  async fetchIncorpApp (tempRegNumber: string): Promise<any> {
    // *** TODO: revert before final commit
    // const url = `businesses/${businessId}/filings`
    const url = `https://legal-api-dev-pr.apps.silver.devops.gov.bc.ca/api/v1/businesses/${tempRegNumber}/filings`
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
   * Fetches comments list.
   * @param url the full URL to fetch the comments
   * @returns a promise to return the comments from the response
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
   * Fetches documents list.
   * @param url the full URL to fetch the documents
   * @returns a promise to return the documents from the response
   */
  async fetchDocuments (url: string): Promise<DocumentIF[]> {
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
      .catch(e => {
        // *** TODO: remove when API provides this
        return [
          {
            type: 'REPORT',
            title: 'Sample Document 1',
            filename: 'document1.pdf',
            link: null
          },
          {
            type: 'REPORT',
            title: 'Sample Document 2',
            filename: 'document1.pdf',
            link: null
          },
          {
            type: 'RECEIPT',
            corpName: 'Sample Corp',
            filingDateTime: '2021-01-01T20:00:00Z',
            paymentToken: '123',
            title: 'Sample Receipt',
            filename: 'receipt.pdf',
            link: null
          }
        ]
      })
  }

  /**
   * Fetches a document and prompts browser to open/save it.
   * See also PayApiMixin::fetchReceipt().
   * @param document the document info object
   */
  async fetchDocument (entityIncNo: string, document: any): Promise<any> {
    // safety checks
    if (!entityIncNo || !document.filingId || !document.filename) return

    let url = `businesses/${entityIncNo}/filings/${document.filingId}`

    // add report type if we have it (ie, for Notice of Articles or Certificate)
    if (document.reportType) {
      url += `?type=${document.reportType}`
    }

    const config = {
      headers: { 'Accept': 'application/pdf' },
      responseType: 'blob' as 'json'
    }

    return axios.get(url, config).then(response => {
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
