// Libraries
import axios from '@/axios-auth'
import { AxiosResponse } from 'axios'
import { ApiBusinessIF, ApiFilingIF, CommentIF, DocumentIF, FetchDocumentsIF, PresignedUrlIF }
  from '@/interfaces'
import { DigitalCredentialTypes, FilingStatus, Roles } from '@/enums'
import { StatusCodes } from 'http-status-codes'

/**
 * Class that provides integration with the Legal API.
 */
export default class LegalServices {
  /**
   * Fetches business object.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the business object
   */
  static async fetchBusiness (businessId: string): Promise<ApiBusinessIF> {
    const url = `businesses/${businessId}`
    return axios.get(url)
      .then(response => {
        const businessInfo = response?.data?.business as ApiBusinessIF
        if (!businessInfo) {
          // eslint-disable-next-line no-console
          console.log('fetchBusiness() error - invalid response =', response)
          throw new Error('Invalid business info')
        }
        return businessInfo
      })
  }

  /**
   * Fetches tasks list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchTasks (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/tasks`
    return axios.get(url)
  }

  /**
   * Fetches filings list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the filings list
   */
  static async fetchFilings (businessId: string): Promise<ApiFilingIF[]> {
    const url = `businesses/${businessId}/filings`
    return axios.get(url)
      .then(response => {
        const filings = response?.data?.filings as ApiFilingIF[]
        if (!filings) {
          // eslint-disable-next-line no-console
          console.log('fetchFilings() error - invalid response =', response)
          throw new Error('Invalid filings list')
        }
        return filings
      })
  }

  /**
   * Fetches addresses.
   * See also Directors.fetchDirectors().
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchAddresses (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/addresses`
    return axios.get(url)
  }

  /**
   * Fetches parties list.
   * @param businessId the business identifier (aka entity inc no)
   * @param role optional role to filter parties response
   * @returns the axios response
   */
  static async fetchParties (businessId: string, role: Roles = null): Promise<AxiosResponse> {
    let url = `businesses/${businessId}/parties`
    if (role) url += `?role=${role}`
    return axios.get(url)
  }

  /**
   * Fetches the draft Application filing.
   * This is a unique request using the temp reg number.
   * This assumes a single filing is returned.
   * @param tempRegNumber the temporary registration number
   * @returns the draft app response
   */
  static async fetchDraftApp (tempRegNumber: string): Promise<any> {
    const url = `businesses/${tempRegNumber}/filings`
    return axios.get(url)
      // workaround because data is at "response.data.data"
      .then(response => response?.data)
  }

  /**
   * Fetches name request data.
   * @param nrNumber the name request number (eg, NR 1234567) to fetch
   * @param phone the name request phone (eg, 12321232)
   * @param email the name request email (eg, nr@example.com)
   * @returns a promise to return the NR data, or null if not found
   */
  static async fetchNameRequest (nrNumber: string, phone = '', email = ''): Promise<any> {
    const url = `nameRequests/${nrNumber}/validate?phone=${phone}&email=${email}`

    return axios.get(url)
      .then(response => {
        if (response?.data) {
          return response.data
        }
        // eslint-disable-next-line no-console
        console.log('fetchNameRequest() error - invalid response =', response)
        throw new Error('Invalid API response')
      }).catch(error => {
        if (error?.response?.status === StatusCodes.NOT_FOUND) {
          return null // NR not found (not an error)
        } else if (error?.response?.status === StatusCodes.BAD_REQUEST) {
          throw new Error('Sent invalid email or phone number.') // Sent invalid email or phone
        } else if (error?.response?.status === StatusCodes.FORBIDDEN) {
          throw new Error('Not sent email or phone number.') // Not sent the email or phone
        }
        throw error
      })
  }

  /**
   * Fetches a filing.
   * @param url the full URL to fetch the filing
   * @returns the filing object
   */
  static async fetchFiling (url: string): Promise<any> {
    return axios.get(url)
      .then(response => {
        const filing = response?.data?.filing
        if (!filing) {
          // eslint-disable-next-line no-console
          console.log('fetchFiling() error - invalid response =', response)
          throw new Error('Invalid filing')
        }
        return filing
      })
  }

