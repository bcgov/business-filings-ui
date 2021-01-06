// Libraries
import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

// Interfaces
import { CorrectionFilingIF } from '@/interfaces'

/**
 * Mixin that provides the integration with the legal api.
 */
@Component({})
export default class LegalApiMixin extends Vue {
  /**
   * Fetches a filing by its id.
   * @param businessId The business identifier
   * @param filingId The filing identifier
   * @returns a promise to return the filing
   */
  async fetchFilingById (businessId: string, filingId: number): Promise<any> {
    const url = `businesses/${businessId}/filings/${filingId}`
    return axios.get(url)
      .then(response => {
        if (response && response.data) {
          return response.data.filing
        } else {
          // eslint-disable-next-line no-console
          console.log('fetchFilingById() error - invalid response =', response)
          throw new Error('Invalid API response')
        }
      })
  }

  /**
   * Create a draft correction filing.
   * @param businessId The business identifier
   * @param filing the object body of the request
   * @returns a promise to return the filing
   */
  async createCorrection (businessId: string, filing: CorrectionFilingIF): Promise<any> {
    // Post base filing to filings endpoint
    let url = `businesses/${businessId}/filings?draft=true`

    return axios.post(url, { filing }).then(response => {
      const filing = response?.data?.filing
      const filingId = +filing?.header?.filingId
      if (!filing || !filingId) {
        throw new Error('Invalid API response')
      }

      return filing
    })
  }
}
