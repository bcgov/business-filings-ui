import { OfficeAddressIF } from '@/interfaces/address-interfaces'
import { FilingSubTypes } from '@/enums'

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
  dissolution: {
    custodialOffice: OfficeAddressIF,
    dissolutionType: FilingSubTypes
  }
}
