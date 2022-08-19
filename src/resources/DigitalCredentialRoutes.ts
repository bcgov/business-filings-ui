import { Routes } from '@/enums'
import DigitalCredentials from '@/views/DigitalCredentials.vue'
import { getDigitalCredentialBreadcrumb } from '@/resources/BreadcrumbResources'
import { ChooseCredentials, DigitalWalletDownload, ScanCredentials } from '@/components/DigitalCredentials'

export const DigitalCredentialRoutes = {
  path: `/${Routes.DIGITAL_CREDENTIALS}`,
  name: Routes.DIGITAL_CREDENTIALS,
  component: DigitalCredentials,
  meta: {
    requiresAuth: true,
    breadcrumb: [ getDigitalCredentialBreadcrumb() ]
  },
  children: [
    {
      name: Routes.DOWNLOAD_WALLET,
      path: Routes.DOWNLOAD_WALLET,
      component: DigitalWalletDownload,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb(),
          {
            text: 'Download Wallet',
            to: { name: Routes.DOWNLOAD_WALLET }
          }
        ]
      }
    },
    {
      name: Routes.CHOOSE_CREDENTIALS,
      path: Routes.CHOOSE_CREDENTIALS,
      component: ChooseCredentials,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb(),
          {
            text: 'Choose Credentials',
            to: { name: Routes.CHOOSE_CREDENTIALS }
          }
        ]
      }
    },
    {
      name: Routes.SCAN_CREDENTIALS,
      path: Routes.SCAN_CREDENTIALS,
      component: ScanCredentials,
      meta: {
        breadcrumb: [
          getDigitalCredentialBreadcrumb(),
          {
            text: 'Scan Credentials',
            to: { name: Routes.SCAN_CREDENTIALS }
          }
        ]
      }
    }
  ]
}
