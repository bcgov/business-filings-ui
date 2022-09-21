// Libraries
import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

/**
 * Mixin that provides integration with the Auth API.
 */
@Component({})
export default class AuthApiMixin extends Vue {
  get authApiUrl (): string {
    return sessionStorage.getItem('AUTH_API_URL') || ''
  }

  /**
   * Fetches authorizations.
   * @param businessId the business identifier (aka entity inc no)
   */
  async fetchAuthorizations (businessId: string): Promise<any> {
    const url = `${this.authApiUrl}entities/${businessId}/authorizations`
    return axios.get(url)
  }

  /**
   * Fetches user info for the current user.
   */
  async fetchUserInfo (): Promise<any> {
    const url = `${this.authApiUrl}users/@me`
    return axios.get(url)
      .then(response => response?.data)
  }

  /**
   * Fetches entity info.
   * @param businessId the business identifier (aka entity inc no)
   */
  async fetchEntityInfo (businessId: string): Promise<any> {
    const url = `${this.authApiUrl}entities/${businessId}`
    return axios.get(url)
  }
}
