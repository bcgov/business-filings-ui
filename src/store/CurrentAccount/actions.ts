import {CurrentAccountInterface} from "@/interfaces";
import {SessionStorageKeys} from "sbc-common-components/src/util/constants";
import {sleep} from "@/utils";
import currentAccount from "@/store/CurrentAccount/index";

export default {
  async loadCurrentAccount (context): Promise<any> {
    return new Promise((resolve, reject) => {
      context.dispatch('waitForCurrentAccount')
        .then((currentAccount) => {
          const accountInfo: CurrentAccountInterface = {
            accountType: currentAccount.accountType,
            id: currentAccount.id,
            label: currentAccount.label,
            type: currentAccount.type
          }
          context.commit('setAccountInformation', accountInfo)
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  },

  async waitForCurrentAccount (): Promise<any> {
    return await new Promise((resolve, reject) => {
      let account = null
      for (let i = 0; i < 50; i++) {
        const currentAccount = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
        account = JSON.parse(currentAccount)
        if (account) break
          sleep(100)
      }
      if (account) {
        return resolve(account)
      }
      return reject()
    })
  },
}
