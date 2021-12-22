import { BreadcrumbIF } from '@/interfaces'

export const homeBreadCrumb: BreadcrumbIF = {
  text: 'Business Registry Home',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}`
}

export const dashboardBreadcrumb: BreadcrumbIF = {
  text: 'My Business Registry',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}business`
}

export const staffDashboardBreadcrumb: BreadcrumbIF = {
  text: 'Staff Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}staff`
}
