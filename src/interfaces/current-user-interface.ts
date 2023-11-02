/** The Current User (aka: Keycloak) interface. */
export interface CurrentUserIF {
  email: string
  firstname: string
  keycloakGuid: string
  lastname: string
  loginSource: string
  roles: Array<string>
  type: string
}
