// Libraries
import axios from '@/axios-auth'
import { Component, Vue } from 'vue-property-decorator'
import { NameRequestStates } from '@/enums'

/**
 * Temporary mixin to help with name request calls until we get the legal api proxy
 */
@Component
export default class NamexApiMixin extends Vue {
  // eslint-disable-next-line
  private token: string;
  private tokenUrl: string = 'https://sso-dev.pathfinder.gov.bc.ca/auth/realms/sbc/protocol/openid-connect/token'
  private accountId: string = 'lear_sa'
  private accountSecret: string = '72a733b4-4677-41be-8e66-d9ccaaafa60a' // Input secret for development

  /**
   * Temporary method for initializing a namex api token for development
   * This will be removed in the future when supporting dependencies are in place
   */
  async intializeNameXToken () : Promise<any> {
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: this.accountId,
        password: this.accountSecret
      }
    }
    return axios.post(this.tokenUrl, 'grant_type=client_credentials', config).then(res => {
      this.token = res.data['access_token']
      return res
    })
  }

  /**
   * Method to query name request results.
   * @param nrNumber the name request number. eg: NR 123456789
   */
  async queryNameRequest (nrNumber: string): Promise<any> {
    if (nrNumber) {
      // TODO FIX - Override until we can proxy through legal api
      let url = `https://namex-dev.pathfinder.gov.bc.ca/api/v1/requests/${nrNumber}`
      let config = {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
      return axios.get(url, config).then(res => {
        if (!res) {
          throw new Error('invalid API response')
        }
        return res.data
      }).catch(err => {
        if (err && !err.response) {
          return undefined
        }
      })
    } else {
      throw new Error('NR number is required.')
    }
  }

  /**
   * Method to check if a name request response payload is consumable
   * @param nr the name request response payload
   */
  isNRConsumable (nr : any) : { isConsumable: boolean, expired: boolean, approved: boolean } {
    // Ensure a name request payload is provided
    if (!nr) {
      throw new Error('isNRConsumable() : no NR provided')
    }
    // If the NR root state is EXPIRED, this NR is not consumable
    if (nr.state === NameRequestStates.EXPIRED) {
      return { isConsumable: false, expired: true, approved: false }
    }

    // If the NR root state is not APPROVED, this NR is not consumable
    if (nr.state !== NameRequestStates.APPROVED) {
      return { isConsumable: false, expired: false, approved: false }
    }

    // Check if the name request has already been consumed
    let hasBeenConsumed = false
    nr.names.forEach((name: { consumptionDate: any; }) => {
      if (name.consumptionDate) {
        hasBeenConsumed = true
      }
    })
    if (hasBeenConsumed) {
      return { isConsumable: false, expired: false, approved: true }
    }

    return { isConsumable: true, expired: false, approved: true }
  }
}
