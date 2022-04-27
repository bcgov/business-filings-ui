import { AddressIF, OfficerIF, RoleIF } from '@/interfaces'

export interface PartyIF {
  officer: OfficerIF
  roles: Array<RoleIF>
  mailingAddress: AddressIF
  deliveryAddress?: AddressIF
}
