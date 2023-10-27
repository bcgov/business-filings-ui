import { Routes as DCRoutes } from '@/components/DigitalCredentials/enums/routes'

export enum CoreRoutes {
  AGM_EXTENSION = 'agm-extension',
  AGM_LOCATION_CHG = 'agm-location-chg',
  ANNUAL_REPORT = 'annual-report',
  CONSENT_CONTINUATION_OUT = 'consent-continuation-out',
  CONTINUATION_OUT = 'continuation-out',
  CORRECTION = 'correction',
  DASHBOARD = 'dashboard',
  STANDALONE_ADDRESSES = 'standalone-addresses',
  STANDALONE_DIRECTORS = 'standalone-directors',
  SIGNIN = 'signin',
  SIGNOUT = 'signout',
}

export { DCRoutes }

// Combined routes
export type Routes = CoreRoutes | DCRoutes
export const Routes = {
  ...CoreRoutes,
  ...DCRoutes
}
