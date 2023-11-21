import { PartyIF } from './party-interface'

/** A filing's registration object from the API, ie, `filing.registration`. */
export interface FilingRegistraionIF {
  business: any,
  businessType: string,
  businessTypeConfirm: boolean,
  contactPoint: any,
  isAutoPopulatedBusinessNumber: boolean,
  nameRequest: any,
  offices: any,
  parties: PartyIF[],
  startDate: string,
}
