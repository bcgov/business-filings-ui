/**
 * Authorization roles, as provided by Auth API "authorizations" endpoint.
 * - There are many more roles but we only care about these right now.
 * - We will add roles (aka permissions or actions) to control specific functionality
 *   and to replace the local config in utils/Authorizations.ts.
 *
 * At the moment, we have the follow "account types":
 * 1. SBC Contact Centre (formerly BCOL HD) - have "contact_centre_staff" role
 * 2. MAXIMUS - have "maximus_staff" role
 * 3. SBC (field offices) - have "sbc_staff" role
 * 4. staff (BC Registries) - have "staff" role
 * 5. clients (regular users) - have "view" role and none of the above
 */
export enum AuthorizationRoles {
  CONTACT_CENTRE_STAFF = 'contact_centre_staff',
  MAXIMUS_STAFF = 'maximus_staff',
  SBC_STAFF = 'sbc_staff',
  STAFF = 'staff',
  VIEW = 'view'
}
