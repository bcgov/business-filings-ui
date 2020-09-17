import { IncorporationApplicationIF } from '@/interfaces/incorporation-interfaces'

/** Incorporation Application filing loaded from / saved to the Legal API. */
export interface CorrectionFilingIF {
  header: {
    name: string
    certifiedBy: string
    date: string
    routingSlipNumber?: string
    folioNumber?: string
    effectiveDate?: string
  }
  business: {
    legalType: string
    legalName: string
    identifier: string
  }
  correction: {
    correctedFilingId: string
    correctedFilingType: string
    correctedFilingDate: string
    comment: string
    incorporationApplication?: IncorporationApplicationIF
  }
}
