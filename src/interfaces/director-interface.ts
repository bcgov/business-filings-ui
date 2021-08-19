import { AddressIF, EmptyAddress, OfficerIF, EmptyOfficer } from '@/interfaces'
import { Actions } from '@/enums'

export interface DirectorIF {
  id: number
  officer: OfficerIF
  deliveryAddress: AddressIF
  mailingAddress?: AddressIF
  appointmentDate: string
  cessationDate: string
  cessationDateTemp?: string
  isFeeApplied?: boolean
  isDirectorActionable?: boolean
  actions: Array<Actions>
}

/** An empty director object. Note: don't assign this - make a deep copy instead. */
export const EmptyDirector: DirectorIF = {
  id: null,
  officer: { ...EmptyOfficer },
  deliveryAddress: { ...EmptyAddress },
  mailingAddress: { ...EmptyAddress },
  appointmentDate: null,
  cessationDate: null,
  cessationDateTemp: null,
  actions: []
}
