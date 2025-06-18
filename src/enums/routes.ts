import { Routes as DCRoutes } from '@/components/DigitalCredentials/enums/routes'

export enum CoreRoutes {
  AGM_EXTENSION = 'agm-extension',
  AGM_LOCATION_CHANGE = 'agm-location-chg',
  AMALGAMATION_OUT= 'amalgamation-out',
  AMALGAMATION_SELECTION = 'amalgamation-selection',
  ANNUAL_REPORT = 'annual-report',
  CONSENT_AMALGAMATION_OUT = 'consent-amalgamation-out',
  CONSENT_CONTINUATION_OUT = 'consent-continuation-out',
  CONTINUATION_OUT = 'continuation-out',
  COURT_ORDER = 'court-order',
  DEFAULT = 'default',
  NOTICE_OF_WITHDRAWAL = 'notice-of-withdrawal',
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
