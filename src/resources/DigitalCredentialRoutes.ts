import { Routes } from '@/enums'
import DigitalCredentials from '@/views/DigitalCredentials.vue'
import { getDigitalCredentialBreadcrumb } from '@/resources/BreadcrumbResources'
// import { DigitalWalletDownload, IssueCredentials, RegisterWallet } from '@/components/DigitalCredentials'
import { IssueCredentials } from '@/components/DigitalCredentials'

export const DigitalCredentialRoutes = {
  path: `/${Routes.DIGITAL_CREDENTIALS}`,
  name: Routes.DIGITAL_CREDENTIALS,
  component: DigitalCredentials,
  meta: {
    requiresAuth: true,
    breadcrumb: [getDigitalCredentialBreadcrumb()]
  },
  children: [
    // {
    //   name: Routes.DOWNLOAD_WALLET,
    //   path: Routes.DOWNLOAD_WALLET,
    //   component: DigitalWalletDownload,
    //   meta: {
    //     breadcrumb: [
    //       getDigitalCredentialBreadcrumb(),
    //       {
    //         text: 'Download Wallet',
    //         to: { name: Routes.DOWNLOAD_WALLET }
    //       }
    //     ]
    //   }
    // },
    // {
    //   name: Routes.REGISTER_WALLET,
    //   path: Routes.REGISTER_WALLET,
    //   component: RegisterWallet,
    //   meta: {
    //     breadcrumb: [
    //       getDigitalCredentialBreadcrumb(),
    //       {
    //         text: 'Register Wallet',
    //         to: { name: Routes.REGISTER_WALLET }
    //       }
    //     ]
    //   }
    // },
    {
      name: Routes.ISSUE,
      path: Routes.ISSUE,
      component: IssueCredentials,
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
