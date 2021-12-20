import { BreadcrumbIF } from '@/interfaces'

export const dashboardBreadcrumb: BreadcrumbIF = {
  text: 'BC Registries Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}business`
}

export const staffDashboardBreadcrumb: BreadcrumbIF = {
  text: 'Staff Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}staff`
}
