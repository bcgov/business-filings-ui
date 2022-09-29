import axios from '@/axios-auth'
import { PaymentErrorIF } from '@/interfaces'
import { computed } from '@vue/composition-api'

/**
 * Composable that provides integration with the Pay API.
 */
export const PayApiComposable = () => {
  const payApiUrl = computed(() => sessionStorage.getItem('PAY_API_URL') || '' as string)

  /**
   * Fetches a payment error object (description) by its code.
   * @param code the error code to look up
   * @returns a promise to return the payment error object
   */
  const getPayErrorObj = (code: string): Promise<PaymentErrorIF> => {
    const url = `${payApiUrl.value}codes/errors/${code}`
    return axios.get(url)
      .then(response => response?.data)
      .catch(() => {}) // ignore errors
  }
  return {
    payApiUrl,
    getPayErrorObj
  }
}
