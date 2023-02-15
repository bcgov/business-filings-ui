import { CurrentUserIF, CurrentAccountIF } from '@/interfaces'

/** The ROOT state model interface. */
export interface RootStateIF {
  account: {
    currentUser: CurrentUserIF,
    currentAccount: CurrentAccountIF
  },
  auth: {
    token: string,
    idToken: string,
    refreshToken: string
  }
}
