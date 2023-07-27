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

  /**
   * Fetches affiliation invites tied to this entity.
   * @param authApiUrl
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchAffiliationInvitations (authApiUrl: string, businessId: string) {
    const url = `${authApiUrl}entity/${businessId}/affiliations/invitations`
    return axios.get(url)
  }

  /**
   * Authorizes or refuses authorization for this invitation.
   * @param authApiUrl
   * @param businessId the business identifier (aka entity inc no)
   * @param affiliationInvitationId id of affiliation to approve or not
   * @param isAuthorized boolean stating if invitation is authorized (true) or not authorized (false)
   * @returns the axios response
   */
  static async authorizeAffiliationInvitation (
    authApiUrl: string,
    businessId: string,
    affiliationInvitationId: number,
    isAuthorized: boolean) {
    const url =
      authApiUrl +
      `entities/${businessId}/affiliation/invitation/${affiliationInvitationId}/authorize?isAuthorized=${isAuthorized}`
    return axios.get(url)
  }
}
