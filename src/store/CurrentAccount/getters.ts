import { AccountTypes } from '@/enums'
import { CurrentAccountInterface } from '@/interfaces'


export default {

  /** Whether the current account is a premium account. */
  isPremiumAccount (state: CurrentAccountInterface): boolean {
    return (state.accountType === AccountTypes.PREMIUM)
  },

  /** Whether the user is ServiceBC Staff (which is not the same as Staff). */
  isSbcStaff (state: CurrentAccountInterface): boolean {
    return (state.accountType === AccountTypes.SBC_STAFF)
  }
}
