import { useRootStore } from '@/stores/rootStore'
import { AccountTypes, AuthorizationRoles, AuthorizedActions } from '@/enums'

/**
 * Whether the specified action is authorized for the current user.
 * Ultimately we'll just check if the auth roles includes the specified action.
 * @returns True or False
 */
export function IsAuthorized (action: AuthorizedActions): boolean {
  switch (true) {
    case isBusinessRegistryStaff(): return BusinessRegistryStaffRoles.includes(action)
    case isMaximusStaff(): return MaximusStaffRoles.includes(action) // NOSONAR - need it id roles required
    case isContactCentreStaff(): return ContactCentreStaffRoles.includes(action) // NOSONAR - need to id roles
    case isSbcFieldOfficeStaff(): return SbcFieldOfficeStaffRoles.includes(action)
    default: return DefaultRoles.includes(action)
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
  // NOSONAR *** return store.getAuthRoles.includes(AuthorizationRoles.SBC_STAFF) TODO: uncomment this after #27536
  // NOSONAR *** TODO: delete next line after #27536
  return (store.getAccountInformation.accountType === AccountTypes.SBC_STAFF)
}

/**
 * The roles if the user is Business Registry Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const BusinessRegistryStaffRoles = [
  AuthorizedActions.ADMIN_DISSOLUTION_FILING,
  AuthorizedActions.AMALGAMATION_OUT_FILING,
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.CONTINUATION_OUT_FILING,
  AuthorizedActions.COURT_ORDER_FILING,
  AuthorizedActions.COURT_ORDER_POA,
  AuthorizedActions.DETAIL_COMMENTS,
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
  AuthorizedActions.STAFF_PAYMENT,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const MaximusStaffRoles = []

/**
 * The roles if the user is Contact Centre Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const ContactCentreStaffRoles = []

/**
 * The roles if the user is SBC Field Office Staff (aka SBC Staff Tier 2).
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const SbcFieldOfficeStaffRoles = [
  AuthorizedActions.BLANK_CERTIFY_STATE,
  AuthorizedActions.EDITABLE_CERTIFY_NAME,
  AuthorizedActions.DETAIL_COMMENTS,
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING,
  AuthorizedActions.SBC_BREADCRUMBS,
  AuthorizedActions.THIRD_PARTY_CERTIFY_STMT
]

/**
 * The roles if the user is none of the other types.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const DefaultRoles = [
  AuthorizedActions.FILE_AND_PAY,
  AuthorizedActions.INCORPORATION_APPLICATION_FILING
]
