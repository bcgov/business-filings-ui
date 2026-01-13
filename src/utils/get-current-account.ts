import { CurrentAccountIF } from '@/interfaces'

/**
 * Gets the current account object from session storage.
 * @returns the current account object or null if not found
 * @remarks This isn't set right away - see await in App.vue::mounted().
 */
export function GetCurrentAccount (): CurrentAccountIF {
  const currentAccount = sessionStorage.getItem('CURRENT_ACCOUNT') || null
  return JSON.parse(currentAccount)
}
