import Signin from '@/views/auth/Signin.vue'
import Signout from '@/views/auth/Signout.vue'
import Dashboard from '@/views/Dashboard.vue'
import AnnualReport from '@/views/AnnualReport.vue'
import StandaloneDirectorsFiling from '@/views/StandaloneDirectorsFiling.vue'
import StandaloneOfficeAddressFiling from '@/views/StandaloneOfficeAddressFiling.vue'
import Correction from '@/views/Correction.vue'

export default [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/annual-report',
    name: 'annual-report',
    component: AnnualReport,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/standalone-directors',
    name: 'standalone-directors',
    component: StandaloneDirectorsFiling,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/standalone-addresses',
    name: 'standalone-addresses',
    component: StandaloneOfficeAddressFiling,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/correction',
    name: 'correction',
    component: Correction,
    meta: {
      requiresAuth: true
    }
  },
  {
    // this route is selected by router.beforeEach()
    path: '/signin',
    name: 'signin',
    component: Signin,
    meta: {
      requiresAuth: false
    }
  },
  {
    // this route is selected by SbcHeader -> Logout
    path: '/signout',
    name: 'signout',
    component: Signout,
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   // ref: https://cli.vuejs.org/guide/html-and-static-assets.html#prefetch
  //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  // },
  {
    // default/fallback route
    path: '*',
    redirect: '/'
  }
]
