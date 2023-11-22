import { PartyIF } from './party-interface'

/** A filing's registration object from the API, ie, `filing.registration`. */
export interface FilingRegistrationIF {
  business: any
  header: any
  registration: {
    parties: Array<PartyIF>
  }
}
