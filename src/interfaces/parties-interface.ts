import { AddressIF, OfficerIF } from '@/interfaces'

export interface PartiesIF {
  officer: OfficerIF
  roles: Array<string>
  mailingAddress: AddressIF
  deliveryAddress?: AddressIF
}
