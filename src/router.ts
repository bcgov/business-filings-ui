import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import routes from '@/routes'
import { Routes } from '@/enums'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

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
    } else {
      next()
    }
  })

  /** Returns True if route requires authentication, else False. */
  function requiresAuth (route: Route): boolean {
    return route.matched.some(r => r.meta?.requiresAuth)
  }

  /** Returns True if user is authenticated, else False. */
  // FUTURE: use `authenticationStore.isAuthenticated` instead?
  function isAuthenticated (): boolean {
    // FUTURE: also check that token isn't expired!
    return !!sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
  }

  return router
}
