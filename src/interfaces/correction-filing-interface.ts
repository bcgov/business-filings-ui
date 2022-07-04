import { CorrectionTypes } from '@/enums'
/** Incorporation Application filing loaded from / saved to the Legal API. */
export interface CorrectionFilingIF {
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
  correction: {
    correctedFilingId: string
    correctedFilingType: string
    correctedFilingDate: string
    type?: CorrectionTypes
    comment: string
  },
  incorporationApplication?: {},
  changeOfRegistration?: {},
  registration?: {}
}
