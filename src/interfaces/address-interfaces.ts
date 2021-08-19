/** Address interface to match the address.json schema plus optional fields. */
export interface AddressIF {
  actions?: string[]
  addressCity: string
  addressCountry: string
  addressRegion: string
  deliveryInstructions?: string
  postalCode: string
  streetAddress: string
  streetAddressAdditional?: string
  addressType?: 'mailing' | 'delivery'
}

/** Office address interface (eg, Registered or Records). */
export interface OfficeAddressIF {
  deliveryAddress: AddressIF
  mailingAddress: AddressIF
}

/** Combined Registered + Records office addresses interface. */
export interface RegRecAddressesIF {
  registeredOffice: OfficeAddressIF
  recordsOffice: OfficeAddressIF
}

/** An empty address object. Note: don't assign this - make a copy instead. */
export const EmptyAddress: AddressIF = {
  streetAddress: '',
  streetAddressAdditional: '',
  addressCity: '',
  addressRegion: '',
  postalCode: '',
  addressCountry: '',
  deliveryInstructions: ''
}
