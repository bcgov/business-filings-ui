import { CurrentAccountIF } from '@/interfaces'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

/**
 * Gets the current account object from session storage.
 * @returns the current account object or null if not found
 * @remarks This isn't set right away - see await in App.vue::mounted().
 */
export function GetCurrentAccount (): CurrentAccountIF {
  const currentAccount = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
  return currentAccount ? JSON.parse(currentAccount) : null
}
