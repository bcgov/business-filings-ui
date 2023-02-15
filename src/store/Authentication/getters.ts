import { AccountTypes } from '@bcrs-shared-components/enums'
import { RootStateIF } from '@/interfaces'

export default {
  /** Whether the current account is a premium account. */
  isPremiumAccount (state, getters, rootState: RootStateIF): boolean {
    return (rootState.account.currentAccount.accountType === AccountTypes.PREMIUM)
  },

  /** Whether the user is ServiceBC Staff (which is not the same as Staff). */
  isSbcStaff (state, getters, rootState: RootStateIF): boolean {
    return (rootState.account.currentAccount.accountType === AccountTypes.SBC_STAFF)
  },

  /** The user's Keycloak GUID. */
  getKeycloakGuid (state, getters, rootState, rootGetters): string {
    return rootGetters['auth/keycloakGuid']
  },

  /** The user's Keycloak Bearer Token. */
  getKeycloakToken (state, getters, rootState: RootStateIF): string {
    return rootState.auth.token
  },

  /** Returns true is the user is Keycloak authenticated. */
  isKeycloakAuthenticated (state, getters, rootState, rootGetters): boolean {
    return rootGetters['auth/isAuthenticated']
  },

  /** Returns the Keycloak user object. */
  getKeycloakUser (state, getters, rootState: RootStateIF): any {
    return rootState.account.currentUser
  },

  /** Each Keycloak user can have many accounts.
   * This getter returns the account the user
   * has selected */
  getCurrentAccount (state, getters, rootState: RootStateIF): any {
    return rootState.account.currentAccount
  },

  /** Returns the Keycloak roles. */
  getKeycloakRoles (state, getters, rootState: RootStateIF): Array<string> {
    return rootState.account.currentUser.roles
  },

  /** Is True if Keycloak Staff role is set. */
  isKeycloakRoleStaff (state, getters, rootState: RootStateIF): boolean {
    return rootState.account.currentUser.roles.includes('staff')
  }
}
