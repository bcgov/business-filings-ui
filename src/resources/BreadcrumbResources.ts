import { BreadcrumbIF } from '@/interfaces'

export const HomeBreadCrumb: BreadcrumbIF = {
  text: 'Business Registry Home',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}`
}

export const DashboardBreadcrumb: BreadcrumbIF = {
  text: 'My Business Registry',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}business`
}

export const StaffDashboardBreadcrumb: BreadcrumbIF = {
  text: 'Staff Dashboard',
  href: `${sessionStorage.getItem('BUSINESSES_URL')}staff`
}
