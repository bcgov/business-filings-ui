import { BreadcrumbIF } from '@/interfaces'
import { Routes } from '@/enums'

/** Returns URL param string with Account ID if present, else empty string. */
function getParams (): string {
  const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
  return accountId ? `?accountid=${accountId}` : ''
}

export function getRegistryDashboardBreadcrumb (registryHomeUrl: string): BreadcrumbIF {
  return {
    text: 'BC Registries Dashboard',
    href: `${registryHomeUrl}dashboard/${getParams()}`
  }
}

export function getMyBusinessRegistryBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'My Business Registry',
    href: `${businessUrl}business/${getParams()}`
  }
}

export function getStaffDashboardBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'Staff Dashboard',
    href: `${businessUrl}staff/${getParams()}`
  }
}

/** Default Crumb for Digital Credentials Pilot. **/
export function getDigitalCredentialBreadcrumb (): BreadcrumbIF {
  return {
    text: 'Business Digital Credentials',
    to: { name: Routes.DIGITAL_CREDENTIALS }
  }
}
