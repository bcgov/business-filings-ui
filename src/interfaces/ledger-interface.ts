import { EffectOfOrderTypes, FilingStatus, FilingTypes } from '@/enums'

/** A ledger item from the API (ie, list item from `filings` call). */
export interface LedgerIF {
  availableOnPaperOnly: boolean
  businessIdentifier: string
  correctionFilingId: string // ID of this filing's correction
  correctionFilingStatus: string // status of this filing's correction
  displayName: string
  effectiveDate: string // full date-time in UTC format
  filingId: number
  isFutureEffective: boolean
  name: FilingTypes
  paymentToken: string // NB: leave as string as this will be UUID in future
  status: FilingStatus
  submittedDate: string // full date-time in UTC format
  submitter: string

  commentsLink?: string // URL to fetch this filing's comments
  correctedLink?: string // URL to fetch this corrections's original filing (corrections only)
  correctionLink?: string // URL to fetch this filing's correction
  documentsLink?: string // URL to fetch this filing's documents
  filingLink?: string // URL to fetch this filing

  // optional, filing-specific data
  data?: {
    // staff filings only
    orderDetails?: string
    fileNumber?: string
    effectOfOrder?: string

    // alterations only
    newLegalType?: string
    oldLegalType?: string
    courtOrder?: {
      effectOfOrder: EffectOfOrderTypes
      fileNumber: string
    }
  }
}
