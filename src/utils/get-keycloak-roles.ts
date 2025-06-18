import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { AuthorizationRoles } from '@/enums'

/** Gets Keycloak roles and returns them. */
export function GetKeycloakRoles (): Array<AuthorizationRoles> {
  const jwt = getJWT()
  const keycloakRoles = (jwt.roles || []) as Array<AuthorizationRoles>
  if (keycloakRoles.length < 1) throw new Error('Invalid Keycloak roles')
  return keycloakRoles

  /** Gets Keycloak JWT and parses it. */
  function getJWT (): any {
    // get KC token (JWT) from session storage
    const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    if (!keycloakToken) throw new Error('Error getting Keycloak token')

    // decode and parse the JWT
    try {
      const base64Url = keycloakToken.split('.')[1]
      const base64 = decodeURIComponent(window.atob(base64Url).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(base64)
    } catch (error) {
      throw new Error('Error parsing JWT - ' + (error instanceof Error ? error.message : String(error)))
    }
  }
}
