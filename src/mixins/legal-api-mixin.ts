// Libraries
import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

/**
 * Mixin that provides integration with the Legal API.
 */
@Component({})
export default class LegalApiMixin extends Vue {
  /**
   * Fetches a filing by its id.
   * @param businessId the business identifier (aka entity inc no)
   * @param filingId the filing identifier
   * @returns a promise to return the filing from the response
   */
  async fetchFilingById (businessId: string, filingId: number): Promise<any> {
    const url = `businesses/${businessId}/filings/${filingId}`
    return axios.get(url)
      .then(response => {
        const filing = response?.data?.filing
        if (!filing) {
          // eslint-disable-next-line no-console
          console.log('fetchFilingById() error - invalid response =', response)
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
}
