// Components
import Dashboard from '@/views/Dashboard.vue'
import AnnualReport from '@/views/AnnualReport.vue'
import StandaloneDirectorsFiling from '@/views/StandaloneDirectorsFiling.vue'
import StandaloneOfficeAddressFiling from '@/views/StandaloneOfficeAddressFiling.vue'
import Correction from '@/views/Correction.vue'
import Signin from '@/views/auth/Signin.vue'
import Signout from '@/views/auth/Signout.vue'

// Constants
import { ANNUAL_REPORT, CORRECTION, DASHBOARD, STANDALONE_ADDRESSES, STANDALONE_DIRECTORS,
  SIGNIN, SIGNOUT } from '@/constants'

export default [
  {
    path: '/',
    name: DASHBOARD,
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/annual-report',
    name: ANNUAL_REPORT,
    component: AnnualReport,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: 'File Annual Report',
          disabled: false,
          exact: true,
          to: { name: ANNUAL_REPORT }
        }
      ]
    }
  },
  {
    path: '/standalone-directors',
    name: STANDALONE_DIRECTORS,
    component: StandaloneDirectorsFiling,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: 'Director Change',
          disabled: false,
          exact: true,
          to: { name: STANDALONE_DIRECTORS }
        }
      ]
    }
  },
  {
    path: '/standalone-addresses',
    name: STANDALONE_ADDRESSES,
    component: StandaloneOfficeAddressFiling,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: 'Address Change',
          disabled: false,
          exact: true,
          to: { name: STANDALONE_ADDRESSES }
        }
      ]
    }
  },
  {
    path: '/correction',
    name: CORRECTION,
    component: Correction,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: 'Correction',
          disabled: false,
          exact: true,
          to: { name: CORRECTION }
        }
      ]
    }
  },
  {
    // this route is selected by router.beforeEach()
    path: '/signin',
    name: SIGNIN,
    component: Signin,
    meta: {
      requiresAuth: false
    }
  },
  {
    // this route is selected by SbcHeader -> Logout
    path: '/signout',
    name: SIGNOUT,
    component: Signout,
    props: true,
    meta: {
      requiresAuth: false
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
