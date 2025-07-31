// Libraries
import axios from '@/axios-auth'
import { AxiosResponse } from 'axios'
import { useConfigurationStore } from '@/stores/configurationStore'

/**
 * Class that provides integration with the Auth API.
 */
export default class AuthServices {
  /** The Auth API Gateway URL. */
  static get authApiGwUrl (): string {
    const configStore = useConfigurationStore()
    return configStore.getAuthApiGwUrl
  }

  /**
   * Fetches user info for the current user.
   * @returns the user info object
   */
  static async fetchUserInfo (): Promise<any> {
    const url = `${this.authApiGwUrl}users/@me`
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
   * @param businessId the business identifier (aka entity inc no)
   * @returns the axios response
   */
  static async fetchEntityInfo (businessId: string): Promise<AxiosResponse> {
    const url = `${this.authApiGwUrl}entities/${businessId}`
    return axios.get(url)
  }

  /**
   * Fetches affiliation invites tied to this entity.
   * @param businessId the business identifier (aka entity inc no)
   * @param orgId org which has access rights to display (current logged in org)
   * @returns the axios response
   */
  static async fetchAffiliationInvitations (businessId: string, orgId: number) {
    const url = `${this.authApiGwUrl}affiliationInvitations`
    return axios.get(url, { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })
  }

  /**
   * Authorizes or refuses authorization for this invitation.
   * @param affiliationInvitationId id of affiliation to approve or not
   * @param isAuthorized boolean stating if invitation is authorized (true) or not authorized (false)
   * @returns the axios response
   */
  static async authorizeAffiliationInvitation (
    affiliationInvitationId: number,
    isAuthorized: boolean) {
    const action = isAuthorized ? 'accept' : 'refuse'
    const authorizePath = `affiliationInvitations/${affiliationInvitationId}/authorization/${action}`

    const url = this.authApiGwUrl + authorizePath

    return axios.patch(url)
  }
}
