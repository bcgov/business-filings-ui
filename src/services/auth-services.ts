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
   * @param orgId org which has access rights to display (current logged in org)
   * @returns the axios response
   */
  static async fetchAffiliationInvitations (authApiUrl: string, businessId: string, orgId: number) {
    const url = `${authApiUrl}affiliationInvitations`
    return axios.get(url, { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })
  }

  /**
   * Authorizes or refuses authorization for this invitation.
   * @param authApiUrl
   * @param affiliationInvitationId id of affiliation to approve or not
   * @param isAuthorized boolean stating if invitation is authorized (true) or not authorized (false)
   * @returns the axios response
   */
  static async authorizeAffiliationInvitation (
    authApiUrl: string,
    affiliationInvitationId: number,
    isAuthorized: boolean) {
    let authorizePath = `affiliationInvitations/${affiliationInvitationId}/authorization/refuse`

    if (isAuthorized) {
      authorizePath = `affiliationInvitations/${affiliationInvitationId}/authorization/accept`
    }

    const url =
      authApiUrl + authorizePath

    return axios.patch(url)
  }
}
