// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { CommonMixin } from '@/mixins'
import { PaymentErrorIF } from '@/interfaces'

/**
 * Mixin that provides integration with the Pay API.
 */
@Component({})
export default class PayApiMixin extends Mixins(CommonMixin) {
  private get payApiUrl (): string {
    return sessionStorage.getItem('PAY_API_URL') || ''
  }

  /**
   * Fetches a receipt and prompts browser to open/save it.
   * See also LegalApiMixin::fetchDocument().
   * @param receipt the receipt info object
   */
  async fetchReceipt (receipt: any): Promise<any> {
    // safety checks
    if (!receipt.paymentToken || !receipt.corpName || !receipt.filingDateTime || !receipt.filename) return

    const url = `${this.payApiUrl}payment-requests/${receipt.paymentToken}/receipts`

    const data = {
      corpName: receipt.corpName,
      filingDateTime: receipt.filingDateTime
    }

    const config = {
      headers: { 'Accept': 'application/pdf' },
      responseType: 'blob' as 'json'
    }

    return axios.post(url, data, config).then(response => {
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
        window.navigator['msSaveOrOpenBlob'](blob, receipt.filename)
      } else {
        // for other browsers, create a link pointing to the ObjectURL containing the blob
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        window.document.body.appendChild(a)
        a.setAttribute('style', 'display: none')
        a.href = url
        a.download = receipt.filename
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
    })
  }

  /**
   * Fetches a payment error object (description) by its code.
   * @param code the error code to look up
   * @returns a promise to return the payment error object
   */
  async getPayErrorObj (code: string): Promise<PaymentErrorIF> {
    const url = `${this.payApiUrl}codes/errors/${code}`
    return axios.get(url)
      .then(response => response?.data)
      .catch() // ignore errors
  }
}
