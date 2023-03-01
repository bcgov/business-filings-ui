// Libraries
import axios from '@/axios-auth'
import { AxiosResponse } from 'axios'

/**
 * Class that provides integration with the Auth API.
 */
export default class AuthServices {
  /**
   * Fetches authorizations.
   * @param authApiUrl
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchAuthorizations (authApiUrl: string, businessId: string): Promise<AxiosResponse> {
    const url = `${authApiUrl}entities/${businessId}/authorizations`
    return axios.get(url)
  }

  /**
   * Fetches user info for the current user.
   * @returns the axios response
   */
  static async fetchUserInfo (authApiUrl: string): Promise<AxiosResponse> {
    const url = `${authApiUrl}users/@me`
    return axios.get(url)
  }

  /**
   * Fetches entity info.
   * @param authApiUrl
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchEntityInfo (authApiUrl: string, businessId: string): Promise<AxiosResponse> {
    const url = `${authApiUrl}entities/${businessId}`
    return axios.get(url)
  }
}
