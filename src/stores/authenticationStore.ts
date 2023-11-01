import { AccountTypes } from '@bcrs-shared-components/enums'
import { RootStateIF } from '@/interfaces'
import { defineStore } from 'pinia'
import { useRootStore } from './rootStore'

export const useAuthenticationStore = defineStore('authentication', {
  getters: {
    /** Whether the current account is a premium account. */
    isPremiumAccount (rootState: RootStateIF): boolean {
      return (rootState.account.currentAccount.accountType === AccountTypes.PREMIUM)
    },

    /** Whether the user is ServiceBC Staff (which is not the same as Staff). */
    isSbcStaff (rootState: RootStateIF): boolean {
      return (rootState.account.currentAccount.accountType === AccountTypes.SBC_STAFF)
    },

    /** The user's Keycloak GUID. */
    getKeycloakGuid (): string {
      return useRootStore().userKeycloakGuid
    },

    /** The user's Full Name. */
    getUserFullName (): string {
      return useRootStore().userFullName
    },

    /** The user's Keycloak Bearer Token. */
    getKeycloakToken (rootState: RootStateIF): string {
      return rootState.auth.token
    },

    /** Returns true is the user is Keycloak authenticated. */
    isKeycloakAuthenticated (rootGetters): boolean {
      return rootGetters['auth/isAuthenticated']
    },

    /** Returns the Keycloak user object. */
    getKeycloakUser (rootState: RootStateIF): any {
      return rootState.account.currentUser
    },

    /** Each Keycloak user can have many accounts.
     * This getter returns the account the user
     * has selected
     */
    getCurrentAccount (rootState: RootStateIF): any {
      return rootState.account.currentAccount
    },

    /** Returns the Keycloak roles. */
    getKeycloakRoles (rootState: RootStateIF): Array<string> {
      return rootState.account.currentUser.roles
    },

    /** Is True if Keycloak Staff role is set. */
    isKeycloakRoleStaff (rootState: RootStateIF): boolean {
      return rootState.account.currentUser.roles.includes('staff')
    }
  }
})
