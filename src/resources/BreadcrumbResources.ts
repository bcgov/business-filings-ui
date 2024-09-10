import { BreadcrumbIF } from '@bcrs-shared-components/interfaces'
import { Routes } from '@/enums'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'
import { GetFeatureFlag } from '@/utils'

setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

/** Returns URL param string with Account ID if present, else empty string. */
function getParams (): string {
  const accountId = authenticationStore.getCurrentAccount?.id || 0
  return accountId ? `?accountid=${accountId}` : ''
}

/** Returns the breadcrumb to the BC Registries dashboard. */
export function getRegistryDashboardBreadcrumb (registryHomeUrl: string): BreadcrumbIF {
  return {
    text: 'BC Registries Dashboard',
    href: `${registryHomeUrl}dashboard/${getParams()}`
  }
}

/** Returns the breadcrumb to the My Business Registry page. */
export function getMyBusinessRegistryBreadcrumb (businessUrl: string): BreadcrumbIF {
  const accountId = authenticationStore.getCurrentAccount?.id || 0
  return {
    text: 'My Business Registry',
    href: `${businessUrl}account/${accountId}/business`
  }
}

/** Returns the breadcrumb to the Staff dashboard. */
export function getStaffDashboardBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'Staff Dashboard',
    href: `${businessUrl}staff/dashboard/active`
  }
}

/** Returns the breadcrumb to the Digital Credentials page. **/
export function getDigitalCredentialBreadcrumb (): BreadcrumbIF {
  return {
    text: 'Business Digital Credentials',
    to: { name: Routes.DIGITAL_CREDENTIALS }
  }
}

/** Returns the breadcrumb to the appropriate dashboard based on the feature flag. */
export function getDashboardBreadcrumb (entityName: string, businessDashUrl: string, identifier: string): BreadcrumbIF {
  if (GetFeatureFlag('use-business-dashboard')) {
    return {
      text: entityName || 'Unknown Name',
      href: `${businessDashUrl}/${identifier}`
    }
  } else {
    return {
      text: entityName || 'Unknown Name',
      to: { name: Routes.DASHBOARD }
    }
  }
}
