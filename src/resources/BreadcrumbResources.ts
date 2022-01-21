import { BreadcrumbIF } from '@/interfaces'

export const DashboardHomeBreadcrumb: BreadcrumbIF = {
  text: 'BC Registries Dashboard',
  href: `${sessionStorage.getItem('BCROS_HOME_URL')}dashboard`
}

export const RegistryTableBreadcrumb: BreadcrumbIF = {
  text: 'My Business Registry',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}business`
}

export const StaffDashboardBreadcrumb: BreadcrumbIF = {
  text: 'Staff Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}staff`
}
