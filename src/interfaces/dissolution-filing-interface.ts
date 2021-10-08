/** Dissolution filing. */
import { OfficeAddressIF } from '@/interfaces/address-interfaces'

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
  }
  dissolution: {
    custodialOffice: OfficeAddressIF
  }
}
