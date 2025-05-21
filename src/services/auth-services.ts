// Libraries
import axios from '@/axios-auth'
import { AxiosResponse } from 'axios'

/**
 * Class that provides integration with the Auth API.
 */
export default class AuthServices {
  /**
   * Fetches authorizations of the specified entity.
   * @param authApiUrl the auth API URL form storage
   * @param businessId the temp or business identifier (eg, T1234567 or BC1219948)
   * @returns a promise to return the authorizations object
   */
  static async fetchAuthorizations (authApiUrl: string, businessId: string): Promise<any> {
    if (!businessId) throw new Error('Invalid id')

    const url = `${authApiUrl}entities/${businessId}/authorizations`
    return axios.get(url).then(response => {
      if (response?.data) return response.data
      throw new Error('Invalid response data')
    })
  }

  /**
   * Fetches user info for the current user.
   * @returns the user info object
   */
  static async fetchUserInfo (authApiUrl: string): Promise<any> {
    const url = `${authApiUrl}users/@me`
    return axios.get(url)
      .then(response => {
        const data = response?.data
        if (!data) {
          console.log('fetchUserInfo() error - invalid response =', response)
        }
        return data
      })
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
    const action = isAuthorized ? 'accept' : 'refuse'
    const authorizePath = `affiliationInvitations/${affiliationInvitationId}/authorization/${action}`

    const url =
      authApiUrl + authorizePath

    return axios.patch(url)
  }
}
