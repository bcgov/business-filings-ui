// Libraries
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { PaymentErrorIF } from '@/interfaces'

/**
 * Mixin that provides integration with the Pay API.
 */
@Component({})
export default class PayApiMixin extends Vue {
  get payApiUrl (): string {
    return sessionStorage.getItem('PAY_API_URL') || ''
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
      .catch(() => {}) // ignore errors
  }
}
