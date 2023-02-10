import { CurrentAccountIF } from '@/interfaces'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { sleep } from '@/utils'

export default {
  /**
   * Gets account info and stores it in the CurrentAccount store.
   * Among other things, this is how we find out if this is a staff account.
   */
  async loadCurrentAccount (context): Promise<any> {
    return new Promise((resolve, reject) => {
      context.dispatch('waitForCurrentAccount')
        .then((currentAccount) => {
          const accountInfo: CurrentAccountIF = {
            accountType: currentAccount.accountType,
            id: currentAccount.id,
            label: currentAccount.label,
            type: currentAccount.type
          }
          context.commit('setAccountInformation', accountInfo)
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  /**
   * Gets current account from object in session storage.
   * Wait up to 5 sec for current account to be synced (typically by SbcHeader).
   */
  waitForCurrentAccount (): Promise<any> {
    return new Promise((resolve, reject) => {
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
      return reject(new Error('Gave up waiting for CurrentAccount from Session'))
    })
  }
}
