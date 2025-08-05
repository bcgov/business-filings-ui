// Libraries
import axios from '@/axios-auth'
import { PaymentErrorIF } from '@/interfaces'
import { useConfigurationStore } from '@/stores/configurationStore'

/**
 * Class that provides integration with the Pay API.
 */
export default class PayServices {
  /** The Pay API Gateway URL. */
  static get payApiGwUrl (): string {
    const configStore = useConfigurationStore()
    return configStore.getPayApiGwUrl
  }

  /**
   * Fetches a payment error object (description) by its code.
   * @param code the error code to look up
   * @returns the payment error object
   */
  static async getPayErrorObj (code: string): Promise<PaymentErrorIF> {
    const url = `${this.payApiGwUrl}codes/errors/${code}`
    return axios.get(url)
      .then(response => response?.data)
      .catch(() => {}) // ignore errors
  }

  /**
   * Fetches the CFS account ID from the pay-api.
   * @param accountId the ID for which to fetch the CFS account ID
   * @returns the CFS account ID
   */
  static async fetchCfsAccountId (accountId: number): Promise<string> {
    const url = `${this.payApiGwUrl}accounts/${accountId}`
    try {
      const response = await axios.get(url)
      return response?.data?.cfsAccount?.cfsAccountNumber
    } catch (error) {
      console.error('Error fetching data from Pay API:', error)
      throw error
    }
  }
}
