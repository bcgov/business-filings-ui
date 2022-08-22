import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import routes from '@/routes'
import { Routes } from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { getFeatureFlag } from '@/utils'

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
    scrollBehavior (to, from, savedPosition) {
      // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
      return { x: 0, y: 0 }
    }
  })

  router.beforeEach((to, from, next) => {
    // check if we need to authenticate
    if (requiresAuth(to) && !isAuthenticated()) {
      next({ name: Routes.SIGNIN })
    } else if (isProtectedCredentialRoute(to)) {
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

  /** Returns True when a digital credential route and the credentials feature flag is off. */
  function isProtectedCredentialRoute (route: Route): boolean {
    // Initially this is going to be the case for all but a few select users.
    // User selection is handled in LD with a few stipulations: See VIEW_ADD_DIGITAL_CREDENTIALS in AllowableActions
    return !getFeatureFlag('enable-digital-credentials') &&
      [Routes.DIGITAL_CREDENTIALS].includes(route.name as Routes)
  }

  return router
}
