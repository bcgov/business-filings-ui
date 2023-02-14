import { BreadcrumbIF } from '@/interfaces'
import { Routes } from '@/enums'

/** Returns URL param string with Account ID if present, else empty string. */
function getParams (): string {
  const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
  return accountId ? `?accountid=${accountId}` : ''
}

export function getRegistryDashboardBreadcrumb (registry_home_url: string): BreadcrumbIF {
  return {
    text: 'BC Registries Dashboard',
    href: `${registry_home_url}dashboard/${getParams()}`
  }
}

export function getMyBusinessRegistryBreadcrumb (business_url: string): BreadcrumbIF {
  return {
    text: 'My Business Registry',
    href: `${business_url}business/${getParams()}`
  }
}

export function getStaffDashboardBreadcrumb (business_url: string): BreadcrumbIF {
  return {
    text: 'Staff Dashboard',
    href: `${business_url}staff/${getParams()}`
  }
}

/** Default Crumb for Digital Credentials Pilot. **/
export function getDigitalCredentialBreadcrumb (): BreadcrumbIF {
  return {
    text: 'Business Digital Credentials',
    to: { name: Routes.DIGITAL_CREDENTIALS }
  }
}
