import { BreadcrumbIF } from '@/interfaces'

export const RegistryDashboardBreadcrumb: BreadcrumbIF = {
  text: 'BC Registries Dashboard',
  href: `${sessionStorage.getItem('REGISTRY_HOME_URL')}dashboard`
}

export const MyBusinessRegistryBreadcrumb: BreadcrumbIF = {
  text: 'My Business Registry',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}business`
}

export const StaffDashboardBreadcrumb: BreadcrumbIF = {
  text: 'Staff Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}staff`
}
