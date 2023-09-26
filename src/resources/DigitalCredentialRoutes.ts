import { Routes } from '@/enums'
import DigitalCredentials from '@/views/DigitalCredentials.vue'
import { getDigitalCredentialBreadcrumb } from '@/resources/BreadcrumbResources'
// import { DigitalWalletDownload, IssueCredentials, RegisterWallet } from '@/components/DigitalCredentials'
import { CredentialsLanding, CredentialsStepper } from '@/components/DigitalCredentials'

export const DigitalCredentialRoutes = {
  path: `/${Routes.DIGITAL_CREDENTIALS}`,
  // name: Routes.DIGITAL_CREDENTIALS,
  component: DigitalCredentials,
  meta: {
    requiresAuth: true,
    breadcrumb: [getDigitalCredentialBreadcrumb()]
  },
  children: [
    {
      path: '',
      name: Routes.DIGITAL_CREDENTIALS,
      component: CredentialsLanding,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb()
        ]
      }
    },
    {
      name: Routes.ISSUE,
      path: Routes.ISSUE,
      component: CredentialsStepper,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb(),
          {
            text: 'Issue Credentials',
            to: { name: Routes.ISSUE }
          }
        ]
      }
    }
  ]
}
