import Vue from 'vue'
import { AccountTypes } from '@bcrs-shared-components/enums'
import { AuthenticationStateIF, CurrentAccountIF, CurrentUserIF } from '@/interfaces'
import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('auth', {
  getters: {
    /** The current account the Keycloak user (login) has selected. */
    getCurrentAccount (): CurrentAccountIF {
      return this.getVuexState.account?.currentAccount
    },

    /** The current account id. */
    getCurrentAccountId (): number {
      return (this.getCurrentAccount?.id || 0)
    },

    /** The current Keycloak user object. */
    getCurrentUser (): CurrentUserIF {
      return this.getVuexState.account?.currentUser
    },

    /** The Keycloak GUID. */
    getKeycloakGuid (): string {
      return this.getVuexGetters['auth/keycloakGuid']
    },

    /** The Keycloak user roles. */
    getKeycloakRoles (): Array<string> {
      return this.getCurrentUser?.roles
    },

    /** The Keycloak bearer token. */
    getKeycloakToken (): string {
      return this.getVuexState.auth?.token
    },

    /** The global Vuex store getters. See also main.ts. */
    getVuexGetters (): any {
      return Vue.prototype.$store.getters
    },

    /** The global Vuex store state. See also main.ts */
    getVuexState (): AuthenticationStateIF {
      console.log('*** vuex store =', Vue.prototype.$store)
      return Vue.prototype.$store.state
    },

    /** True if the user is authenticated. */
    isAuthenticated (): boolean {
      return (this.getVuexGetters['auth/isAuthenticated'] || false)
    },

    /** True if the current account is a premium account. */
    isAccountPremium (): boolean {
      return (this.getCurrentAccount?.accountType === AccountTypes.PREMIUM)
    },

    /** True if the current account is a SBC staff account. */
    isAccountSbcStaff (): boolean {
      return (this.getCurrentAccount?.accountType === AccountTypes.SBC_STAFF)
    },

    /** True if current user has Edit role. */
    isRoleEdit (): boolean {
      return this.getKeycloakRoles?.includes('edit') || false
    },

    /** True if current user has Staff role. */
    isRoleStaff (): boolean {
      return this.getKeycloakRoles?.includes('staff') || false
    },

    /** True if current user has View role. */
    isRoleView (): boolean {
      return this.getKeycloakRoles?.includes('view') || false
    }
  }
})
