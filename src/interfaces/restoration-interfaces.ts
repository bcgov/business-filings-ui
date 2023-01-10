import { RestorationTypes } from '@/enums'

/**
 * A filing's restoration object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/restoration.json
 */
export interface RestorationIF {
  date: string // FUTURE: describe format here
  type: RestorationTypes
  expiry?: string // FUTURE: describe format here
}

/** Restoration filing interface. */
export interface RestorationFilingIF {
  header: {
    bcolAccountNumber?: string
    certifiedBy?: string
    date: string
    datNumber?: string
    effectiveDate?: string
    folioNumber?: string
    name: string
    priority?: boolean
    routingSlipNumber?: string
    waiveFees?: boolean
  }
  business: {
    foundingDate: string
    identifier: string
    legalName: string
    legalType: string
  }
  restoration: RestorationIF
}
