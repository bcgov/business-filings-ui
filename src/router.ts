import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import routes from '@/routes'
import { Routes } from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { GetFeatureFlag } from '@/utils'

/**
 * Configures and returns Vue Router.
 */
export function getVueRouter () {
  Vue.use(VueRouter)

  const base = sessionStorage.getItem('VUE_ROUTER_BASE')

  const router = new VueRouter({
    mode: 'history',
    // set base URL for Vue Router
    base,
    routes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scrollBehavior (to, from, savedPosition) {
      // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
      return { x: 0, y: 0 }
    }
  })

  router.beforeEach((to, from, next) => {
    // check if we need to authenticate
    if (requiresAuth(to) && !isAuthenticated()) {
      next({ name: Routes.SIGNIN })
    } else if (isRedirectDigitalCredentialRoute(to)) {
      next({ name: Routes.DASHBOARD })
    } else {
      next()
    }
  })

  /** Returns True if route requires authentication, else False. */
  function requiresAuth (route: Route): boolean {
    return route.matched.some(r => r.meta?.requiresAuth)
  }

  /** Returns True if user is authenticated, else False. */
  function isAuthenticated (): boolean {
    // FUTURE: also check that token isn't expired!
    return !!sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
  }

  /**
   * Returns True when this is a digital credential route and the credentials
   * feature flag is OFF (for the current user).
   */
  function isRedirectDigitalCredentialRoute (route: Route): boolean {
    // Initially this is True for all but a few select users.
    // See DIGITAL_CREDENTIALS in Allowable Actions Mixin.
    return (
      !GetFeatureFlag('enable-digital-credentials') &&
      [Routes.DIGITAL_CREDENTIALS].includes(route.name as Routes)
    )
  }

  return router
}
