import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

@Component({})
export default class BcolMixin extends Vue {
  // readonly payApiUrl: string

  async getErrorObj (errCode) {
    const fetchUrl = this.payApi + 'codes/errors/' + errCode
    const errObj = await axios.get(fetchUrl).catch()
    if (errObj && errObj.data) {
      return errObj.data
    }
    return null
  }

  getErrorCode (error) {
    if (error.response?.data?.errors) {
      const msgCode = error.response.data.errors.find(x => x.payment_error_type.startsWith('BCOL'))
      if (msgCode) {
        return msgCode
      }
      return null
    }
  }

  get payApi () {
    return sessionStorage.getItem('PAY_API_URL')
  }
}
