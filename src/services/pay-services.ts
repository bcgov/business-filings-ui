// Libraries
import axios from '@/axios-auth'
import { PaymentErrorIF } from '@/interfaces'

/**
 * Class that provides integration with the Pay API.
 */
export default class PayServices {
  /**
   * Fetches a payment error object (description) by its code.
   * @param code the error code to look up
   * @param payApiUrl
   * @returns the payment error object
   */
  static async getPayErrorObj (payApiUrl: string, code: string): Promise<PaymentErrorIF> {
    const url = `${payApiUrl}codes/errors/${code}`
    return axios.get(url)
      .then(response => response?.data)
      .catch(() => {}) // ignore errors
  }

  /**
   * Fetches the CFS account ID from the pay-api.
   * @param payApiUrl the URL of the pay-api
   * @param orgId the organization ID for which to fetch the CFS account ID
   * @returns the CFS account ID
   */
  static async fetchCfsAccountId (payApiUrl: string, orgId: number): Promise<string> {
    const url = `${payApiUrl}accounts/${orgId}`
    try {
      const response = await axios.get(url)
      return response?.data?.cfsAccount?.cfsAccountNumber
    } catch (error) {
      console.error('Error fetching data from Pay API:', error)
      throw error
    }
  }
}
