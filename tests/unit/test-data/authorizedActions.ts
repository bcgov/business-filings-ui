import { AuthorizedActions } from '@/enums'

/**
 * The roles if the user is Business Registry Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
export const BusinessRegistryStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ADMIN_DISSOLUTION_FILING,
  AuthorizedActions.AGM_CHG_LOCATION_FILING,
  AuthorizedActions.AGM_EXTENSION_FILING,
  AuthorizedActions.AMALGAMATION_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActions.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActions.COURT_ORDER_FILING,
  AuthorizedActions.COURT_ORDER_POA,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.EDITABLE_COMPLETING_PARTY,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.NO_COMPLETING_PARTY_MESSAGE_BOX,
  AuthorizedActions.NO_CONTACT_INFO,
  AuthorizedActions.NOTICE_WITHDRAWAL_FILING,
  AuthorizedActions.OVERRIDE_NIGS,
  AuthorizedActions.SAVE_DRAFT,
  AuthorizedActions.STAFF_BREADCRUMBS,
  AuthorizedActions.STAFF_FILINGS,
  AuthorizedActions.STAFF_PAYMENT,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
export const MaximusStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SBC_BREADCRUMBS,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is Contact Centre Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
export const ContactCentreStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SBC_BREADCRUMBS,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is SBC Field Office Staff (aka SBC Staff Tier 2).
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
export const SbcFieldOfficeStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.COURT_ORDER_POA,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.EDITABLE_COMPLETING_PARTY,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SAVE_DRAFT,
  AuthorizedActions.SBC_BREADCRUMBS,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles for a regular public user.
 * Ultimately won't need this list and we'll just check keycloak for everything.
 */

export const PublicUserActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.AGM_CHG_LOCATION_FILING,
  AuthorizedActions.AGM_EXTENSION_FILING,
  AuthorizedActions.AMALGAMATION_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActions.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActions.DIGITAL_CREDENTIALS,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SAVE_DRAFT
]
