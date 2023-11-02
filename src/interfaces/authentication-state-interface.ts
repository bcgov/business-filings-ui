import { CurrentUserIF, CurrentAccountIF } from '@/interfaces'

/** The state model interface for the Authentication Store. */
export interface AuthenticationStateIF {
  account: {
    currentUser: CurrentUserIF
    currentAccount: CurrentAccountIF
  },
  auth: {
    token: string
    idToken: string
    refreshToken: string
  }
}
