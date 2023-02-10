import { CurrentAccountIF } from '@/interfaces'

export default {
  setAccountInformation (state: CurrentAccountIF, accountInfo: CurrentAccountIF) {
    state.accountType = accountInfo.accountType
    state.id = accountInfo.id
    state.type = accountInfo.type
    state.label = accountInfo.label
  }
}
