import { OfficeAddressIF } from '@/interfaces/address-interfaces'
import { FilingSubTypes } from '@/enums'

/**
 * A filing's dissolution object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/dissolution.json
 */
export interface DissolutionIF {
  custodialOffice: OfficeAddressIF
  dissolutionType: FilingSubTypes
}

/** Dissolution filing interface. */
export interface DissolutionFilingIF {
  header: {
    name: string
    certifiedBy?: string
    date: string
    routingSlipNumber?: string
    folioNumber?: string
    effectiveDate?: string
    bcolAccountNumber?: string
    datNumber?: string
    waiveFees?: boolean
    priority?: boolean
  }
  business: {
    legalType: string
    legalName: string
    identifier: string
    foundingDate: string
  }
  dissolution: DissolutionIF
}
