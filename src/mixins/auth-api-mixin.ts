// Libraries
import { Component, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'

/**
 * Mixin that provides integration with the Auth API.
 */
@Component({})
export default class AuthApiMixin extends Vue {
  private get authApiUrl (): string {
    return sessionStorage.getItem('AUTH_API_URL')
  }

  /**
   * Fetches authorizations for the current user for the specified business ID.
   */
  async fetchAuthorizations (businessId: string): Promise<any> {
    const url = businessId + '/authorizations'
    const config = {
      baseURL: this.authApiUrl + 'entities/'
    }
    return axios.get(url, config)
  }

  /**
   * Fetches user info for the current user.
   */
  async fetchUserInfo (): Promise<any> {
    const config = {
      baseURL: this.authApiUrl
    }
    return axios.get('users/@me', config)
      .then(response => response.data)
  }

  /**
   * Fetches business info for the specified business ID.
   */
  async fetchBusinessInfo (businessId: string): Promise<any> {
    const url = businessId
    const config = {
      baseURL: this.authApiUrl + 'entities/'
    }
    return axios.get(url, config)
  }
}
