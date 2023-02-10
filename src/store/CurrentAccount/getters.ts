import { AccountTypes } from '@bcrs-shared-components/enums'
import { CurrentAccountIF } from '@/interfaces'

export default {
  /** Whether the current account is a premium account. */
  isPremiumAccount (state: CurrentAccountIF): boolean {
    return (state.accountType === AccountTypes.PREMIUM)
  },

  /** Whether the user is ServiceBC Staff (which is not the same as Staff). */
  isSbcStaff (state: CurrentAccountIF): boolean {
    return (state.accountType === AccountTypes.SBC_STAFF)
  }
}
