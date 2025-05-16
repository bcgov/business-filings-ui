import Dashboard from '@/views/Dashboard.vue'
import AgmExtension from '@/views/AgmExtension.vue'
import AgmLocationChg from '@/views/AgmLocationChg.vue'
import AmalgamationSelection from '@/views/AmalgamationSelection.vue'
import AnnualReport from '@/views/AnnualReport.vue'
import StandaloneDirectorsFiling from '@/views/StandaloneDirectorsFiling.vue'
import StandaloneOfficeAddressFiling from '@/views/StandaloneOfficeAddressFiling.vue'
import ConsentAmalgamationOut from '@/views/ConsentAmalgamationOut.vue'
import ConsentContinuationOut from '@/views/ConsentContinuationOut.vue'
import CourtOrder from '@/views/CourtOrder.vue'
import AmalgamationOut from '@/views/AmalgamationOut.vue'
import ContinuationOut from '@/views/ContinuationOut.vue'
import NoticeOfWithdrawal from '@/views/NoticeOfWithdrawal.vue'
import Signin from '@/views/auth/Signin.vue'
import Signout from '@/views/auth/Signout.vue'
import { DigitalCredentialRoutes } from '@/resources/DigitalCredentialRoutes'
import { Routes } from '@/enums'
import { FilingNames } from '@bcrs-shared-components/enums'

export default [
  {
    path: '/',
    name: Routes.DASHBOARD,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/agm-extension',
    name: Routes.AGM_EXTENSION,
    component: AgmExtension,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: `File ${FilingNames.AGM_EXTENSION}`,
          disabled: false,
          exact: true,
          to: { name: Routes.AGM_EXTENSION }
        }
      ]
    }
  },
  {
    path: '/agm-location-chg',
    name: Routes.AGM_LOCATION_CHANGE,
    component: AgmLocationChg,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: `File ${FilingNames.AGM_LOCATION_CHANGE}`,
          disabled: false,
          exact: true,
          to: { name: Routes.AGM_LOCATION_CHANGE }
        }
      ]
    }
  },
  {
    path: '/amalgamation-selection',
    name: Routes.AMALGAMATION_SELECTION,
    component: AmalgamationSelection,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: 'Amalgamation Selection',
          disabled: false,
          exact: true,
          to: { name: Routes.AMALGAMATION_SELECTION }
        }
      ]
    }
  },
  {
    path: '/annual-report',
    name: Routes.ANNUAL_REPORT,
    component: AnnualReport,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: `File ${FilingNames.ANNUAL_REPORT}`,
          disabled: false,
          exact: true,
          to: { name: Routes.ANNUAL_REPORT }
        }
      ]
    }
  },
  {
    path: '/notice-of-withdrawal',
    name: Routes.NOTICE_OF_WITHDRAWAL,
    component: NoticeOfWithdrawal,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.NOTICE_OF_WITHDRAWAL,
          disabled: false,
          exact: true,
          to: { name: Routes.NOTICE_OF_WITHDRAWAL }
        }
      ]
    }
  },
  {
    path: '/standalone-directors',
    name: Routes.STANDALONE_DIRECTORS,
    component: StandaloneDirectorsFiling,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.CHANGE_OF_DIRECTORS,
          disabled: false,
          exact: true,
          to: { name: Routes.STANDALONE_DIRECTORS }
        }
      ]
    }
  },
  {
    path: '/standalone-addresses',
    name: Routes.STANDALONE_ADDRESSES,
    component: StandaloneOfficeAddressFiling,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.CHANGE_OF_ADDRESS,
          disabled: false,
          exact: true,
          to: { name: Routes.STANDALONE_ADDRESSES }
        }
      ]
    }
  },
  {
    path: '/consent-amalgamation-out',
    name: Routes.CONSENT_AMALGAMATION_OUT,
    component: ConsentAmalgamationOut,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.CONSENT_AMALGAMATION_OUT,
          disabled: false,
          exact: true,
          to: { name: Routes.CONSENT_AMALGAMATION_OUT }
        }
      ]
    }
  },
  {
    path: '/consent-continuation-out',
    name: Routes.CONSENT_CONTINUATION_OUT,
    component: ConsentContinuationOut,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.CONSENT_CONTINUATION_OUT,
          disabled: false,
          exact: true,
          to: { name: Routes.CONSENT_CONTINUATION_OUT }
        }
      ]
    }
  },
  {
    path: '/court-order',
    name: Routes.COURT_ORDER,
    component: CourtOrder,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.COURT_ORDER,
          disabled: false,
          exact: true,
          to: { name: Routes.COURT_ORDER }
        }
      ]
    }
  },
  {
    path: '/amalgamation-out',
    name: Routes.AMALGAMATION_OUT,
    component: AmalgamationOut,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.AMALGAMATION_OUT,
          disabled: false,
          exact: true,
          to: { name: Routes.AMALGAMATION_OUT }
        }
      ]
    }
  },
  {
    path: '/continuation-out',
    name: Routes.CONTINUATION_OUT,
    component: ContinuationOut,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {
          text: FilingNames.CONTINUATION_OUT,
          disabled: false,
          exact: true,
          to: { name: Routes.CONTINUATION_OUT }
        }
      ]
    }
  },
  {
    // this route is selected by router.beforeEach()
    path: '/signin',
    name: Routes.SIGNIN,
    component: Signin,
    meta: {
      requiresAuth: false
    }
  },
  {
    // this route is selected by SbcHeader -> Logout
    path: '/signout',
    name: Routes.SIGNOUT,
    component: Signout,
    props: true,
    meta: {
      requiresAuth: false
    }
  },
  DigitalCredentialRoutes,
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
