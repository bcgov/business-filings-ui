// Libraries
import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

/** Mixin that provides integration with the Pay API. */
@Component({})
export default class PayApiMixin extends Vue {
  /** The Pay API string. */
  private get payApiUrl (): string {
    return sessionStorage.getItem('PAY_API_URL')
  }

  /**
   * Fetches one receipt and prompts browser to open/save it.
   * See also LegalApiMixin::fetchOneDocument().
   * @param receipt the receipt info object
   */
  async fetchOneReceipt (receipt: any): Promise<void> {
    // safety checks
    if (!receipt.paymentToken || !receipt.corpName || !receipt.filingDateTime || !receipt.filename) return

    const url = `${receipt.paymentToken}/receipts`
    const data = {
      corpName: receipt.corpName,
      filingDateTime: receipt.filingDateTime,
      fileName: 'receipt' // not used // TODO: verify and delete
    }
    const config = {
      headers: { 'Accept': 'application/pdf' },
      responseType: 'blob' as 'json',
      baseURL: this.payApiUrl + 'payment-requests/'
    }

    return axios.post(url, data, config).then(response => {
      if (!response) throw new Error('Null response')

      /* solution from https://github.com/axios/axios/issues/1392 */

      // it is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const blob = new Blob([response.data], { type: 'application/pdf' })

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, receipt.filename)
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
}
