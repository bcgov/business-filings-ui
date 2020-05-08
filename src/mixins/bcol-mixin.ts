import { Component, Vue } from 'vue-property-decorator'
import { AlertMessageIF } from '@/interfaces'
import axios from '@/axios-auth'

@Component({})
export default class BcolMixin extends Vue {
  async getErrorObj (url, errCode) {
    const fetchUrl = sessionStorage.getItem('PAY_API_URL') + 'codes/errors/' + errCode
    const errObj = await axios.get(fetchUrl).catch(() => { return null })
    if (errObj && errObj.data) {
      return errObj.data
    } else {
      return null
    }
  }

  getErrorCode (error) {
    if (error && error.response && error.response.data && error.response.data.errors) {
      const msgCode = error.response.data.errors.find(x => x.payment_error_type.startsWith('BCOL'))
      if (msgCode) {
        return msgCode
      }
      return null
    }
  }
}
