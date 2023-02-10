/** The ROOT state model interface. */
export interface CurrentUserIF {
  email: string
  firstName: string
  fullName: string
  keycloakGuid: string
  lastName: string
  loginSource: string
  roles: Array<string>
  userName: string
}
