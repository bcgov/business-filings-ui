import Vue from 'vue'
import VueRouter from 'vue-router'
import { Route } from 'vue-router/types'
import routes from '@/routes'

/**
 * Configures and returns Vue Router.
 */
export function getVueRouter () {
  Vue.use(VueRouter)

  const router = new VueRouter({
    mode: 'history',
    // set base URL for Vue Router
    base: sessionStorage.getItem('VUE_ROUTER_BASE'),
    routes,
    scrollBehavior (to, from, savedPosition) {
      // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
      return { x: 0, y: 0 }
    }
  })

  router.beforeEach((to, from, next) => {
    // check if we need to authenticate
    if (isNotSigninRoute(to) && requiresAuth(to) && isNotAuthenticated()) {
      next({ name: 'signin' })
    } else {
      next()
    }
  })

  /** Returns True if route is not Signin, else False. */
  function isNotSigninRoute (route: Route): boolean {
    return Boolean(route.name !== 'signin')
  }

  /** Returns True if route requires authentication, else False. */
  function requiresAuth (route: Route): boolean {
    return route.matched.some(r => r.meta.requiresAuth)
  }

  /** Returns True if user is not authenticated, else False. */
  function isNotAuthenticated (): boolean {
    // FUTURE: also check that token isn't expired!
    return Boolean(!sessionStorage.getItem('KEYCLOAK_TOKEN'))
  }

  return router
}
