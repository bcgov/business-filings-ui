import { Routes } from '@/enums'
import DigitalCredentials from '@/views/DigitalCredentials.vue'
import { CredentialsDashboard, CredentialsStepper } from '@/components/DigitalCredentials'

export const DigitalCredentialRoutes = {
  path: `/${Routes.DIGITAL_CREDENTIALS}`,
  component: DigitalCredentials,
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: '',
      name: Routes.DIGITAL_CREDENTIALS,
      component: CredentialsDashboard,
      meta: {
        breadcrumb: [
          {
            text: 'Business Digital Credentials',
            to: { name: Routes.DIGITAL_CREDENTIALS }
          }
        ]
      }
    },
    {
      path: Routes.ISSUE_CREDENTIAL,
      name: Routes.ISSUE_CREDENTIAL,
      component: CredentialsStepper,
      meta: {
        breadcrumb: [
          {
            text: 'Business Digital Credentials',
            to: { name: Routes.DIGITAL_CREDENTIALS }
          },
          {
            text: 'Issue Credentials',
            to: { name: Routes.ISSUE_CREDENTIAL }
          }
        ]
      }
    }
  ]
}
