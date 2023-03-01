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
}
