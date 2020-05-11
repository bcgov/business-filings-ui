import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

@Component({})
export default class BcolMixin extends Vue {
  async getErrorObj (errCode) {
    const fetchUrl = sessionStorage.getItem('PAY_API_URL') + 'codes/errors/' + errCode
    const errObj = await axios.get(fetchUrl)
    if (errObj && errObj.data) {
      return errObj.data
    } 
    return null
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
