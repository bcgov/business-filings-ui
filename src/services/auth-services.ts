// Libraries
import axios from '@/axios-auth'

/**
 * Class that provides integration with the Auth API.
 */
export default class AuthServices {
  /**
   * Fetches authorizations.
   * @param businessId the business identifier (aka entity inc no)
   */
  static async fetchAuthorizations (businessId: string): Promise<any> {
    const authApiUrl = sessionStorage.getItem('AUTH_API_URL') || ''
    const url = `${authApiUrl}entities/${businessId}/authorizations`
    return axios.get(url)
  }

  /**
   * Fetches user info for the current user.
   */
  static async fetchUserInfo (): Promise<any> {
    const authApiUrl = sessionStorage.getItem('AUTH_API_URL') || ''
    const url = `${authApiUrl}users/@me`
    return axios.get(url)
      .then(response => response?.data)
  }

  /**
   * Fetches entity info.
   * @param businessId the business identifier (aka entity inc no)
   */
  static async fetchEntityInfo (businessId: string): Promise<any> {
    const authApiUrl = sessionStorage.getItem('AUTH_API_URL') || ''
    const url = `${authApiUrl}entities/${businessId}`
    return axios.get(url)
  }
}
