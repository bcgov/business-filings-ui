import { CurrentAccountInterface } from '@/interfaces'

export default {
  setAccountInformation (state: CurrentAccountInterface, accountInfo: CurrentAccountInterface) {
    state.accountType = accountInfo.accountType
    state.id = accountInfo.id
    state.type = accountInfo.type
    state.label = accountInfo.label
  }
}
