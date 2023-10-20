import { Routes } from '@/enums'
import DigitalCredentials from '@/views/DigitalCredentials.vue'
import { getDigitalCredentialBreadcrumb } from '@/resources/BreadcrumbResources'
import { CredentialsDashboard, CredentialsStepper } from '@/components/DigitalCredentials'

export const DigitalCredentialRoutes = {
  path: `/${Routes.DIGITAL_CREDENTIALS}`,
  component: DigitalCredentials,
  meta: {
    requiresAuth: true,
    breadcrumb: [getDigitalCredentialBreadcrumb()]
  },
  children: [
    {
      path: '',
      name: Routes.DIGITAL_CREDENTIALS,
      component: CredentialsDashboard,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb()
        ]
      }
    },
    {
      path: Routes.ISSUE_CREDENTIAL,
      name: Routes.ISSUE_CREDENTIAL,
      component: CredentialsStepper,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb(),
          {
            text: 'Issue Credentials',
            to: { name: Routes.ISSUE_CREDENTIAL }
          }
        ]
      }
    }
  ]
}
