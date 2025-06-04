/**
 * Authorization roles from Keycloak token. There are many more roles but we only care
 * about these ones:
 * 1. contact_centre_staff - SBC Contact Centre staff (formerly BCOL Help Desk)
 * 2. maximus_staff - MAXIMUS staff
 * 3. public_user - public users (regular users)
 * 4. sbc_staff - SBC field offices
 * 5. staff - REGI staff
 */
export enum AuthorizationRoles {
  CONTACT_CENTRE_STAFF = 'contact_centre_staff',
  MAXIMUS_STAFF = 'maximus_staff',
  PUBLIC_USER = 'public_user',
  SBC_STAFF = 'sbc_staff',
  STAFF = 'staff'
}
