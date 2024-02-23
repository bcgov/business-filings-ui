import Vue from 'vue'
import { AccountTypes } from '@bcrs-shared-components/enums'
import { CurrentAccountIF, CurrentUserIF } from '@/interfaces'
import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', {
  getters: {
    /**
     * The (Keycloak) current account object.
     * @remarks This isn't set right away - may need to wait 200ms or more after login.
     */
    getCurrentAccount (): CurrentAccountIF {
      return Vue.prototype.$store.state.account?.currentAccount
    },

    /**
     * The (Keycloak) current user object.
     * @remarks This isn't set right away - may need to wait 200ms or more after login.
     */
    getCurrentUser (): CurrentUserIF {
      return Vue.prototype.$store.state.account?.currentUser
    },

    /** The user's Keycloak GUID. */
    getKeycloakGuid (): string {
      return Vue.prototype.$store.getters['auth/keycloakGuid']
    },

    /** The user's Keycloak roles. */
    getKeycloakRoles (): Array<string> {
      return this.getCurrentUser?.roles || []
    },

    /** The user's Keycloak bearer token. */
    getKeycloakToken (): string {
      return Vue.prototype.$store.state.auth?.token
    },

    /** True if the user is (Keycloak) authenticated. */
    isAuthenticated (): boolean {
      return Vue.prototype.$store.getters['auth/isAuthenticated'] || false
    },

    /** True if the current account is a premium account. */
    isPremiumAccount (): boolean {
      return (this.getCurrentAccount?.accountType === AccountTypes.PREMIUM)
    },

    /** True if the current account is a SBC staff account (which is not the same as Staff). */
    isSbcStaff (): boolean {
      return (this.getCurrentAccount?.accountType === AccountTypes.SBC_STAFF)
    },

    /** True if the current user has Staff role. */
    isRoleStaff (): boolean {
      return (this.getKeycloakRoles?.includes('staff') || false)
    }
  }
})