  /**
   * Creates (posts) a filing.
   * @param businessId the business identifier (aka entity inc no)
   * @param filing the object body of the request
   * @param isDraft whether this is a draft or whether to also file this filing
   * @returns the filing object
   */
  static async createFiling (businessId: string, filing: any, isDraft: boolean): Promise<any> {
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
          throw new Error('Invalid filing')
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
   * @returns the filing object
   */
  static async updateFiling (businessId: string, filing: any, filingId: number, isDraft: boolean): Promise<any> {
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
          throw new Error('Invalid filing')
        }
        return filing
      })
  }

  /**
   * Fetches comments array.
   * @param url the full URL to fetch the comments
   * @returns the comments array
   */
  static async fetchComments (url: string): Promise<CommentIF[]> {
    return axios.get(url)
      .then(response => {
        const comments = response?.data?.comments
        if (!comments) {
          // eslint-disable-next-line no-console
          console.log('fetchComments() error - invalid response =', response)
          throw new Error('Invalid comments')
        }
        return comments
      })
  }

  /**
   * Fetches documents object.
   * @param url the full URL to fetch the documents
   * @returns the fetch documents object
   */
  static async fetchDocuments (url: string): Promise<FetchDocumentsIF> {
    return axios.get(url)
      .then(response => {
        const documents = response?.data?.documents
        if (!documents) {
          // eslint-disable-next-line no-console
          console.log('fetchDocuments() error - invalid response =', response)
          throw new Error('Invalid documents')
        }
        return documents
      })
  }

  /**
   * Fetches a document and prompts browser to open/save it.
   * @param document the document info object
   * @returns the axios response
   */
  static async fetchDocument (document: DocumentIF): Promise<AxiosResponse> {
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

      return response
    })
  }

  /**
   * Checks if the specified business has any pending tasks.
   * @param businessId the business identifier (aka entity inc no)
   * @returns True if there are any non-NEW tasks, else False
   */
  static async hasPendingTasks (businessId: string): Promise<boolean> {
    return this.fetchTasks(businessId).then(response => {
      const tasks = response?.data?.tasks || []
      return tasks.some(task => {
        if (task?.task?.filing?.header) {
          if (task.task.filing.header.status !== FilingStatus.NEW) {
            return true
          }
        }
      })
    })
  }

  /**
   * Gets a pre-signed URL for the specified filename.
   * @param filename the file name
   * @returns the presigned url object
   */
  static async getPresignedUrl (fileName: string): Promise<PresignedUrlIF> {
    const url = `documents/${fileName}/signatures`
    return axios.get(url)
      .then(response => response?.data)
  }

  /**
   * Uploads the specified file to the specified URL.
   * @param url the URL to upload to
   * @param file the file to upload
   * @param key the file key
   * @param userId the file user id
   * @returns the axios response
   */
  static async uploadToUrl (url: string, file: File, key: string, userId: string): Promise<AxiosResponse> {
    const headers = {
      'Content-Type': file.type,
      'x-amz-meta-userid': `${userId}`,
      'x-amz-meta-key': `${key}`,
      'Content-Disposition': `attachment; filename=${file.name}`
    }
    return axios.put(url, file, { headers })
  }

  //
  // Business Digital Credential Helpers
  //

  /**
   * Fetches digital credentials for a business.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchCredentials (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials`
    return axios.get(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Creates a wallet connection invitation.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async createCredentialInvitation (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/invitation`
    return axios.post(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Fetches a list of wallet connections for a business.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchCredentialConnections (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/connections`
    return axios.get(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Removes an active credential wallet connection.
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async removeActiveCredentialConnection (businessId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/activeConnection`
    return axios.delete(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Removes a credential wallet connection.
   * @param businessId the business identifier (aka entity inc no)
   * @param connectionId the connection identifier
   * @returns the axios response
   */
  static async removeCredentialConnection (businessId: string, connectionId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/connections/${connectionId}`
    return axios.delete(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Sends a digital credential offer.
   * @param businessId The business identifier (aka entity inc no)
   * @param credentialType The credential offer type
   * @returns the axios response
   */
  static async sendCredentialOffer (
    businessId: string,
    credentialType: DigitalCredentialTypes)
    : Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/${credentialType}`
    return axios.post(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Revokes a digital credential.
   * @param businessId The business identifier (aka entity inc no)
   * @param credentialId The credential identifier
   * @returns the axios response
   */
  static async revokeCredential (
    businessId: string,
    credentialId: string,
    reissue = false)
    : Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/${credentialId}/revoke`
    return axios.post(url, { reissue })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }

  /**
   * Removes a digital credential.
   * @param businessId The business identifier (aka entity inc no)
   * @param credentialId The credential identifier
   * @returns the axios response
   */
  static async removeCredential (businessId: string, credentialId: string): Promise<AxiosResponse> {
    const url = `businesses/${businessId}/digitalCredentials/${credentialId}`
    return axios.delete(url)
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return null
      })
  }
}
