import { AccountTypes } from '@bcrs-shared-components/enums'
import { AuthenticationStateIF } from '@/interfaces'
import { defineStore } from 'pinia'
import { useRootStore } from './rootStore'

export const useAuthenticationStore = defineStore('authentication', {
  getters: {
    /** Whether the current account is a premium account. */
    isPremiumAccount (state: AuthenticationStateIF): boolean {
      return (state.account.currentAccount.accountType === AccountTypes.PREMIUM)
    },

    /** Whether the user is ServiceBC Staff (which is not the same as Staff). */
    isSbcStaff (state: AuthenticationStateIF): boolean {
      return (state.account.currentAccount.accountType === AccountTypes.SBC_STAFF)
    },

    /** The user's Keycloak GUID. */
    getKeycloakGuid (): string {
      return useRootStore().userKeycloakGuid
    },

    /** The user's Keycloak Bearer Token. */
    getKeycloakToken (state: AuthenticationStateIF): string {
      return state.auth.token
    },

    /** Returns true is the user is Keycloak authenticated. */
    isKeycloakAuthenticated (rootGetters): boolean {
      return rootGetters['auth/isAuthenticated']
    },

    /** Returns the Keycloak user object. */
    getKeycloakUser (state: AuthenticationStateIF): any {
      return state.account.currentUser
    },

    /** Each Keycloak user can have many accounts.
     * This getter returns the account the user
     * has selected
     */
    getCurrentAccount (state: AuthenticationStateIF): any {
      return state.account.currentAccount
    },

    /** Returns the Keycloak roles. */
    getKeycloakRoles (state: AuthenticationStateIF): Array<string> {
      return state.account.currentUser.roles
    },

    /** Is True if Keycloak Staff role is set. */
    isKeycloakRoleStaff (state: AuthenticationStateIF): boolean {
      return state.account.currentUser.roles.includes('staff')
    }
  }
})
