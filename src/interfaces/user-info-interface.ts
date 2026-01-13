import { AccountTypes } from '@bcrs-shared-components/enums'

/**
 * The User Info interface.
 * (Ie, response from Auth API /users/@me endpoint)
 */
export interface UserInfoIF {
  contacts: Array<{
    email: string
    phone: string
    phoneExtension: string
  }>
  created: string // UTC format date-time string
  email: string
  firstname: string
  id: number
  idpUserid: string
  keycloakGuid: string
  lastname: string
  loginSource: string // eg, BCSC
  loginTime: string // UTC format date-time string
  modified: string // UTC format date-time string
  modifiedBy: string
  type: AccountTypes
  userStatus: number
  userTerms: {
    isTermsOfUseAccepted: boolean
    termsOfUseAcceptedVersion: string // eg, "5"
  }
  username: string
  verified: boolean
  version: number
}
