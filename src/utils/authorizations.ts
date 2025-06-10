import { useRootStore } from '@/stores/rootStore'
import { AuthorizationRoles, AuthorizedActions } from '@/enums'

/**
 * Whether the specified action is authorized for the current user.
 * Ultimately we'll just check if the auth roles includes the specified action.
 * @returns True or False
 */
export function IsAuthorized (action: AuthorizedActions): boolean {
  switch (true) {
    case isBusinessRegistryStaff(): return BusinessRegistryStaffActions.includes(action)
    case isMaximusStaff(): return MaximusStaffActions.includes(action)
    case isContactCentreStaff(): return ContactCentreStaffActions.includes(action)
    case isSbcFieldOfficeStaff(): return SbcFieldOfficeStaffActions.includes(action)
    case isPublicUser(): return PublicUserActions.includes(action)
    default: return false
  }
}

/**
 * Whether the user is Business Registry Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isBusinessRegistryStaff (): boolean {
  const store = useRootStore()
  return store.getAuthRoles.includes(AuthorizationRoles.STAFF)
}

/**
 * Whether the user is Maximus Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isMaximusStaff (): boolean {
  const store = useRootStore()
  return store.getAuthRoles.includes(AuthorizationRoles.MAXIMUS_STAFF)
}

/**
 * Whether the user is Contact Centre Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isContactCentreStaff (): boolean {
  const store = useRootStore()
  return store.getAuthRoles.includes(AuthorizationRoles.CONTACT_CENTRE_STAFF)
}

/**
 * Whether the user is SBC Field Office Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isSbcFieldOfficeStaff (): boolean {
  const store = useRootStore()
  return store.getAuthRoles.includes(AuthorizationRoles.SBC_STAFF)
}

/**
 * Whether the user is a Public User.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isPublicUser (): boolean {
  const store = useRootStore()
  return store.getAuthRoles.includes(AuthorizationRoles.PUBLIC_USER)
}

/**
 * The roles if the user is Business Registry Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const BusinessRegistryStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ADMIN_DISSOLUTION_FILING,
  AuthorizedActions.AGM_CHG_LOCATION_FILING,
  AuthorizedActions.AGM_EXTENSION_FILING,
  AuthorizedActions.AMALGAMATION_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActions.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActions.COURT_ORDER_POA,
  AuthorizedActions.DETAIL_COMMENTS,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.EDITABLE_COMPLETING_PARTY,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.NO_COMPLETING_PARTY_MESSAGE_BOX,
  AuthorizedActions.NO_CONTACT_INFO,
  AuthorizedActions.NOTICE_WITHDRAWAL_FILING,
  AuthorizedActions.OVERRIDE_NIGS,
  AuthorizedActions.STAFF_BREADCRUMBS,
  AuthorizedActions.STAFF_COMMENTS,
  AuthorizedActions.STAFF_FILINGS,
  AuthorizedActions.STAFF_PAYMENT,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const MaximusStaffActions = [
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
const ContactCentreStaffActions = [
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
const SbcFieldOfficeStaffActions = [
  AuthorizedActions.ADDRESS_CHANGE_FILING,
  AuthorizedActions.ANNUAL_REPORT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.COURT_ORDER_POA,
  AuthorizedActions.DIRECTOR_CHANGE_FILING,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.EDITABLE_COMPLETING_PARTY,
  AuthorizedActions.DETAIL_COMMENTS,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SBC_BREADCRUMBS,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles for a regular public user.
 * Ultimately won't need this list and we'll just check keycloak for everything.
 */

const PublicUserActions = [
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
